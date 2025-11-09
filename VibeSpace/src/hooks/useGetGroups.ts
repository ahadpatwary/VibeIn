import { userIdClient } from '@/lib/userId';
import { useState, useEffect } from 'react'


export const useGetGroups = () => {

        
    const [getGroups, setGetGroups] = useState([]);

    useEffect(() => {
        try {
            ;(async() => {
            
                const userId = await userIdClient();

                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getGroups', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                })

                const data = await res.json();
                setGetGroups(data.groups || []);
            })();

        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            ;
        }

    }, [])

    return getGroups;
}
