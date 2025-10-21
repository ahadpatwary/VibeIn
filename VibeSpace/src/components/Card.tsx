'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CardDemo() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Email + Password login (Credentials Provider)
    const res = await signIn("credentials", {
      // redirect: true,
      email,
      password,
      // callbackUrl: "/feed", // successful login হলে redirect হবে
    })

    console.log("Login response:", res)
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
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
        >
          Login with Google
        </Button>
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          // onClick={() => signIn("github", { callbackUrl: "/feed" })}
        >
          Login with GitHub
        </Button>
      </CardFooter>
    </Card>
  )
}