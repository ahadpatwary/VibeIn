import { useState, useEffect } from "react";

interface FetchCardResponse {
  activeCards?: ICard[];
}

interface UseCardsReturn {
  activeCards: ICard[];
}

export const useCards = (): UseCardsReturn => {

  const [activeCards, setActiveCards] = useState<ICard[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`/api/fetchCard`);

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data: FetchCardResponse = await res.json();

        setActiveCards(data.activeCards || []);

      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected error occurred";
      } 
    };

    fetchCards();
  }, []);

  return { activeCards };
};


// const myPostActiveCards = user.cards.filter((card: ICard) => card.videoPrivacy === "public");
// const activeLikedCards = user.likedCards.filter((card: ICard) => card.videoPrivacy === "public");
// const activeSavedCards = user.savedCards.filter((card: ICard) => card.videoPrivacy === "public");