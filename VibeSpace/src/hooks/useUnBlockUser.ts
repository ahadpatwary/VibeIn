


export const useUnBlockUser = (groupId: string) => {

    const unBlockUser = async (userId: string) => {
        try {
            const data = await fetch('https://vibein-production-d87a.up.railway.app/api/unBlockUser', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({groupId, userId})
            })
        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            ;
        }
    }

    return unBlockUser;
}