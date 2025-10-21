import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from 'react';


export const useSignOut = () => {
    const router = useRouter();
    const [error, setError] = useState("");

    const handleSignOut = async () => {
        const res = await signOut({ redirect: false });
        console.log(res);
        if(!res){
            setError("user signout failed");
            return;
        }

        router.push("/login");
    };
    
    return { error, handleSignOut }
}