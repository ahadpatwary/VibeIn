// 'use client'
// import VerifyEmailFlow from "@/modules/auth/frontend/components/Verifyemailflow";
// import { useRouter, useSearchParams } from "next/navigation";

 
// export default function Page() {
//     const router = useRouter();
//     const params = useSearchParams();

//     const tempToken = params.get("token") || "";
//     const provider = params.get("provider") || "oauth";

//     if(!tempToken) {
//         router.push('/login');
//         return null;
//     }

//     return <VerifyEmailFlow 
//         tempToken={tempToken}
//         provider={provider}
//     />;

// }

import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page