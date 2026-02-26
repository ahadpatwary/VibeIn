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


{/* <div className="hidden md:flex w-1/2 bg-gray-50 border-r border-gray-200">
        <div className="flex flex-col justify-between px-20 py-16 w-full">

          <div>

            <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">
              Your Platform
            </span>

            <h1 className="mt-6 text-5xl font-semibold text-gray-900 leading-tight">
              Welcome back
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-md">
              Access your workspace, manage your activity,
              and stay in control of everything that matters.
            </p>

            <div className="mt-10 space-y-6">

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-semibold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Secure Authentication
                  </h3>
                  <p className="text-sm text-gray-500">
                    Industry-standard encryption and protection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-semibold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Fast Performance
                  </h3>
                  <p className="text-sm text-gray-500">
                    Optimized for speed and reliability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-semibold">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Full Data Control
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your information stays private and protected.
                  </p>
                </div>
              </div>

            </div>

          </div>

          <div className="pt-10 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Trusted by professionals worldwide.
            </p>
          </div>

        </div>
      </div> */}
{/* hidden md:flex border-r border-gray-800*/ }
{/* <div className=" "> */ }