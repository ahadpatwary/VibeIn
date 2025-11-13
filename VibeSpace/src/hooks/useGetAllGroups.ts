import { userIdClient } from '@/lib/userId';
import { useState, useEffect } from 'react'


interface propType {
  _id: string,
  groupName: string,
  groupPicture: {
    public_id: string,
    url: string,
  },
  lastMessage: string
}

export const useGetAllGroups = () => {
    const [allGroups, setAllGroups] = useState<propType[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const userId = await userIdClient();
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getTotalGroups', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });

                const data = await res.json(); // ✅ important
                setAllGroups(data.groups || []); // ✅ data থেকে group নিচ্ছি

            } catch (error) {
                if (error instanceof Error) {
                    console.error("Error fetching groups:", error.message);
                }
            }
        })();
    }, []); // ✅ dependency তে userId থাকা উচিত


    return { allGroups, setAllGroups}
};
