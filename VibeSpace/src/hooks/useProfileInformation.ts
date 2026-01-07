'use client'
import { getData } from "@/lib/getData";
import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react'

interface dataType {
    name:string;
    email: string;
    picture:{
        url:string;
        public_id:string;
    }
}

export const useProfileInformation = (chatWith?: string) => {
    const [userName, setUserName] = useState<string>("ahad");
    const [profilePicture, setProfilePicture] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string> ("");


    const {data: session} = useSession();
    const userId = chatWith || session?.user.id;

    useEffect(() =>{
        ( async ()=>{
            try {

                if(!userId){
                    setError("user Id not find");
                    return;
                }

                const data: dataType = await getData(userId, "User", ["name", "email", "picture"]);

                if(!data.name || !data.email || !data.picture?.url){;
                    return;
                }

                setUserName(data.name);
                setEmail(data.email);
                setProfilePicture(data.picture.url);

            } catch (error) {
                console.error(error);
                setError("Internal server Error!");
            }

        })();
    },[])
    
    return { userName, email, profilePicture, error }
}