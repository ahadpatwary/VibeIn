import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import type { Redis, Cluster } from 'ioredis';
import { RedisService } from '../modules/cache/redis.service';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const TTL = {
  session: 60 * 60 * 24 * 30, // 30 days, in seconds
} as const;

/* ------------------------------------------------------------------ */
/* Schema & Types                                                      */
/* ------------------------------------------------------------------ */

const revokeReasonSchema = z.enum([
  'USER_LOGOUT',
  'LOGOUT_ALL_DEVICES',
  'PASSWORD_CHANGE',
  'EMAIL_CHANGE',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_DELETED',
  'TOKEN_REUSE_DETECTED',
  'ADMIN_REVOKE',
  'SECURITY_EVENT',
]);
export type RevokeReason = z.infer<typeof revokeReasonSchema>;

export const sessionDataSchema = z.object({
  sessionId: z.string().trim().min(5),
  userId: z.string().trim().min(4),
  accountId: z.string().trim().min(4),
  deviceId: z.string().trim().min(4),

  status: z.enum(['ACTIVE', 'REVOKED']),
  reason: revokeReasonSchema.optional(), // set only once status === 'REVOKED'

  deviceName: z.string().trim().min(3),
  platform: z.enum(['ANDROID', 'WINDOWS', 'MAC', 'IOS', 'WEB']),
  browser: z.string().trim().min(3),

  ip: z.string().trim().min(7),
  createdAt: z.coerce.number().int().min(1),
  lastActivityAt: z.coerce.number().int().min(1),
  expiredAt: z.coerce.number().int().min(1),
});

export type SessionData = z.infer<typeof sessionDataSchema>;

/* ------------------------------------------------------------------ */
/* Redis keys                                                           */
/* Hash-tagged on userId so a user's session hash + session-set always */
/* map to the same cluster slot -> multi()/EVAL stay atomic on Cluster */
/* ------------------------------------------------------------------ */

const KEYS = {
  session: (userId: string, sessionId: string) => `session:{${userId}}:${sessionId}`,
  userSessions: (userId: string) => `user-sessions:{${userId}}`,
};

/* ------------------------------------------------------------------ */
/* Lua scripts                                                         */
/* ------------------------------------------------------------------ */

// KEYS[1] = user-sessions set key
// ARGV[1] = reason
// ARGV[2] = userId (needed to rebuild each session hash key)
const LUA_REVOKE_ALL_SESSIONS = `
local setKey = KEYS[1]
local reason = ARGV[1]
local userId = ARGV[2]

local sessionIds = redis.call('SMEMBERS', setKey)

for _, sessionId in ipairs(sessionIds) do
    local sessionHashKey = 'session:{' .. userId .. '}:' .. sessionId
    if redis.call('EXISTS', sessionHashKey) == 1 then
        redis.call('HSET', sessionHashKey, 'status', 'REVOKED', 'reason', reason)
    end
end

redis.call('DEL', setKey)

return #sessionIds
`;

/* ------------------------------------------------------------------ */
/* Errors                                                               */
/* ------------------------------------------------------------------ */

export class SessionServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SessionServiceError';
  }
}

/* ------------------------------------------------------------------ */
/* Service                                                              */
/* ------------------------------------------------------------------ */

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly redisService: RedisService) {}

  private get client(): Redis | Cluster {
    return this.redisService.getClient()!;
  }

  /**
   * Persist a new session and register it in the user's session set.
   */
  async createSession(payload: SessionData): Promise<string> {
    const data = this.parseOrThrow(payload);

    const hashKey = KEYS.session(data.userId, data.sessionId);
    const setKey = KEYS.userSessions(data.userId);

    try {
      const results = await this.client
        .multi()
        .hset(hashKey, this.toRedisHash(data))
        .sadd(setKey, data.sessionId)
        .expire(hashKey, TTL.session)
        .expire(setKey, TTL.session)
        .exec();

      this.assertNoPipelineErrors(results, 'createSession');

      return data.sessionId;
    } catch (error) {
      this.logger.error(`Failed to create session for user ${data.userId}`, error as Error);
      throw new SessionServiceError('Failed to create session', error);
    }
  }

  /**
   * Revoke session(s) for a user based on the given reason.
   * USER_LOGOUT only revokes the single session; every other reason
   * revokes ALL sessions belonging to the user.
   */
  async revokeSession(sessionId: string, userId: string, reason: RevokeReason): Promise<void> {
    revokeReasonSchema.parse(reason);

    if (reason === 'USER_LOGOUT') {
      await this.revokeSingleSession(sessionId, userId, reason);
      return;
    }

    await this.revokeAllSessions(userId, reason);
  }

  /**
   * Return all known sessions for a user (active + recently revoked,
   * as long as the hash hasn't expired yet).
   */
  async listDevices(userId: string): Promise<SessionData[]> {
    const setKey = KEYS.userSessions(userId);

    try {
      const sessionIds = await this.client.smembers(setKey);
      if (sessionIds.length === 0) return [];

      const pipeline = this.client.pipeline();
      sessionIds.forEach((sessionId) => {
        pipeline.hgetall(KEYS.session(userId, sessionId));
      });

      const results = (await pipeline.exec()) ?? [];
      const sessions: SessionData[] = [];
      const staleSessionIds: string[] = [];

      results.forEach(([err, raw], index) => {
        const sessionId = sessionIds[index];

        if (err) {
          this.logger.warn(`Failed to read session ${sessionId}: ${err.message}`);
          return;
        }

        const record = raw as Record<string, string>;
        if (!record || Object.keys(record).length === 0) {
          // hash expired via TTL but the id is still lingering in the set
          staleSessionIds.push(sessionId);
          return;
        }

        const parsed = sessionDataSchema.safeParse(record);
        if (!parsed.success) {
          this.logger.warn(`Corrupt session data for ${sessionId}: ${parsed.error.message}`);
          return;
        }

        sessions.push(parsed.data);
      });

      if (staleSessionIds.length > 0) {
        this.client.srem(setKey, ...staleSessionIds).catch((err: Error) => {
          this.logger.warn(`Failed to clean up stale session ids: ${err.message}`);
        });
      }

      return sessions;
    } catch (error) {
      this.logger.error(`Failed to list devices for user ${userId}`, error as Error);
      throw new SessionServiceError('Failed to retrieve device list', error);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Internal helpers                                                   */
  /* ---------------------------------------------------------------- */

  private async revokeSingleSession(
    sessionId: string,
    userId: string,
    reason: RevokeReason,
  ): Promise<void> {
    const hashKey = KEYS.session(userId, sessionId);
    const setKey = KEYS.userSessions(userId);

    try {
      const results = await this.client
        .multi()
        .srem(setKey, sessionId)
        .hset(hashKey, { status: 'REVOKED', reason })
        .exec();

      this.assertNoPipelineErrors(results, 'revokeSingleSession');
    } catch (error) {
      this.logger.error(`Failed to revoke session ${sessionId}`, error as Error);
      throw new SessionServiceError('Failed to revoke session', error);
    }
  }

  private async revokeAllSessions(userId: string, reason: RevokeReason): Promise<number> {
    const setKey = KEYS.userSessions(userId);

    try {
      const revokedCount = (await this.client.eval(
        LUA_REVOKE_ALL_SESSIONS,
        1,
        setKey,
        reason,
        userId,
      )) as number;

      return revokedCount;
    } catch (error) {
      this.logger.error(`Failed to revoke all sessions for user ${userId}`, error as Error);
      throw new SessionServiceError('Failed to revoke all sessions', error);
    }
  }

  private parseOrThrow(data: unknown): SessionData {
    const result = sessionDataSchema.safeParse(data);
    if (!result.success) {
      throw new SessionServiceError(`Invalid session data: ${result.error.message}`);
    }
    return result.data;
  }

  /** Redis hashes only store strings, so every field needs stringifying. */
  private toRedisHash(data: SessionData): Record<string, string> {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]), 
    );
  }

  private assertNoPipelineErrors(
    results: Array<[Error | null, unknown]> | null,
    context: string,
  ): void {
    if (!results) {
      throw new SessionServiceError(`${context}: empty pipeline result`);
    }
    results.forEach(([err], index) => {
      if (err) {
        throw new SessionServiceError(`${context}: command ${index} failed - ${err.message}`);
      }
    });
  }
}