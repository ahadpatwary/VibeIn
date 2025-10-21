"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function InputOTPControlled() {
  const [value, setValue] = React.useState("")
  const router = useRouter()

  useEffect(() => {
    if (value.length === 6) {
      console.log("OTP Entered: ", value)
      router.push("/sign_up") // এখানে শুধু string path দিতে হবে
    }
  }, [value, router])

  return (
    <div className="bg-neutral-800 p-5 rounded-lg shadow-lg border">
      <InputOTP
        maxLength={6}
        value={value}
        className="text-center"
        onChange={(val) => setValue(val)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-lg font-medium ">
        {value === "" ? (
          <>Enter your one-time password.</>
        ) : (
          <>You entered: {value}</>
        )}
      </div>
    </div>
  )
}