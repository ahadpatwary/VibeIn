import { userIdClient } from "@/lib/userId";
import { useState, useEffect } from "react";


const useGetConversation = () => {
    const [conversations, setConversations] = useState([]);
    
    useEffect(() => {
        ;( async () => {

            const userID = await userIdClient()!;
        
            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getConversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID }),
            });
        
            if (!res.ok) {
                console.error('Something went wrong');
                return;
            }
        
            const data = await res.json();
            console.log("data", data.conversations);
            setConversations(data.conversations || []);

        })();
    }, []);
    return conversations;
}
export default useGetConversation;