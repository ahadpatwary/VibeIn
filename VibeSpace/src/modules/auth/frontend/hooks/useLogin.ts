'use client'
import { z } from 'zod'
import { credentialsLoginApi } from '../api/credentialsLoginApi';
import { useRouter } from 'next/navigation';
import { forgetPasswordApi } from '../api/forgetPasswordApi';
import { loginOtpVerificationApi } from '../api/loginOtpVerificationApi';
import { createAccountSchema, otpValidateSchema, OtpValidateType } from '../schemas/signIn.schema';
import { passwordChangeApi } from '../api/passwordChangeApi';
export const credentialsLoginObjectSchema = z.object({
    email: z.string().email().trim(),
    password: z.string().min(4).max(6)
})

export type CredentialsLoginObjectType = z.infer<typeof credentialsLoginObjectSchema>;

export const passwordChangeObjectSchema = createAccountSchema;

export type PasswordChangeObjectType = z.infer<typeof passwordChangeObjectSchema>


export const useLogin = () => {

    const router = useRouter();

    const googleLogin = () => {
        console.log("google login");
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