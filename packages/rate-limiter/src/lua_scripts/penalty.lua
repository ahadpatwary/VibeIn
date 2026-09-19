-- ─────────────────────────────────────────────────────────────────
--  Lua: Penalty system
-- ─────────────────────────────────────────────────────────────────


-- Increment violation count and set/extend ban.
-- Returns [violation_count, ban_ttl_secs]

---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV


local violKey = KEYS[1]
local banKey  = KEYS[2]

local violations = tonumber(redis.call('INCR', violKey))
redis.call('EXPIRE', violKey, 86400 * 7)  -- track violations for 1 week

local tiers = #ARGV
local tier  = math.min(violations - 1, tiers - 1)
local banSecs = tonumber(ARGV[tier + 1])

redis.call('SET', banKey, violations)
redis.call('EXPIRE', banKey, banSecs)

return {violations, banSecs}
