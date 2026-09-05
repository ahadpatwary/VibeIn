---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV

--- tonumber কে nil-safe করে — nil হলে error throw করে
---@param  value   string | nil
---@param  name    string
---@return number
local function requireNumber(value, name)
  local n = tonumber(value)
  if n == nil then
    error('missing or invalid argument: ' .. name)
  end
  return n
end

-- এখন সব variables strictly `number` typed, `number?` না
local capacity   = requireNumber(ARGV[1], 'capacity')
local refillRate = requireNumber(ARGV[2], 'refillRate')
local cost       = requireNumber(ARGV[3], 'cost')
local now        = requireNumber(ARGV[4], 'now')
local ttl        = requireNumber(ARGV[5], 'ttl')

local data = redis.call('HMGET', key, 'tokens', 'lastRefillAt')
local tokens       = tonumber(data[1]) or capacity
local lastRefillAt = tonumber(data[2]) or now

-- Refill tokens based on elapsed time
local elapsed      = math.max(0, now - lastRefillAt)
local refillAmount = (elapsed / 1000) * refillRate
tokens = math.min(capacity, tokens + refillAmount)

local allowed = 0
local remaining = tokens

if tokens >= cost then
  tokens  = tokens - cost
  allowed = 1
  remaining = tokens
end

-- Persist state
redis.call('HMSET', key,
  'tokens',       tokens,
  'lastRefillAt', now
)
redis.call('EXPIRE', key, ttl)

-- Time until 1 token is refilled (for Retry-After)
local retrySecs = 0
if allowed == 0 then
  retrySecs = math.ceil((cost - tokens) / refillRate)
end

return {allowed, math.floor(remaining), retrySecs}
