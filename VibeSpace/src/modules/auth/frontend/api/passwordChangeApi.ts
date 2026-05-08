import { http } from '@/shared/lib/api/http';
import { z } from 'zod'
import { PasswordChangeObjectType } from '../hooks/useLogin';

export const passwordChangeReturnSchema = z.object({
    message: z.string()
})

export type PasswordChangereturnType = z.infer<typeof passwordChangeReturnSchema>

export async function passwordChangeApi(passwordChangeObject: PasswordChangeObjectType) {

    return http<PasswordChangereturnType>('/api/verityOtp', {
        method: 'POST',
        body: passwordChangeObject,
        schema: passwordChangeReturnSchema,
    })

}