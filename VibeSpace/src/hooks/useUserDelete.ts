"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export const useUserDelete = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setLoading(true);
            
            const res = await fetch('/api/deleteUser', { method: "DELETE" });

            const data = await res.json();

            if (!res.ok){
                return { success: false, message: data.message || "API call failed" };
            }

            await signOut({ redirect: false });

            router.push('/');

            return { success: true, message: "Account delete successfully"};

        } catch (error) {
            console.error(error);
            return { success: false, message: "Internal sesrver Error"};
        } finally {
            setLoading(false);
        }
    }

    return { loading, setLoading, handleDelete };
}