import { http } from '@/shared/lib/api/http';
import { z } from 'zod'
import { OtpValidateType } from "../schemas/signIn.schema";

export const otpVerificationReturnSchema = z.object({
    message: z.string()
})

export type OtpVerificationType = z.infer<typeof otpVerificationReturnSchema>

export async function otpVerificationApi(otpObject: OtpValidateType) {

    return http<OtpVerificationType>('/api/verityOtp', {
        method: 'POST',
        body: otpObject,
        schema: otpVerificationReturnSchema,
    })

}