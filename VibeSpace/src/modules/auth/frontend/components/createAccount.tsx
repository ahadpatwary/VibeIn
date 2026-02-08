'use client'
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { CreateAccountType } from "../schemas/signIn.schema"
import { Dispatch, SetStateAction } from "react"
import { Header } from "./header"
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { AiOutlineArrowLeft } from "react-icons/ai";


interface PropsType {
    createAccountObject: CreateAccountType;
    setCreateAccountObject: Dispatch<SetStateAction<CreateAccountType>>;
};

export function CreateAccount({createAccountObject, setCreateAccountObject}: PropsType){ 
    return (
        <Card >
            <Header 
                title="Create an Account"
                description="Enter your email below to create to your account"
                backRouter="\register"
                backText={<AiOutlineArrowLeft size={20} className="" /> }
            />

            <CardContent className="grid gap-6">

                <div className="grid gap-3">
                    <Label htmlFor="password">password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="password"
                        required
                        value={createAccountObject.password}
                        onChange={(e) => 
                            setCreateAccountObject((prev: CreateAccountType) => ( { ...prev, password: e.target.value }) )
                        }
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="confrime password">confrime password</Label>
                    <Input
                        id="confrime password"
                        type="password"
                        placeholder="confrime password"
                        required
                        value={createAccountObject.confirmPassword}
                        onChange={(e) => setCreateAccountObject((prev: CreateAccountType) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="button" className="w-full" >
                    Create Account
                </Button>
            </CardFooter>
        </Card>
    )
}

export default CreateAccount