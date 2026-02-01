import { profileSchema, ProfileType } from "@/schemas/signIn.schema";
import { http } from "../../http";

export async function checkEmailExistanceApi(email: string) {     

    return http<ProfileType>("/api/checkEmailExistance", {
        method: 'POST',
        body: email,
        schema: profileSchema 
    })

}