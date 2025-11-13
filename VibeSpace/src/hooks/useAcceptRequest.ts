


export const useAcceptRequest = (groupId: string) => {

    const acceptRequst = async (userId: string) => {
        try {
            
            const data = await fetch('', {
                method: "POST",
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({userId, groupId})
            });

        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            ;
        }
    }

    return acceptRequst;
}