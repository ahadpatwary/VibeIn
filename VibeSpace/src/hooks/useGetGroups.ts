import { useState, useEffect } from 'react'



export const useGetAllGroups = ( userId: string ) => {
    try {
        
        const [getGroups, setGetGroups] = useState([]);

        useEffect(() => {
            ;(async() => {
                
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getGroups', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                })

                const data = await res.json();
                setGetGroups(data.groups || []);
            })
        }, [userId])

        return getGroups;

    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}