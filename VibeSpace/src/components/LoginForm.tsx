'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { 
  createAccountSchema, 
  CreateAccountType, 
  EmailType, 
  emailValidateSchema, 
  otpValidateSchema, 
  OtpValidateType 
} from "@/schemas/signIn.schema"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { Otp } from "./Otp";
import { useLoing } from "@/hooks/useLogin";
import CreateAccount from "./CreateAccount"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail] = useState<EmailType>("");

  console.log("email", email);

  const [otpObject, setOtpObject] = useState<OtpValidateType>({
    email: email,
    otp: ""
  });
  console.log(otpObject);

  const [createAccountObject, setCreateAccountObject] = useState<CreateAccountType>({
    email,
    password: "",
    confirmPassword: ""
  })

  const { 
    status,
    loading,
    googleRegister,
    githubRegister,
    checkEmailExistance, 
    otpVerification, 
    credentialRegister 
  } = useLoing();

  const handleClick = () => {

    if(status === 'send'){
      const parsed = emailValidateSchema.safeParse(email)

      if (!parsed.success) {
        console.log(parsed.error.format());
        return;
      }
      setOtpObject((prev: OtpValidateType) => ({...prev, email: parsed.data}))

      checkEmailExistance(parsed.data);

    } else if( status === 'verify') {
      const parsed = otpValidateSchema.safeParse(otpObject);

      if(!parsed.success) {
        console.log(parsed.error.format());
        return;
      }

      otpVerification(parsed.data)
    } else if( status === 'create') {
      const parsed = createAccountSchema.safeParse(createAccountObject);

      if(!parsed.success) {
        console.log(parsed.error.format());
        return;
      }

      credentialRegister(parsed.data)
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <>
              {
                status === 'send' && ( //google and github provider
                  <>
                    <div className="flex flex-col gap-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={ githubRegister }
                      >
                        <FaGithub />
                        Create with GitHub
                      </Button>

                
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={ googleRegister }
                      >
                        <FaGoogle />
                        Create with Google
                      </Button>
                    </div>
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>
                  </>
                )
              }
            </>

            <form className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  disabled={ ( loading || status === 'verify' || status === 'create' ) ? true : false }
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {
                status === 'create' && (
                  <CreateAccount 
                    createAccountObject={createAccountObject} 
                    setCreateAccountObject={setCreateAccountObject} 
                  />
                )
              }

              {
                status === 'verify' && (
                  <Otp 
                    otpObject={otpObject} 
                    setOtpObject={setOtpObject} 
                  />
                )
              }

              <Button 
                type="button" 
                className="w-full" 
                disabled={loading}
                onClick={ handleClick }
              >
                {
                  status === 'send' ? "Send Code" : status === 'verify' ? 'verify code' : 'create account'
                }
              </Button>
              
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}