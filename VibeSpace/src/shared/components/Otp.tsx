"use client"
import { Dispatch, SetStateAction } from "react"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field"
import { AiOutlineArrowRight } from "react-icons/ai";
import { AiOutlineArrowLeft } from "react-icons/ai"
import { RefreshCwIcon } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp"
import { OtpValidateType } from "@/modules/auth/frontend/schemas/signIn.schema"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Header } from "@/modules/auth/frontend/components/header"

interface PropsType {
  otpObject: OtpValidateType,
  setOtpObject: Dispatch<SetStateAction<OtpValidateType>>,
  handleClick: () => void
}

export function Otp({otpObject, setOtpObject, handleClick}: PropsType) {

  return (
    <Card>
      <Header 
        title="Create an Account"
        description="Enter your email below to create to your account"
        backRouter="/register"
        backText={ <AiOutlineArrowLeft size={20} className="mr-3"/>}
      />

      <CardContent>
        <div className="flex items-center justify-between max-w-md">
          <FieldLabel htmlFor="otp-verification">
            Verification code
          </FieldLabel>
          <Button 
            className="bg-transparent hover:bg-transparent dark:text-white border m-1" onClick={() => console.log("ahd")}>
              <RefreshCwIcon />
              Resend Code
          </Button>
        </div>
          <InputOTP
            maxLength={6}
            value={otpObject.otp}
            className="text-center"
            onChange={(val) => setOtpObject((prev: OtpValidateType) => ({...prev, otp: val}))}
          >
            <InputOTPGroup className="w-full">
              <InputOTPSlot index={0} className="w-full"/>
              <InputOTPSlot index={1} className="w-full"/>
              <InputOTPSlot index={2} className="w-full"/>
              <InputOTPSlot index={3} className="w-full"/>
              <InputOTPSlot index={4} className="w-full"/>
              <InputOTPSlot index={5} className="w-full"/>
            </InputOTPGroup>
          </InputOTP>
      </CardContent>
      <CardFooter>
        <Button type="button" className="w-full" onClick={handleClick}>
          Verify Otp
        </Button>
      </CardFooter>
    </Card>
  )
}