import { useState, useEffect } from 'react'


export const useCommingRequest = (groupId: string) => {
   
    const [commingRequest, setCommingRequest] = useState([]);

    useEffect(() => {
        ;( async() => {
            try {

                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getComingRequest', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({groupId})
                })

                const data = await res.json();
                console.log("commingRequest", data.request.requestUser)
                setCommingRequest(data.request.requestUser || []);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();
    },[groupId])

    return commingRequest;
}