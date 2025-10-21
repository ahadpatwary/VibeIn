import { getData } from "@/lib/getData";
import { userIdClient } from "@/lib/userId";
import { useState, useEffect } from 'react'

interface dataType {
    name:string;
    email: string;
    picture:{
        url:string;
        public_id:string;
    }
}

export const useProfileInformation = () => {
    const [userName, setUserName] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string> ("");


    useEffect(() =>{

        ( async ()=>{
            try {

                const userId = await userIdClient();
                if(!userId){
                    setError("user Id not find");
                    return;
                }

                const data: dataType = await getData(userId as string, "User", ["name", "email", "picture"]);

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