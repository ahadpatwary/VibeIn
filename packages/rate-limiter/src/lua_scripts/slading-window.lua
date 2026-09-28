-- local curr_key  = KEYS[1]
-- local prev_key  = KEYS[2]
-- local window    = tonumber(ARGV[1])

-- local prev_count = tonumber(redis.call('GET', prev_key)) or 0
-- local curr_count = redis.call('INCR', curr_key)
-- if curr_count == 1 then
--   redis.call('EXPIRE', curr_key, window * 2)
-- end
-- local prev_ttl = tonumber(redis.call('TTL', prev_key)) or 0
-- return {prev_count, curr_count, prev_ttl}

---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV

-- Sliding Window Counter Rate Limiter
--
-- KEYS[1]  curr_key  →  current window counter key
-- KEYS[2]  prev_key  →  previous window counter key
-- ARGV[1]  window    →  window size in seconds
--
-- Returns: { prev_count, curr_count, prev_ttl }

local curr_key = KEYS[1]
local prev_key = KEYS[2]
local window   = tonumber(ARGV[1]) or 60

local prev_count = tonumber(redis.call('GET', prev_key)) or 0
local curr_count = tonumber(redis.call('INCR', curr_key)) or 0

if curr_count == 1 then
  redis.call('EXPIRE', curr_key, window * 2)
end

local prev_ttl = tonumber(redis.call('TTL', prev_key)) or 0

return { prev_count, curr_count, prev_ttl }