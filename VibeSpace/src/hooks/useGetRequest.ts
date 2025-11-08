import { useState, useEffect } from 'react'


export const useGetRequest = (groupId: string) => {
   
    const [commingRequest, setCommingRequest] = useState([]);
    
    try {
        useEffect(() => {
            ;(async() => {

                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getComingRequest', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ groupId }),
                });

                const data = await res.json();
                setCommingRequest(data.request || []);
            })
        },[groupId])

    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }

    return commingRequest;
}