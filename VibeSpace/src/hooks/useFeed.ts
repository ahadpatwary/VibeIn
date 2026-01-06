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

export default function useFeed(property: keyof UserData, owner: boolean = true, userId?: string) {
  const [data, setData] = useState<ICard[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: session } = useSession();
        const id = owner ? session?.user.id : userId ;
        if (!id) throw new Error("User ID missing");

        // এখানে generic টাইপ পাস করা হলো ✅
        const result = await getData<UserData>(id, "User", [property]);

        const cards = Array.isArray(result[property]) ? result[property]! : [];

        if (property === "cards" && owner) {
          setData(cards);
          return;
        }

        // শুধু public post রাখবে
        const publicPosts = cards.filter(
          (card) => card.videoPrivacy === "public"
        );

        setData(publicPosts);
      } catch (err) {
        console.error("useFeed error:", err);
        if (err instanceof Error) {
          throw new Error(err.message);
        }
      } 
    })();
  }, [property, owner, userId]);

  return { data };
}