'use client'
import { getSession } from "next-auth/react";
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
import { useEffect } from 'react'

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

  useEffect(() => {

    const handleMessage = async (event: MessageEvent) => {
      try {

        if (event.origin !== "https://vibe-in-teal.vercel.app") return;
        if (event.data?.type !== "GOOGLE_AUTH_SUCCESS") return;

        const email = event.data?.email;

        if(!email) return;

        const res = await fetch("/api/checkEmailExistance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if(!res.ok) return;

        const data = await res.json();
        
        if(data.user) {
          console.log('user already exist');
          return;
        }

        await signIn('credentials', {
          payload: JSON.stringify({
            name: event?.data?.name,
            email: event?.data?.email,
            image: event?.data?.picture,
          }),
          redirect: false
        });

        const session  = await getSession();
        const userId = session?.user.id;

        await fetch("/api/auth/refreshTokenIssue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, email }),
        })

        router.push('/register/user_details');

      } catch (error) {
        if(error instanceof Error)
          throw new Error(`error message${error.message}`)
        ;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);


  const googleRegister = () => {
    const state = crypto.randomUUID(); // import crypto from "crypto"
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "consent",
    });

    const googleUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();

    window.open(googleUrl, "_blank", "width=600,height=600");
  };

  const githubRegister = async () => {
    try {

      await signIn("github", { callbackUrl: '/register/user_details'});

      const session = await getSession();
      const userId = session?.user.id;

      await fetch("/api/auth/refreshTokenIssue", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      })

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`error message ${error.message}`)
      ;
    }
  }

  const handleSend = async () => {

    try {

      const res = await fetch("/api/checkEmailExistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if(!res.ok) return;

      const data = await res.json();
      
      if(data.user) {
        console.log('user already exist');
        return;
      }

      setStatus("verify");

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`error message:${error.message}`)
      ;
    }
     
  }

  const handleVerify = async () => {
    try {

      const res = await fetch('/api/verifyOtp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, value }),
      })

      if(!res.ok) {
        console.log("not veriy otp");
        return;
      }

      setStatus("create");

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`error message:${error.message}`)
      ;
    }
  }

  const credentialRegister = async () => {
    try {

      await signIn('credentials', {
        payload: JSON.stringify({
          email: email,
          password: password
        }),
        redirect: false
      });

      const session  = await getSession();
      const userId = session?.user.id;

      await fetch("/api/auth/refreshTokenIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      })

      router.push('/register/user_details');

    } catch (error) {
      if(error instanceof Error)
        throw new Error(`message: ${error.message}`)
      ;
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
                onClick={  status === 'send' ? handleSend : ( status === 'verify' ? handleVerify : credentialRegister) }
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