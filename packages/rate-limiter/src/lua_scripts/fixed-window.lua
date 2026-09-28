---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV

local key     = KEYS[1]
local windowTime  = tonumber(ARGV[1])
local count   = redis.call('INCR', key)

if count == 1 then                -- first request, set TTL
  redis.call('EXPIRE', key, windowTime)
end

local ttl = redis.call('TTL', key)
return {count, ttl}