import { http } from '@/shared/lib/api/http';
import { z } from 'zod'
import { OtpValidateType } from "../schemas/signIn.schema";

export const loginOtpVerificationReturnSchema = z.object({
    message: z.string()
})

export type LoginOtpVerificationReturnType = z.infer<typeof loginOtpVerificationReturnSchema>

export async function loginOtpVerificationApi(otpObject: OtpValidateType) {

    return http<LoginOtpVerificationReturnType>('/api/verityOtp', {
        method: 'POST',
        body: otpObject,
        schema: loginOtpVerificationReturnSchema,
    })

}