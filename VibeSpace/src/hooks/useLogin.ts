'use client'
import { useRouter } from "next/navigation";
import { useState } from "react"
import { useEffect } from 'react'
import { CreateAccountType, EmailType, OtpValidateType, ProfileType } from "@/schemas/signIn.schema";
import { checkAccountExistanceApi } from "@/lib/api/vibeIn/auth/checkEmailExistanceApi";
import { otpVerificationApi } from "@/lib/api/vibeIn/auth/otpVerificationApi";
import { createAccountApi } from "@/lib/api/vibeIn/account/createAccount";
import { tokenIssueApi } from "@/lib/api/vibeIn/auth/tokenIssueApi";


export const useLoing = () => {

    const router = useRouter();
    const [status, setStatus] = useState<"send" | "verify" | "create"> ("send");
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {

        const handleMessage = async (event: MessageEvent) => {
            try {

                if (event.origin !== "https://vibe-in-teal.vercel.app") return;
                if (event.data?.type !== "GOOGLE_AUTH_SUCCESS") return;

                const providerUniqueId = event.data?.id;

                if(!providerUniqueId) return;

                const accountInfo = {
                    type: "google" as 'google',
                    providerId: providerUniqueId,
                }

                const user: ProfileType = await checkAccountExistanceApi(accountInfo);

                if(user) {
                    console.log('user already exist');
                    return;
                }

                const { userId } = await createAccountApi({
                    type: 'google',
                    providerId: event.data.id,
                    name: event.data?.name,
                    email: event.data?.email,
                    profilePicture: event.data?.picture
                });

                await tokenIssueApi(userId);


                router.push('/register/user_details');

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(`error message${error.message}`)
                ;
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
                type: 'crediantials' as 'crediantials',
                email: email,
            }

            const user: ProfileType = await checkAccountExistanceApi(accountInfo);

            if(user) {
                console.log('user already exist');
                return;
            }

            // setStatus("verify");

        } catch (error) {
            if(error instanceof Error)
                throw new Error(`error message:${error.message}`)
            ;
        }

    }

    const otpVerification = async (otpObject: OtpValidateType) => { //*
        try {

            setStatus("create");

            const message = await otpVerificationApi(otpObject.email, otpObject.otp);

            // setStatus("create");

        } catch (error) {
            if(error instanceof Error)
                throw new Error(`error message:${error.message}`)
            ;
        }
    }

    const credentialRegister = async (createAccountObject: CreateAccountType) => {
        try {

            const { email, password } = createAccountObject;



            const { userId } = await createAccountApi({
                type: 'credentials',
                email,
                password
            })

            await tokenIssueApi(userId);

            router.push('/register/user_details');

        } catch (error) {
            if(error instanceof Error)
                throw new Error(`message: ${error.message}`)
            ;
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