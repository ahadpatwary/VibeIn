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
import { getGitHubOAuthUrl } from "@/lib/githubAuthUrl";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  // const url = await signIn("github", { redirect: false });
                  // console.log("Captured URL:", url);

                  const url = getGitHubOAuthUrl();
                  window.open(url, "_blank", "width=600,height=700");
                }}
                // onClick={() => {
                //   window.open(
                //     "/api/auth/signin/github?callbackUrl=/register/user_details",
                //     "_blank",
                //     "width=500,height=650"
                //   )
                // }}
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

            {/* Email + Password */}
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-3">
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
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Send Notification"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
