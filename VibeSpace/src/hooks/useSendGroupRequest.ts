import { userIdClient } from "@/lib/userId";



export const useSendGroupRequest = () => {

    const sendGroupRequest = (groupId: string) => {

        ;(async() => {
            try {
                
                const userId = await userIdClient();
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/sendGroupRequest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, groupId })
                });

                const data = await res.json();
                console.log(data.message);
            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();
    }

    return sendGroupRequest;
}