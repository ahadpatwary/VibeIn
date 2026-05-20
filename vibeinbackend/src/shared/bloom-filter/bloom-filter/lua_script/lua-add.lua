
--  Atomically SET k bits and return the number that were ALREADY set.
--  KEYS[1] = bitfield key
--  ARGV[1..k] = bit positions

---@diagnostic disable: undefined-global

---@type string[] 
local KEYS = KEYS
---@type string[]
local ARGV = ARGV


local key = KEYS[1]
local already = 0
for i = 1, #ARGV do
  local prev = redis.call('GETBIT', key, ARGV[i])
  if prev == 1 then already = already + 1 end
  redis.call('SETBIT', key, ARGV[i], 1)
end
return already