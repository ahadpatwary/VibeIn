


export const useAcceptRequest = (groupId: string) => {

    const acceptRequst = async (userId: string) => {
        try {
            
            const data = await fetch('https://vibein-production-d87a.up.railway.app/api/acceptRequest', {
                method: "POST",
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({userId, groupId})
            });
            console.log(data);

        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            ;
        }
    }

    return acceptRequst;
}