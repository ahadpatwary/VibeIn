import { useState, useEffect } from 'react'



export const useCheckConversationExistence = (userId: string, chatWith: string) => {
    
    const [joinId, setJoinId] = useState<string | null>(null);


    useEffect(() => {
        ;(async() => {
            try {
                const res = await fetch('',{
                    method:"POST"
                })

                if(!res.ok) return;

                const data = await res.json();

                if(data.message == null){
                    setJoinId(null);
                    return;
                }

                

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }

        })();
    }, [userId, chatWith])
}