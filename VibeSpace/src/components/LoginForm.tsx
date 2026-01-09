'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCsrfToken, signIn, useSession } from "next-auth/react"
import { useState } from "react"
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import openOAuthWindow from "@/lib/authWindow"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useRouter } from "next/navigation"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("")
  
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string>();

  const [password, setPassword] = useState("")
  const [confrimePassword, setConfrimePassword] = useState<string>("");

  const [status, setStatus] = useState<"send" | "verify" | "create"> ("send");

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   try {
  //     const res = await fetch("/api/auth/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     })

  //     const data = await res.json()
  //     if (res.ok) {
  //       // Registration successful, redirect to login or auto-login
  //       await signIn("credentials", { email, password, callbackUrl: "/register/user_details" })
  //     } else {
  //       alert(data.error || "Registration failed")
  //     }
  //   } catch (err) {
  //     console.error(err)
  //     alert("Something went wrong")
  //   }
  //   setLoading(false)
  // }

  const handleSend = async () => {

    try {
      const res = await fetch('url', {

      })

      //user jodi age login thake tobe user exist lekha asbe
      //random string create kora hobe and pathano hobe
      // jei value ke pathano hoyeche,, setake ekhaen store korte hobe

      setStatus("verify");

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`error message:${error.message}`)
      ;
    }
     
  }

  const handleVerify = () => {
    try {
      //store kora value er sateh match korate hobe,,
      if("match" == "match"){
        setStatus("create");
      }else{
        //message dite hobe je send hoy nai,
      }

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`error message:${error.message}`)
      ;
    }
  }

  const handleCreate = async() => {
    try {
      await signIn("credentials", { email, password, callbackUrl: "/register/user_details" });

      const {data: session} = await useSession();
      const userId = session?.user.id;

      await fetch("/api/auth/refreshTokenIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      })

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`message: ${error.message}`);
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
            status === 'send' && (
                <>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                // onClick={ handleCreate('github') }
                onClick={ async () => {
                  // const csrfToken = await getCsrfToken(); 

                  // console.log("csrf", csrfToken);
//                   signIn("github", {
//   callbackUrl: "/register/user_details"
// });

                       window.location.href = "/api/auth/github/login"

           
// const githubUrl = `https://github.com/login/oauth/authorize?client_id=Ov23lip2WBbOnw8jhSAb&redirect_uri=${encodeURIComponent("https://vibe-in-teal.vercel.app/api/auth/callback/github")}&scope=user%20email&state=${csrfToken}`;


                  // openOAuthWindow(githubUrl);
                }}
              >
                <FaGithub />
                Create with GitHub
              </Button>

        
              <Button
                variant="outline"
                className="w-full"
                // onClick={ () => handleCreate('google')}
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

            {/* Email + Password onSubmit={handleSubmit}*/}
            <form className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  disabled={loading || (status === 'verify' || status === 'create' ) ? true : false }
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <>
              {
                status === 'create' && (
                  <>
              <div className="grid gap-3">
                <Label htmlFor="password">password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confrime password">confrime password</Label>
                <Input
                  id="confrime password"
                  type="password"
                  placeholder="confrime password"
                  required
                  value={confrimePassword}
                  onChange={(e) => setConfrimePassword(e.target.value)}
                />
              </div>
                  </>
                )
              }
              </>

              {
                status === 'verify' && (
                  <>
    <div className="rounded-lg shadow-lg border">
      <InputOTP
        maxLength={6}
        value={value}
        className="text-center"
        onChange={(val) => setValue(val)}
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
                  </>
                )
              }

              <Button 
                type="button" 
                className="w-full" 
                disabled={loading}
                onClick={ () => {  status === 'send' ? handleSend : ( status === 'verify' ? handleVerify : handleCreate()) }}
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


// https://github.com/login/oauth/authorize?client_id=Ov23lip2WBbOnw8jhSAb&redirect_uri=https%3A%2F%2Fvibe-in-teal.vercel.app%2Fapi%2Fauth%2Fcallback%2Fgithub&scope=user%20email&state=7561775d172910c8c36987fd8543e69658c13daf3e1ee13f1e25956b6b822fd6

// https://github.com/login/oauth/select_account?client_id=Ov23lip2WBbOnw8jhSAb&prompt=select_account&redirect_uri=https%3A%2F%2Fvibe-in-teal.vercel.app%2Fapi%2Fauth%2Fcallback%2Fgithub&response_type=code&scope=openid+name+email+profile&state=-8v5rcTxxYf4suTWf2XuJJ2okQ8vCBEO_xA8BFBNjB0