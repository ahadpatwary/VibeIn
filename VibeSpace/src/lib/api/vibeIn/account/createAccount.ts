import { http } from "../../http";
import { z } from 'zod'

export const accountResponseSchema = z.object({
    message: z.string(),
    userId: z.string()
})

export type AccountResponseType = z.infer<typeof accountResponseSchema>

export interface userObjectType {
    type: string,
    providerId?: string,
    name?: string,
    profilePicture?: string,
    email?: string,
    password?: string,
}

export async function createAccountApi(userObject: userObjectType) {     

    return http<AccountResponseType>("/api/account/createAccount", {
        method: 'POST',
        body: userObject,
        schema: accountResponseSchema
    })

}