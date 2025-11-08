


export const useSendGroupRequest = (userId: string, groupId: string) => {

    const sendGroupRequest = () => {

        ;(async() => {
            try {
                
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