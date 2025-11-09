import { userIdClient } from '@/lib/userId'
import { useState, useEffect } from 'react'

export const useGetSendRequest = () => {

    const [sendRequest, setSendRequest] = useState([]);

    useEffect(() => {
        ;(async() => {
            try {

                const userId = await userIdClient();
                
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getSendRequest', {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId})
                })

                const data = await res.json();
                console.log(data.request);
                setSendRequest(data.request || []);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })
    })

    return sendRequest;
}