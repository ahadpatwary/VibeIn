---@diagnostic disable: undefined-global

---@type string[]
local KEYS = KEYS
---@type string[]
local ARGV = ARGV


local violKey = KEYS[1]
local banKey = KEYS[2]

local threshold = tonumber(ARGV[1])
local violationTTL = tonumber(ARGV[2])

local tiers = #ARGV - 2

local violations = tonumber(redis.call('GET', violKey) or '0')

if violations >= threshold then
    local tier = math.min(violations - 1, tiers - 1)
    local banSecs = tonumber(ARGV[tier + 3])

    redis.call('SET', banKey, violations)
    redis.call('EXPIRE', banKey, banSecs)

    return {violations, banSecs, 1}
end

violations = tonumber(redis.call('INCR', violKey))
redis.call('EXPIRE', violKey, violationTTL)

return {violations, 0, 0}