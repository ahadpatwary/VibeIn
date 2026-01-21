"use client";

import { useEffect, useState } from "react";
import { getData } from "@/lib/getData";
import { useSession } from "next-auth/react";


// User model থেকে যে data আসবে
interface UserData {
  cards?: ICard[];
  likedCards?: ICard[];
  savedCards?: ICard[];
}

export default function useFeed() {
  const [data, setData] = useState<ICard[]>([]);
  const { data: session } = useSession();
  const id = session?.user.id || "12345"

  useEffect(() => {
    ;(async () => {
      try {

        if (!id) throw new Error("User ID missing");

        // এখানে generic টাইপ পাস করা হলো ✅
        const result = await getData(id);

        setData(result.cards || []);
      } catch (err) {
        console.error("useFeed error:", err);
        if (err instanceof Error) {
          throw new Error(err.message);
        }
      } 
    })();
  }, [ id]);

  return { data };
}