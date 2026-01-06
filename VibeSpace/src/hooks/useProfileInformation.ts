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
    const [userName, setUserName] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string> ("");


    useEffect(() =>{

        ( async ()=>{
            try {

                const {data: session} = useSession();
                const userId = chatWith || session?.user.id;
                if(!userId){
                    setError("user Id not find");
                    return;
                }

                const data: dataType = await getData(userId, "User", ["name", "email", "picture"]);

                if(!data.name || !data.email || !data.picture?.url){
                    setError("data not comint from server");
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