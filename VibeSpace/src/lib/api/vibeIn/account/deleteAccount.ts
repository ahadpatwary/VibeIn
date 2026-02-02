import { createAccountSchema, profileSchema, ProfileType } from "@/schemas/signIn.schema";
import { http } from "../../http";

export async function deleteAccountApi(email: string) {     

    return http<AccountType>("/api/account/deleteAccount", {
        method: 'POST',
        body: email,
        schema: accountSchema 
    })

}