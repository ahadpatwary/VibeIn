import { useState, useEffect } from 'react'


interface propType {
  _id: string,
  extraFields: {
    groupName: string,
    groupPicture: {
      public_id: string,
      url: string,
    }
  }
}
export const useGetAllGroups = () => {
    const [allGroups, setAllGroups] = useState<propType[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getTotalGroups');

                const data = await res.json(); // ✅ important
                console.log("Fetched groups:", data.groups); // ✅ check fetched data
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
