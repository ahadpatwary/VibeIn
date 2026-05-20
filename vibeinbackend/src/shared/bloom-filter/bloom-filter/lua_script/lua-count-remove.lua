
--Counting Bloom Filter — decrement counters, clear bit if count reaches 0.
--KEYS[1] = bitfield key, KEYS[2] = counter hash key
--ARGV[1..k] = positions

---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV


local bitKey   = KEYS[1]
local countKey = KEYS[2]
for i = 1, #ARGV do
  local pos   = ARGV[i]
  local count = tonumber(redis.call('HINCRBY', countKey, pos, -1))
  if count <= 0 then
    redis.call('HSET', countKey, pos, 0)
    redis.call('SETBIT', bitKey, pos, 0)
  end
end
return 1