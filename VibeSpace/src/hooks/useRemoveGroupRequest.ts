


export const useRemoveGroupRequest = (userId: string, groupId: string) => {
    
    const removeGroupRequest = () => {
        try {
            
            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/cancleRequest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({userId, groupId});
            });

            const data = await res.json();
            console.log(data.message);

        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            ;
        }
    }

    return removeGroupRequest;
}