import { useState, useMemo } from "react";
// import debounce from "lodash.debounce";
import { debounce } from "lodash";
import { userProfileType } from "../components/UserProfile";

export const useSearchUser = () => {
    const [searchUser, setSearchUser] = useState<userProfileType[]>([]);


    const searchFn = async (query: string) => {
        console.log("query", query);
        if (query.length < 3) {
            setSearchUser([]);
            return;
        }

        // const res = await fetch(`http://localhost:3000/users/?name=${query}`);
        const res = await fetch(`https://vibein-2hk5.onrender.com/users/?name=${query}`);

        if (!res.ok) {
            console.log("some error exist");
            return;
        }

        const data = await res.json();
        console.log("users", data);

        setSearchUser(data || []);
    }

    const handleSearchClick = useMemo(
        () => debounce(searchFn, 500),
        []
    );

    return { searchUser, handleSearchClick };
}