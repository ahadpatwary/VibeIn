'use client'
import { z } from 'zod'
import { credentialsLoginApi } from '../api/credentialsLoginApi';
import { useRouter } from 'next/navigation';
import { forgetPasswordApi } from '../api/forgetPasswordApi';
import { loginOtpVerificationApi } from '../api/loginOtpVerificationApi';
import { createAccountSchema, otpValidateSchema, OtpValidateType } from '../schemas/signIn.schema';
import { passwordChangeApi } from '../api/passwordChangeApi';
import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/lib/hooks';
import { setAccessToken } from '@/shared/lib/features/accessToken/accessTokenSlice';

export const credentialsLoginObjectSchema = z.object({
    email: z.string().email().trim(),
    password: z.string().min(4).max(6)
})

export type CredentialsLoginObjectType = z.infer<typeof credentialsLoginObjectSchema>;

export const passwordChangeObjectSchema = createAccountSchema;

export type PasswordChangeObjectType = z.infer<typeof passwordChangeObjectSchema>

export const eventObjectSchema = z.object({
  origin: z.string(),
  data: z.object({
    type: z.string().trim(),
    id: z.string().trim(),
    name: z.string().optional(),
    email: z.string().optional(),
    picture: z.string().optional(),
    accessToken: z.string()
  })
});

export type EventObjectType = z.infer<typeof eventObjectSchema>;

export const useLogin = () => {

    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {

        const handleMessage = async (e: MessageEvent) => { // ✅ MessageEvent type
            try {

                if(!(e?.data?.id)) return;

                console.log("Received message:", e?.origin, e?.data);

                const parsed = eventObjectSchema.safeParse({
                    origin: e.origin,
                    data: e.data        
                });

                if (!parsed.success) {
                    console.log("data error error");
                    return;
                }

                const event = parsed.data;

                // Origin check
                if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

                // Type check
                if (event.data.type !== "GOOGLE_AUTH_SUCCESS") return;

                //SET ACCESS TOKEN IN REDUX/CONTEXT/STATE
                dispatch(setAccessToken(event.data.accessToken));

                router.push('/register/user_details');

            } catch (error) {
                if (error instanceof Error)
                    console.error(`Error: ${error.message}`)
                ;
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);
    

    const googleLogin = () => {

        const state = crypto.randomUUID(); // import crypto from "crypto"

        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
            response_type: "code",
            scope: "openid email profile",
            state,
            prompt: "consent",
        });

        const googleUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();

        window.open(googleUrl, "_blank", "width=600,height=600");
    }

    const gitHubLogin = () => {
        console.log("github login");
    }

    const credentialsLogin = async (credentialsLoginObject: CredentialsLoginObjectType) => {

        const parsed = credentialsLoginObjectSchema.safeParse(credentialsLoginObject);

        if (!parsed.success) {
            console.log(parsed.error.flatten());
            return;
        }

        await credentialsLoginApi(parsed.data);

        router.push('/feed');
    }

    const forgetPassword = async (email: string) => {

        const parsed = z.string().email().trim().safeParse(email);

        if (!parsed.success) {
            console.log(parsed.error.flatten());
            return;
        }

        await forgetPasswordApi(parsed.data);
    }

    const loginOtpVerification = async (otpVerificationObject: OtpValidateType) => {

        const parsed = otpValidateSchema.safeParse(otpVerificationObject);

        if (!parsed.success) {
            console.log(parsed.error.flatten());
            return;
        }

        await loginOtpVerificationApi(parsed.data);
    }

    const passwordChange = async (passwordChangeObject: PasswordChangeObjectType) => {

        const parsed = passwordChangeObjectSchema.safeParse(passwordChangeObject);

        if (!parsed.success) {
            console.log(parsed.error.flatten());
            return;
        }

        await passwordChangeApi(parsed.data);
    }

    return {
        googleLogin,
        gitHubLogin,
        credentialsLogin,
        forgetPassword,
        loginOtpVerification,
        passwordChange
    }
}


export const policyInfo = {
    description: "Start your journey with VibeIn and unlock a smarter way to connect, share, and grow.",
    options: [
        {
            marker: '✓',
            title: 'Quick Setup',
            about: 'Get started in minutes with a simple registration process.'
        },
        {
            marker: '⚡',
            title: 'Seamless Experience',
            about: 'Designed for smooth performance across all devices.'
        },
        {
            marker: '🔒',
            title: 'Privacy First',
            about: 'We prioritize your security from day one.'
        }
    ],
    fotterInfo: 'Join professionals worldwide and build meaningful connections.'
}