
-- TODO (security-critical, must implement before production):
-- 1. sid দিয়ে session lookup করো (DB/Redis)
-- 2. session.status === 'active' কিনা check করো
-- 3. token-এ থাকা jti, session-এ stored jti-এর সাথে মিলছে কিনা check করো
--    — না মিললে token reuse attack, পুরো family সাথে সাথে revoke করে দাও
-- 4. session expire হয়ে গেছে কিনা check করো
-- 5. সব ঠিক থাকলে নতুন jti generate করে session আপডেট করো (atomic — Lua script/transaction দিয়ে)


-- rotate_session.lua
--
-- KEYS[1] = session key            e.g. "session:{family}:sid123"
-- KEYS[2] = family-sessions set    e.g. "family:{family}:sessions"
--
-- ARGV[1] = sid      (session ID)
-- ARGV[2] = oldJti   (jti present in the incoming refresh token)
-- ARGV[3] = newJti   (jti to set if rotation succeeds)
-- ARGV[4] = ttlSeconds (refresh token TTL, used to re-set expiry)
--
-- Returns:
--    STATUS REASON
--   {"ACTIVE", "NULL"}
--   {"NOT_FOUND", "SESSION_NOT_FOUND"}
--   {"REVOKED", "USER_LOGOUT"}
--   {"REVOKED", "LOGOUT_ALL_DEVICE"}
--   {"REVOKED", "PASSWORD_CHANGE"}
--   {"REVOKED", "EMAIL_CHANGE"}
--   {"REVOKED", "ACCOUNT_SUSPENDED"}
--   {"REVOKED", "ACCOUNT_DELETED"}
--   {"REVOKED", "TOKEN_REUSE_DETECTION"}
--   {"REVOKED", "ADMIN_REVOKED"}
--   {"REVOKED", "SECURITY_ENTITY"}


---@diagnostic disable: undefined-global

---@type string[]
local sessionKey   = KEYS[1]    -- `session:${sid}`;
---@type string[]
local userAllSession = KEYS[2]    --`userAllSession:${userId}`;

local sid = ARGV[1]
local oldJti = ARGV[2]
local newJti = ARGV[3]
local ttl    = tonumber(ARGV[4])

-- 1. Session exists?
if redis.call('EXISTS', sessionKey) == 0 then
  return {'NOT_FOUND', 'SESSION_NOT_FOUND'}
end

local status    = redis.call('HGET', sessionKey, 'status')
local revokedReason = redis.call('HGET', sessionKey, 'reason')
local storedJti = redis.call('HGET', sessionKey, 'jti')

-- 2. Session must be active
if status ~= 'ACTIVE' then
  return {'REVOKED', revokedReason}
end

-- 3. jti mismatch => stale/already-used refresh token => reuse attack
if storedJti ~= oldJti then
  --remove the session from set
  redis.call('SREM', userAllSession, sid)
  redis.call('HSET', sessionKey, 'status', 'REVOKED', 'reason', 'TOKEN_REUSE_DETECTION')

  return {'REVOKED', 'TOKEN_REUSE_DETECTED'}
end

-- 4 & 5. All good — rotate jti atomically and refresh TTL
redis.call('HSET', sessionKey, 'jti', newJti)
redis.call('EXPIRE', sessionKey, ttl)
redis.call('EXPIRE', userAllSession, ttl)

return {'ACTIVE', 'null'}