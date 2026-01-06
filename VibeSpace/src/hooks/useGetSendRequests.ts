import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'

interface propType {
  _id: string,
  groupName: string,
  groupPicture: {
    public_id: string,
    url: string,
  },
  lastMessage: string
}

export const useGetSendRequest = () => {

    const [sendRequest, setSendRequest] = useState<propType[]>([]);

    useEffect(() => {
        ;(async() => {
            try {

                const {data: session } = useSession();
                const userId = session?.user.id;
                
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getSendRequest', {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId})
                })

                const data = await res.json();
                console.log('data',data, data.request);
                setSendRequest(data.request || []);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();
    },[])

    return {sendRequest, setSendRequest};
}