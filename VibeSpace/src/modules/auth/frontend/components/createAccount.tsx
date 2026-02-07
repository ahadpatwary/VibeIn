'use client'
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { CreateAccountType } from "@/schemas/signIn.schema"
import { Dispatch, SetStateAction } from "react"


interface PropsType {
    createAccountObject: CreateAccountType;
    setCreateAccountObject: Dispatch<SetStateAction<CreateAccountType>>;
};

export function CreateAccount({createAccountObject, setCreateAccountObject}: PropsType){ 
    return (
        <>
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
        </>
    )
}

export default CreateAccount