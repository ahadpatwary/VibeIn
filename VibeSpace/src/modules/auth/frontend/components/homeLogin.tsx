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
import { Dispatch, SetStateAction } from "react"
import { FormEvent } from "react"

interface propsType {
    handleSubmit: (e: FormEvent<Element>) => Promise<void>,
    email: string,
    setEmail: Dispatch<SetStateAction<string>>,
    handleForgetPassword: () => void,
    password: string,
    setPassword: Dispatch<SetStateAction<string>>,
    googleLogin: () => void,
    gitHubLogin: () => void
}

export const HomeLogin = ({
    handleSubmit, 
    email, 
    setEmail, 
    handleForgetPassword, 
    password, 
    setPassword, 
    googleLogin, 
    gitHubLogin
}: propsType) => {
    return (
        <Card className="w-full max-w-lg m-3">
        <Header 
            title='Login to your account'
            description='Enter your email below to login to your account'
            goRouter='/register'
            goText='Register'
        />

        <CardContent>
            <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <CustomInput
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    setValue={setEmail}
                />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="/forget_password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        onClick={ handleForgetPassword }
                    >
                        Forgot your password?
                    </Link>
                    </div>
                    <CustomInput 
                    id='password'
                    type='password'
                    placeholder="password"
                    value={password}
                    setValue={setPassword}
                    />
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                    Login
                </Button>
            </form>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t mt-4">
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
}