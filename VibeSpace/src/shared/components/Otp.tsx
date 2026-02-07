"use client"
import { Dispatch, SetStateAction } from "react"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp"
import { OtpValidateType } from "@/schemas/signIn.schema"

interface PropsType {
  otpObject: OtpValidateType,
  setOtpObject: Dispatch<SetStateAction<OtpValidateType>>
}

export function Otp({otpObject, setOtpObject}: PropsType) {

  return (
    <div className="rounded-lg shadow-lg border">
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
    </div>
  )
}


// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSeparator,
//   InputOTPSlot,
// } from "@/components/ui/input-otp"
// import { RefreshCwIcon } from "lucide-react"

// export function Otp({otpObject, setOtpObject}: PropsType) {
//   return (
//     <Card className="mx-auto max-w-md">
//       <CardHeader>
//         <CardTitle>Verify your login</CardTitle>
//         <CardDescription>
//           Enter the verification code we sent to your email address:{" "}
//           <span className="font-medium">m@example.com</span>.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Field>
//           <div className="flex items-center justify-between">
//             <FieldLabel htmlFor="otp-verification">
//               Verification code
//             </FieldLabel>
//             <Button variant="outline" size="xs">
//               <RefreshCwIcon />
//               Resend Code
//             </Button>
//           </div>
//           <InputOTP maxLength={6} id="otp-verification" required>
//             <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
//               <InputOTPSlot index={0} />
//               <InputOTPSlot index={1} />
//               <InputOTPSlot index={2} />
//             </InputOTPGroup>
//             <InputOTPSeparator className="mx-2" />
//             <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
//               <InputOTPSlot index={3} />
//               <InputOTPSlot index={4} />
//               <InputOTPSlot index={5} />
//             </InputOTPGroup>
//           </InputOTP>
//           <FieldDescription>
//             <a href="#">I no longer have access to this email address.</a>
//           </FieldDescription>
//         </Field>
//       </CardContent>
//       <CardFooter>
//         <Field>
//           <Button type="submit" className="w-full">
//             Verify
//           </Button>
//           <div className="text-muted-foreground text-sm">
//             Having trouble signing in?{" "}
//             <a
//               href="#"
//               className="hover:text-primary underline underline-offset-4 transition-colors"
//             >
//               Contact support
//             </a>
//           </div>
//         </Field>
//       </CardFooter>
//     </Card>
//   )
// }