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
import { useRouter } from "next/navigation"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { useLogin } from "../hooks/useLogin"


export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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

  return (
    <Card className="w-full max-w-lg m-3">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription >
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Link href="/register">Sign Up</Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                    href="/forget_password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    onClick={() => forgetPassword(email) }
                >
                    Forgot your password?
                </Link>
                </div>
                <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full cursor-pointer">
                Login
            </Button>
            </form>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or continue with
                </span>
            </div>
        </>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={ googleLogin }
        >
          Login with Google
        </Button>
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={ gitHubLogin }
        >
          Login with GitHub
        </Button>
      </CardFooter>
    </Card>
  )
  return <p>ahad</p>
}