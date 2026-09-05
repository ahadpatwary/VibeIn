
-- Check if ALL k bits are set (element membership test).
-- Returns 1 if all set (probably present), 0 if any unset (definitely absent).
-- KEYS[1] = bitfield key
-- ARGV[1..k] = bit positions

---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV


local key = KEYS[1]
for i = 1, #ARGV do
  if redis.call('GETBIT', key, ARGV[i]) == 0 then
    return 0
  end
end
return 1