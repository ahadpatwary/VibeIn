'use client'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

import {
  createAccountSchema,
  CreateAccountType,
  EmailType,
  emailValidateSchema,
  otpValidateSchema,
  OtpValidateType
} from "../schemas/signIn.schema"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { useState, useEffect } from "react"
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { Otp } from "@/shared/components/Otp"
import CreateAccount from "../components/createAccount"
import { useRegister } from "../hooks/useRegister"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "./header"
import { CustomInput } from "@/shared/components/Input"

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>

        <Header 
          title="Create an Account"
          description="Enter your email below to create to your account"
          router="/login"
          text="Login"
        />

        <CardContent>
          <div className="grid gap-6">

            {step === 'send' && (
              <>
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" onClick={githubRegister}>
                    <FaGithub /> Create with GitHub
                  </Button>

                  <Button variant="outline" className="w-full" onClick={googleRegister}>
                    <FaGoogle /> Create with Google
                  </Button>
                </div>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
              </>
            )}

            <form className="grid gap-6">

              {step === 'send' && (
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <CustomInput 
                    id="email"
                    type="Email"
                    placeholder="m@example.com"
                    value={email}
                    setValue={setEmail}
                  />
                </div>
              )}

              {step === 'verify' && (
                <Otp otpObject={otpObject} setOtpObject={setOtpObject} />
              )}

              {step === 'create' && (
                <CreateAccount
                  createAccountObject={createAccountObject}
                  setCreateAccountObject={setCreateAccountObject}
                />
              )}

              <Button type="button" className="w-full" disabled={loading} onClick={handleClick}>
                {step === 'send'
                  ? "Send Code"
                  : step === 'verify'
                    ? "Verify Code"
                    : "Create Account"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}