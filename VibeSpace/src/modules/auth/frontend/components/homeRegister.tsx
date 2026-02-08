import {
  Card,
  CardContent,
} from "@/shared/components/ui/card"



import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { Header } from "./header"
import { CustomInput } from "@/shared/components/Input"
import { Dispatch, SetStateAction } from "react"


interface propsType {
    githubRegister:  () => void
    googleRegister:  () => void
    email: string,
    setEmail: Dispatch<SetStateAction<string>>
    handleClick: () => void
}


export const HomeRegister = ({
    githubRegister,
    googleRegister,
    email,
    setEmail,
    handleClick
}: propsType) => {
    return (
        <Card>

            <Header 
                title="Create an Account"
                description="Enter your email below to create to your account"
                goRouter="/login"
                goText="Login"
            />

            <CardContent>
                <div className="grid gap-6">

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

                    <form className="grid gap-6">

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

                        <Button type="button" className="w-full" onClick={handleClick}>
                            Send Code
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}