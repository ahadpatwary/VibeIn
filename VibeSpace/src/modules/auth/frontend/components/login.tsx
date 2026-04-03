'use client'

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/shared/components/ui/label"
import { useLogin } from "../hooks/useLogin"
import { CustomInput } from "@/shared/components/Input"
import { Header } from "./header"
import { handler } from "next/dist/build/templates/app-page"
import { HomeLogin } from "./homeLogin"
import { Otp } from "@/shared/components/Otp"
import CreateAccount from "./createAccount"
import { CreateAccountType, OtpValidateType } from "../schemas/signIn.schema"
import { PolicyInfo } from "./policyInfo"
import WellComeHeader from "./wellComeHeader"
import { policyInfo } from "../hooks/useLogin"



export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const handleClick = () => {
    console.log("ahad");
  }

  const [otpObject, setOtpObject] = useState<OtpValidateType>({
    email: "",
    otp: ""
  });
  const searchParams = useSearchParams()

  const step = (searchParams.get("step") as "send" | "verify" | "pass_change") || "send"

  const goStep = (nextStep: "send" | "verify" | "pass_change") => {
    router.push(`/login?step=${nextStep}`)
  }
  const [createAccountObject, setCreateAccountObject] = useState<CreateAccountType>({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const {
    googleLogin,
    gitHubLogin,
    credentialsLogin,
    forgetPassword,
    loginOtpVerification,
    passwordChange,
  } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("data", e);
  }

  const handleForgetPassword = async () => {
    await forgetPassword(email);
    goStep("verify");
  }

  return (
    <div className="w-full flex justify-center">
      <div className="min-h-dvh flex flex-col md:flex-row md:justify-center items-center text-gray-200 max-w-[1280px] w-full">

        <WellComeHeader className="md:hidden" />
        <PolicyInfo
          className="hidden md:flex flex-col justify-between px-10 pt-16 pb-5 w-full"
          policyInfo={policyInfo}
        />

        <div className="w-full md:max-w-sm lg:max-w-lg m-2 flex justify-center my-3 h-auto">
          {
            step === 'send' && (
              <HomeLogin
                handleSubmit={handleSubmit}
                email={email}
                setEmail={setEmail}
                handleForgetPassword={handleForgetPassword}
                password={password}
                setPassword={setPassword}
                googleLogin={googleLogin}
                gitHubLogin={gitHubLogin}
              />
            )
          }

          {
            step === 'verify' && (
              <Otp otpObject={otpObject} setOtpObject={setOtpObject} handleClick={handleClick} />
            )
          }

          {
            step === 'pass_change' && (
              <CreateAccount
                createAccountObject={createAccountObject}
                setCreateAccountObject={setCreateAccountObject}
              />
            )
          }
        </div>
        <PolicyInfo
          className="md:hidden"
          policyInfo={policyInfo}
        />

      </div>
    </div>
  )
}