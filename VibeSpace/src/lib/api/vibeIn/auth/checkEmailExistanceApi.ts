import { http } from "../../http";
import { z } from 'zod' 

interface accountInfoType {
    type: 'crediantials' | 'google' | 'github',
    email?: string,
    providerId?: string,
}

export const accountExistanceReturnSchema = z.object({
    message: z.string().trim(),
    account: z.boolean()
})

export type AccountExistanceReturnType = z.infer<typeof accountExistanceReturnSchema>;


export async function checkAccountExistanceApi(accountInfo: accountInfoType) {     

    return http<AccountExistanceReturnType>("/api/auth/checkAccountExistance", {
        method: 'POST',
        body: accountInfo,
        schema: accountExistanceReturnSchema 
    })

}