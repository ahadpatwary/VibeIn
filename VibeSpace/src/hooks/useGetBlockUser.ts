import { useState, useEffect } from 'react'

interface blockUserType {
    _id: string, 
    name: string,
    picture: {
        public_id: string,
        url: string
    }
}

export const useGetBlockUser = (groupId: string) => {

    const [blockUsers, setBlockUsers] = useState<blockUserType[]>([]);

    useEffect(() => {
        ;(async() => {
            try {

                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getBlockUser', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({groupId})
                })

                const data = await res.json();

                console.log("blockUsers",data.blockUser.blockedUser)

                setBlockUsers(data.blockUser.blockedUser || []);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();
    }, [groupId])

    return { blockUsers, setBlockUsers };
}