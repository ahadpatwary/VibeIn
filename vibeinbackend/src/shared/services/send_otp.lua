---@diagnostic disable: undefined-global


-- KEYS
-- 1 = otpKey
-- 2 = cooldownKey
-- 3 = sendCountKey
--
-- ARGV
-- 1 = hashedOtp
-- 2 = otpTtlSecs

local function nowMs()
    local t = redis.call("TIME")
    return tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
end

local function computeCooldown(sendCount)
    if sendCount <= 2 then
        return 60 * 1000
    elseif sendCount <= 5 then
        return 3 * 60 * 1000
    else
        return 24 * 60 * 60 * 1000
    end
end

local otpKey = KEYS[1]
local cooldownKey = KEYS[2]
local sendCountKey = KEYS[3]

local hashedOtp = ARGV[1]
local otpTtlSecs = tonumber(ARGV[2])

local now = nowMs()


-- Cooldown -------------------------------------------------------

local cooldownRaw = redis.call("GET", cooldownKey)

if cooldownRaw then

    local cooldown = cjson.decode(cooldownRaw)

    if cooldown.sendableAt > now then

        return redis.error_reply("COOLDOWN")

    end
end


-- Send Count -------------------------------------------------------

local sendCount =
    tonumber(redis.call("GET", sendCountKey) or "0")

sendCount = sendCount + 1

local cooldownMs = computeCooldown(sendCount)
local cooldownSecs = math.ceil(cooldownMs / 1000)

-- OTP -------------------------------------------------------

redis.call(
    "SET",
    otpKey,
    cjson.encode({
        hashedOtp = hashedOtp,
        expiresAt = now + otpTtlSecs * 1000,
        attempts = 0
    }),
    "EX",
    otpTtlSecs
)



-- Cooldown -------------------------------------------------------

redis.call(
    "SET",
    cooldownKey,
    cjson.encode({
        assignedAt = now,
        sendableAt = now + cooldownMs
    }),
    "EX",
    cooldownSecs
)


-- Send Count -------------------------------------------------------

redis.call(
    "SET",
    sendCountKey,
    sendCount,
    "EX",
    86400
)


-- Result-------------------------------------------------------

return {
    cooldownSecs,
    sendCount
}