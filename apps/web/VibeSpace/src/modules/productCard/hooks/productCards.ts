import { useEffect, useState } from "react"
import { productType } from "../schemas/productCard";
import { productCardApi } from "../api/postCardApi";



export const useProductCards = () => {

    const [productCards, setProductCards] = useState<productType[] | []>([]);


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // const res = await fetch(
                //     process.env.NODE_ENV === "development"
                //         ? "http://localhost:3000/feed"
                //         : "https://vibein-2hk5.onrender.com/feed"
                //     // "https://vibein-2hk5.onrender.com/feed"
                // );
                // const data = await res.json();
                // console.log("post", data);
             

                const data: productType[] = await productCardApi();
                setProductCards(data);

            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        fetchPosts();
    }, []);

    return { productCards };
} 