import { z } from 'zod'
import { http } from '@/shared/lib/api/http';

export const accountResponseSchema = z.object({
    sub: z.string(),
    deviceId: z.string(), 
    accountId: z.string(),
})

export type AccountResponseType = z.infer<typeof accountResponseSchema>;

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