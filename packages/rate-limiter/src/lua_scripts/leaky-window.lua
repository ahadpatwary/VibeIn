---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV


local key        = KEYS[1]
local capacity   = tonumber(ARGV[1])
local leakRate   = tonumber(ARGV[2])
local now        = tonumber(ARGV[3])
local ttl        = tonumber(ARGV[4])

local data       = redis.call('HMGET', key, 'queueSize', 'lastLeakAt')
local queueSize  = tonumber(data[1]) or 0
local lastLeakAt = tonumber(data[2]) or now

-- Leak: drain requests that have been processed since last check
local elapsed    = math.max(0, now - lastLeakAt)
local leaked     = math.floor((elapsed / 1000) * leakRate)
queueSize        = math.max(0, queueSize - leaked)

local allowed    = 0
local retrySecs  = 0

if queueSize < capacity then
  queueSize = queueSize + 1
  allowed   = 1
else
  -- Time until one slot frees up
  retrySecs = math.ceil(1 / leakRate)
end

redis.call('HMSET', key,
  'queueSize',  queueSize,
  'lastLeakAt', now
)
redis.call('EXPIRE', key, ttl)

return {allowed, queueSize, retrySecs}
