
-- Counting Bloom Filter — atomically increment k counters.
-- Uses a separate HASH key for counts.
-- KEYS[1] = counter hash key
-- ARGV[1..k] = counter field names (bit positions as strings)

---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV

local key = KEYS[1]
for i = 1, #ARGV do
  redis.call('HINCRBY', key, ARGV[i], 1)
end
return 1