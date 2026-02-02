import { http } from "../../http";
import { z } from 'zod'


export async function tokenIssueApi(userId: string) {    

    return http<string>('api/auth/token', {
        method: 'POST',
        body: { userId },
        schema: z.string()
    })
        
}