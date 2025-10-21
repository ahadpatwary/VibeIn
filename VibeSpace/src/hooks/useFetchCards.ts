import { useState, useEffect } from "react";
import { userIdClient } from "@/lib/userId";


interface FetchCardResponse {
  activeCards?: ICard[];
}

interface UseCardsReturn {
  session : string | null;
  activeCards: ICard[];
  loading: boolean;
  error: string | null;
}

export const useCards = (): UseCardsReturn => {

  const [activeCards, setActiveCards] = useState<ICard[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [session , setSession ] = useState<string | null> (null);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        setSession( await userIdClient() );
        const res = await fetch(`/api/fetchCard`);

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data: FetchCardResponse = await res.json();

        setActiveCards(data.activeCards || []);

      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return {
    session,
    activeCards,
    loading,
    error,
  };
};


// const myPostActiveCards = user.cards.filter((card: ICard) => card.videoPrivacy === "public");
// const activeLikedCards = user.likedCards.filter((card: ICard) => card.videoPrivacy === "public");
// const activeSavedCards = user.savedCards.filter((card: ICard) => card.videoPrivacy === "public");