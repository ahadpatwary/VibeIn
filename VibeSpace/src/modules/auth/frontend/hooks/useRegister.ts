'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { z } from 'zod'
import { AccountExistanceReturnType } from "../api/checkEmailExistanceApi";
import { otpVerificationApi } from "../api/otpVerificationApi";
import { checkAccountExistanceApi } from "../api/checkEmailExistanceApi";
import { CreateAccountType, EmailType, OtpValidateType, ProfileType } from "../schemas/signIn.schema";
import { createAccountApi } from "../api/createAccountApi";

// ✅ Schema ঠিক করো
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


export const useRegister = () => {

    const router = useRouter();
    const [status, setStatus] = useState<"send" | "verify" | "create">("send");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleMessage = async (e: MessageEvent) => { // ✅ MessageEvent type
        try {

            console.log("Received message:", e?.origin, e?.data);

        // ✅ এভাবে parse করো — e.origin আর e.data আলাদা
        const parsed = eventObjectSchema.safeParse({
            origin: e.origin,
            data: e.data        // postMessage এ যা পাঠিয়েছ সেটা e.data তে আসে
        });

        if (!parsed.success) {
            // console.log(parsed.error.format());
            console.log("ahad error");
            return;
        }

        console.log("nahid patwary", parsed?.data)
        const event = parsed.data;

        // ✅ Origin check
        if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;
        console.log("hi");

        // ✅ Type check
        if (event.data.type !== "GOOGLE_AUTH_SUCCESS") return;
        console.log("how are you")

        // const { accessToken, id, name, email, picture } = event?.data;

        // ✅ accessToken memory/state এ রাখো
        // setAccessToken(accessToken); // zustand/context/state যেটা use করছ

        console.log("User data:", event?.data);

        router.push('/register/user_details');

        } catch (error) {
        if (error instanceof Error)
            console.error(`Error: ${error.message}`);
        }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    }, []);


    const googleRegister = () => {
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
    };

    const githubRegister = async () => {
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

    const checkEmailExistance = async (email: EmailType) => { //*

        try {

            setStatus("verify");

            const accountInfo = {
                type: 'credentials' as 'credentials',
                email: email,
            }

            const account: AccountExistanceReturnType = await checkAccountExistanceApi(accountInfo);

            if (account) {
                console.log('account already exist');
                return;
            }

            // setStatus("verify");

        } catch (error) {
            if (error instanceof Error)
                throw new Error(`error message:${error.message}`)
                ;
        }

    }

    const otpVerification = async (otpObject: OtpValidateType) => { //*
        try {

            setStatus("create");

            const message = await otpVerificationApi(otpObject);

            // setStatus("create");

        } catch (error) {
            if (error instanceof Error)
                throw new Error(`error message:${error.message}`)
                ;
        }
    }

    const credentialRegister = async (createAccountObject: CreateAccountType) => {
        try {

            const { email, password } = createAccountObject;

            const { sub, accountId, deviceId } = await createAccountApi({
                type: 'credentials',
                email,
                password
            })

            console.log(sub, accountId, deviceId);

            router.push('/register/user_details');

        } catch (error) {
            if (error instanceof Error)
                throw new Error(`message: ${error.message}`);
        }
    }

    return {
        status,
        loading,
        googleRegister,
        githubRegister,
        checkEmailExistance,
        otpVerification,
        credentialRegister
    }
}

export const policyInfo = {
    description: "Access your workspace, manage your activity, and stay in control of everything that matters.",
    options: [
        {
            marker: '✓',
            title: 'Secure Authentication',
            about: 'Industry-standard encryption and protection.'
        },
        {
            marker: '⚡',
            title: 'Fast Performance',
            about: 'Optimized for speed and reliability.'
        },
        {
            marker: '🔒',
            title: 'Full Data Control',
            about: 'Your information stays private and protected.'
        }
    ],
    fotterInfo: 'Trusted by professionals worldwide.'
}