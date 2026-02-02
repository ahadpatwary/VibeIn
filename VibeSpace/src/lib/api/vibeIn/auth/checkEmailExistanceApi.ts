import { profileSchema, ProfileType } from "@/schemas/signIn.schema";
import { http } from "../../http";

interface accountInfoType {
    type: 'crediantials' | 'google' | 'github',
    email?: string,
    providerId?: string,
}

export async function checkAccountExistanceApi(accountInfo: accountInfoType) {     

    return http<ProfileType>("/api/checkEmailExistance", {
        method: 'POST',
        body: accountInfo,
        schema: profileSchema 
    })

}