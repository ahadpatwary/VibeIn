import { http } from '@/shared/lib/api/http';
import { z } from 'zod'

export const forgetPasswordReturnSchema = z.object({
    message: z.string(),
    otpSendSuccessFully: z.boolean()
})


export type forgetPasswordReturnType = z.infer<typeof forgetPasswordReturnSchema>

export async function forgetPasswordApi(email: string) {

    return http<forgetPasswordReturnType>('/api/verityOtp', {
        method: 'POST',
        body: { email },
        schema: forgetPasswordReturnSchema,
    })

}