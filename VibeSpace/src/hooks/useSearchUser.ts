import { useState } from "react";

export const useSearchUser = () => {
    const [searchUser, setSearchUser] = useState([]);

    const handleSearchClick = async (query: string) => {
        if(query.length < 3) return;

        const res = await fetch('/api/searchName', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: "1234", query })
        });

        if(!res.ok){
            console.log("some error exist");
            return;
        }

        const { users } = await res.json();
        console.log("users", users);

        setSearchUser(users || []);
    }

    return { searchUser, handleSearchClick };
}