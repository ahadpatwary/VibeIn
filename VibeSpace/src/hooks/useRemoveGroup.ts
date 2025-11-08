


export const useRemoveGroup = (userId: string, groupId: string) => {

    const removeGroup = async () => {

        try {

            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/removeGroup', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, groupId }),
            })

            const data = await res.json();
            console.log(data.message);

        } catch (error) {
            if(error instanceof Error)
                throw new Error(error.message)
            ;
        }
    }

    return removeGroup;
}