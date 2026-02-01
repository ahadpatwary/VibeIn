import { http } from "../../http";
import { z } from 'zod'


export async function refreshTokenIssueApi(email: string) {    

    return http<string>('api/auth/refreshTokenIssue', {
        method: 'POST',
        body: email,
        schema: z.string()
    })
        
}