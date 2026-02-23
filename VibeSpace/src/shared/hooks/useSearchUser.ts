import { useState, useMemo } from "react";
// import debounce from "lodash.debounce";
import { debounce } from "lodash";

export const useSearchUser = () => {
    const [searchUser, setSearchUser] = useState([]);


    const searchFn = async (query: string) => {
        console.log("query", query);
        if(query.length < 3) {
            setSearchUser([]);
            return;
        }

        // const res = await fetch(`http://localhost:3000/users/?name=${query}`);
        const res = await fetch(`https://vibein-2hk5.onrender.com/users/?name=${query}`);

        if(!res.ok){
            console.log("some error exist");
            return;
        }

        const { users } = await res.json();
        console.log("users", users);

        setSearchUser(users || []);
    }

        const handleSearchClick = useMemo(
            () => debounce(searchFn, 500),
            []
        );

    return { searchUser, handleSearchClick };
}