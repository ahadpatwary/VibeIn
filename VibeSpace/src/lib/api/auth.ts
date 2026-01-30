import { profileSchema } from "@/schemas/signIn.schema";
import { z } from 'zod'

export async function checkEmailExistanceApi(email: string) {
    try { 
        
        const res = await fetch("/api/checkEmailExistance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }

        const { user } = await res.json();

        const parsed = profileSchema.safeParse(user);
        if (!parsed.success) {
            console.error(parsed.error);
            throw new Error("Invalid API response shape");
        }

        return user;

    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}

export async function otpVerificationApi(email: string, value: string) {
    try {

        const res = await fetch('/api/verifyOtp', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, value }),
        })

        if(!res.ok){
            throw new Error(`request failed ${res.status}`)
        }

        const { message } = await res.json();

        const parsed = z.string().safeParse(message)

        if(!parsed.success){
            throw new Error("Invalid API Response shape")
        }

        return message;

    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}


export async function refreshTokenIssueApi() {
    try {
        
        
    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}