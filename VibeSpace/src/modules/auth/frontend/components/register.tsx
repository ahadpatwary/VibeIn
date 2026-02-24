'use client'

import {
  createAccountSchema,
  CreateAccountType,
  EmailType,
  emailValidateSchema,
  otpValidateSchema,
  OtpValidateType
} from "../schemas/signIn.schema"

import { cn } from "@/shared/lib/utils"
import { useState, useEffect } from "react"
import { Otp } from "@/shared/components/Otp"
import CreateAccount from "../components/createAccount"
import { useRegister } from "../hooks/useRegister"
import { useRouter, useSearchParams } from "next/navigation"
import { HomeRegister } from "./homeRegister"
import WellComeHeader from "./wellComeHeader"
import { PolicyInfo } from "./policyInfo"

export function Register({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter()
  const searchParams = useSearchParams()

  const step = (searchParams.get("step") as "send" | "verify" | "create") || "send"

  const [email, setEmail] = useState<EmailType>("");

  const [otpObject, setOtpObject] = useState<OtpValidateType>({
    email: "",
    otp: ""
  });

  const [createAccountObject, setCreateAccountObject] = useState<CreateAccountType>({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const {
    loading,
    googleRegister,
    githubRegister,
    checkEmailExistance,
    otpVerification,
    credentialRegister
  } = useRegister();

  useEffect(() => {
    setOtpObject(prev => ({ ...prev, email }))
    setCreateAccountObject(prev => ({ ...prev, email }))
  }, [email])

  const goStep = (nextStep: "send" | "verify" | "create") => {
    router.push(`/register?step=${nextStep}`)
  }

  const handleClick = () => {

    if (step === 'send') {
      const parsed = emailValidateSchema.safeParse(email)

      if (!parsed.success) {
        console.log(parsed.error.format());
        return;
      }

      checkEmailExistance(parsed.data)
      goStep("verify")
    }

    else if (step === 'verify') {
      const parsed = otpValidateSchema.safeParse(otpObject);

      if (!parsed.success) {
        console.log(parsed.error.format());
        return;
      }

      otpVerification(parsed.data)
      goStep("create")
    }

    else if (step === 'create') {
      const parsed = createAccountSchema.safeParse(createAccountObject);

      if (!parsed.success) {
        console.log(parsed.error.format());
        return;
      }

      credentialRegister(parsed.data)
    }
  }

  return (


    <div className="w-full flex justify-center">
      <div className="min-h-dvh flex flex-col md:flex-row md:justify-center items-center text-gray-200 max-w-[1280px] w-full">

        <WellComeHeader className="md:hidden" />
        <PolicyInfo className="hidden md:flex flex-col justify-between px-10 pt-16 pb-5 w-full" />

        <div className="w-full md:max-w-sm lg:max-w-lg m-2 flex justify-center my-3 h-auto">
          {step === 'send' && (
            <HomeRegister
              githubRegister={githubRegister}
              googleRegister={googleRegister}
              email={email}
              setEmail={setEmail}
              handleClick={handleClick}
            />
          )}

          {step === 'verify' && (
            <Otp otpObject={otpObject} setOtpObject={setOtpObject} handleClick={handleClick} />
          )}

          {step === 'create' && (
            <CreateAccount
              createAccountObject={createAccountObject}
              setCreateAccountObject={setCreateAccountObject}
            />
          )}

        </div>
        <PolicyInfo className="md:hidden" />

      </div>
    </div>
  )
}