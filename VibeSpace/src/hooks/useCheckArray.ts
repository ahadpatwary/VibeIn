'use client'
import { useEffect, useState } from "react";
import { userIdClient } from "@/lib/userId";

export const useCheckArray = ( cardId: string | undefined, property: string) => {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    (async () => {
      const userId = await userIdClient();
      if (!cardId || !userId) return;

      const res = await fetch("/api/findId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cardId, property }),
      });
      const data = await res.json();
      setExists(data.exists);
    })();
  }, [cardId, property]);

  return exists;
};