import { http } from '@/shared/lib/api/http';
import { z } from 'zod'

export const tokenReturnSchema = z.object({
    sub: z.string(),
    deviceId: z.string(), 
    accountId: z.string(),
})

export type TokenReturnType = z.infer<typeof tokenReturnSchema>;


export async function tokenIssueApi(userId?: string) {    

    return http<TokenReturnType>('api/auth/token', {
        method: 'POST',
        body: { userId },
        schema: tokenReturnSchema
    })
        
}