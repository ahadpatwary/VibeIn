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
    <>
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
          <Otp otpObject={otpObject} setOtpObject={setOtpObject} handleClick={handleClick}/>
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
    </>
  )
  return <p>ahad</p>
}