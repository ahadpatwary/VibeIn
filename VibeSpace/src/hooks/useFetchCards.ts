import { useState, useEffect } from "react";

interface FetchCardResponse {
  activeCards: ICard[];
}

export const useCards = (userId: string): FetchCardResponse => {

  const [activeCards, setActiveCards] = useState<ICard[]>([]);

  useEffect(() => {

    ;( async () => {
      try {
        const res = await fetch(`/api/fetchCard`);

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data: FetchCardResponse = await res.json();
        console.log("cardData", data);

        setActiveCards(data.activeCards || []);

      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected error occurred";
      } 
    })();

  }, [userId]);

  return { activeCards };
};