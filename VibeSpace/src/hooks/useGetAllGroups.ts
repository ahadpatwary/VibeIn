import { useState, useEffect } from 'react'

export const useGetAllGroups = (userId: string) => {
    const [allGroups, setAllGroups] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getAllGroups', {
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
    }, [userId]); // ✅ dependency তে userId থাকা উচিত

    return allGroups;
};
