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
import { signIn } from "next-auth/react"
import { useState } from "react"
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        // Registration successful, redirect to login or auto-login
        await signIn("credentials", { email, password, callbackUrl: "/register/user_details" })
      } else {
        alert(data.error || "Registration failed")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
    setLoading(false)
  }

  const handleSend = () => {
    // send notification
    // if response 
    setTimeout(() => {
      setStatus("verify");
    }, 2000)
  }
  const handleVerify = () => {
    setTimeout(() => {
      setStatus("create");
    }, 2000)
  }

  const handleCreate = () => {
    setTimeout(() => {
      router.push('/login');
    }, 2000)
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
                onClick={async () => signIn("google", { callbackUrl : '/register/for' }) }
              >
                <FaGithub />
                Create with GitHub
              </Button>

        
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.open(
                    "/api/auth/signin/google?callbackUrl=/register/user_details",
                    "_blank",
                    "width=500,height=600"
                  );
                }}
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
                onClick={ status === 'send' ? handleSend : ( status === 'verify' ? handleVerify : handleCreate) }
              >
                {
                  status === 'send' ? "Send Code" : status === 'verify' ? 'verify code' : 'create account'
                  // status === 'final' && "send" 
                }
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
