'use client'
import LinkProviderVerifyFlow from "@/modules/auth/frontend/components/LinkProviderVerifyFlow";
import { useRouter, useSearchParams } from "next/navigation";
 
export default function Page() {
    const router = useRouter();
    const params = useSearchParams();

    const provider = params.get("provider") || "oauth";
    const email = params.get('email') ?? "";

    // console.log("tem", tempToken, "provi", provider,"email", email)

    if (!email) {
        router.push("/login");
        return null;
    }

    return <LinkProviderVerifyFlow maskedEmail={email} providerName={provider} />;
}