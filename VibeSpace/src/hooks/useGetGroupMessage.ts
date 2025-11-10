import { useState, useEffect } from 'react'


export const useGetGroupMessage = (groupId: string) => {
    
    const [groupMessage, setGroupMessage] = useState([]);

    useEffect(() => {
        ;(async() => {
            try {
                
                const res = await fetch('', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({groupId})
                })

                const data = await res.json();
                setGroupMessage(data.messages || []);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();
    }, [])
    return { groupMessage, setGroupMessage }
}