'use client'
import { getSession } from "next-auth/react";
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { useEffect } from 'react'
import { CreateAccountType, EmailType, OtpValidateType, ProfileType } from "@/schemas/signIn.schema";
import { checkEmailExistanceApi, otpVerificationApi, refreshTokenIssueApi } from "@/lib/api/auth";


export const useLoing = () => {

    const router = useRouter();
    const [status, setStatus] = useState<"send" | "verify" | "create"> ("send");
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {

        const handleMessage = async (event: MessageEvent) => {
            try {

                if (event.origin !== "https://vibe-in-teal.vercel.app") return;
                if (event.data?.type !== "GOOGLE_AUTH_SUCCESS") return;

                const email = event.data?.email;

                if(!email) return;

                const user: ProfileType = await checkEmailExistanceApi(email);

                if(user) {
                    console.log('user already exist');
                    return;
                }

                await signIn('credentials', {
                    payload: JSON.stringify({
                        name: event?.data?.name,
                        email: event?.data?.email,
                        image: event?.data?.picture,
                    }),
                    redirect: false
                });

                refreshTokenIssueApi(email);

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
        try {

            await signIn("github", { callbackUrl: '/register/user_details'});

            // refreshTokenIssueApi(email);

        } catch (error) {
            if(error instanceof Error)
                throw new Error(`error message ${error.message}`)
            ;
        }
    }

    const checkEmailExistance = async (email: EmailType) => { //*

        try {

            const user: ProfileType = await checkEmailExistanceApi(email);

            if(user) {
                console.log('user already exist');
                return;
            }

            setStatus("verify");

        } catch (error) {
            if(error instanceof Error)
                throw new Error(`error message:${error.message}`)
            ;
        }

    }

    const otpVerification = async (otpObject: OtpValidateType) => { //*
        try {

            const message = await otpVerificationApi(otpObject.email, otpObject.otp);

            setStatus("create");

        } catch (error) {
            if(error instanceof Error)
                throw new Error(`error message:${error.message}`)
            ;
        }
    }

    const credentialRegister = async (createAccountObject: CreateAccountType) => {
        try {

            const { email, password } = createAccountObject;

            await signIn('credentials', {
                payload: JSON.stringify({
                    email: email,
                    password: password
                }),
                redirect: false
            });

            refreshTokenIssueApi(email);

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