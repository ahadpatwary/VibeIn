import { otpValidateSchema, OtpValidateType } from "@/schemas/signIn.schema"
import { http } from "../../http"



export async function otpVerificationApi(email: string, value: string) {

    return http<OtpValidateType>('/api/verityOtp', {
        method: 'POST',
        body: { email, value },
        schema: otpValidateSchema,
    })

}