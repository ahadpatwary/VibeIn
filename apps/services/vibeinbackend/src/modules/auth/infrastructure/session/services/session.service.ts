import { Inject, Injectable, Logger } from '@nestjs/common';
import { StoreService } from '../infrastructure/redis.service';
import { KEYS, RevokeReason, TTL } from '../constants/constant';
import { SessionServiceError } from '../errors/exception';
import {
   revokeReasonSchema,
   RevokeReasonType,
   SessionData,
   sessionDataSchema,
} from '../schemas/schema';

@Injectable()
export class SessionService {
   private readonly logger = new Logger(SessionService.name);

   constructor(
      @Inject('STORE_SERVICE')
      private readonly storeService: StoreService,
   ) {}

   async createSession(payload: SessionData): Promise<string> {
      const data = this.parseOrThrow(payload);

      const hashKey = KEYS.session(data.userId, data.sessionId);
      const setKey = KEYS.userSessions(data.userId);

      const jsonData = JSON.stringify(data);

      await this.storeService.createSession(hashKey, jsonData, setKey, data.sessionId, TTL.session);

      return data.sessionId;
   }

   /**
    * find the session
    * check session active or not
    *    -> if session not active, return reason
    * change session.ref wiht new refresh token.
    */
   // async rotateSession(refreshToken: string): Promise<void> {
   //    const rotated = await this.sessions.rotate(refreshToken);
   //    const state = await this.userState.get(rotated.userId);
   //    if (!state || state.status !== UserStatus.Active) {
   //       await this.sessions.revoke(rotated.sessionId, rotated.userId);
   //       throw new InvalidSessionError();
   //    }
   //    const accessToken = await this.signer.sign({
   //       sub: rotated.userId,
   //       sid: rotated.sessionId,
   //       roles: state.roles,
   //    });
   //    return { accessToken, refreshToken: rotated.refreshToken };
   // }

   /**
    * Revoke session(s) for a user based on the given reason.
    * USER_LOGOUT only revokes the single session; every other reason
    * revokes ALL sessions belonging to the user.
    */
   async revokeSession(sessionId: string, userId: string, reason: RevokeReasonType): Promise<void> {
      revokeReasonSchema.parse(reason);

      if (reason === RevokeReason.USER_LOGOUT) {
         await this.revokeSingleSession(sessionId, userId, reason);
         return;
      }

      await this.revokeAllSessions(userId, reason);
   }

   private async revokeSingleSession(
      sessionId: string,
      userId: string,
      reason: RevokeReasonType,
   ): Promise<void> {
      const hashKey = KEYS.session(userId, sessionId);
      const setKey = KEYS.userSessions(userId);

      await this.storeService.revokeSingleSession(hashKey, setKey, sessionId, reason);
   }

   async revokeAllSessions(userId: string, reason: RevokeReasonType): Promise<number> {
      const setKey = KEYS.userSessions(userId);

      return await this.storeService.revokeAllSessions(setKey, reason, userId);
   }

   private parseOrThrow(data: unknown): SessionData {
      const result = sessionDataSchema.safeParse(data);
      if (!result.success) {
         throw new SessionServiceError(`Invalid session data: ${result.error.message}`);
      }
      return result.data;
   }
}
