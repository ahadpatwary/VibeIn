import { useState, useEffect } from 'react'

interface blockUserType {
    _id: string, 
    name: string,
    picture: {
        public_id: string,
        url: string
    }
}

export const useGetBlockUser = (userId: string, groupId: string) => {

    const [blockUsers, setBlockUsers] = useState<blockUserType[]>([]);

    useEffect(() => {
        ;(async() => {
            try {

                const res = await fetch('', {
                    method: 'POSt',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId, groupId})
                })

                const data = await res.json();

                setBlockUsers(data.blockUser || []);

            } catch (error) {
                if(error instanceof Error)
                    throw new Error(error.message)
                ;
            }
        })();
    }, [groupId])

    return { blockUsers, setBlockUsers };
}