import { http } from '@/shared/lib/api/http';
import { z } from 'zod'
import { CredentialsLoginObjectType } from '../hooks/useLogin';

export const credentialsLoginReturnObjectSchema = z.object({
    sub: z.string(),
    deviceId: z.string(), 
    accountId: z.string(),
})


export type  CredentialsLoginReturnObjectType = z.infer<typeof credentialsLoginReturnObjectSchema>

export async function credentialsLoginApi(credentialsLoginObject: CredentialsLoginObjectType) {

    return http<CredentialsLoginReturnObjectType>('/api/verityOtp', {
        method: 'POST',
        body: credentialsLoginObject,
        schema: credentialsLoginReturnObjectSchema,
    })

}