import { useState } from "react";
import { toggleArrayApi } from "@/lib/toggleArrayApi";
import { userIdClient } from "@/lib/userId";


export const useToggleArray = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleArray = async (cardId: string | undefined, property: string) => {
    setLoading(true);
    setError(null);
    const userId = await userIdClient();
    if (!cardId || !userId) return;

    try {
      const result = await toggleArrayApi(userId, cardId, property);
      return result; // e.g. { liked: true }
    } catch (err) {
      console.error(err);
      setError("Failed to toggle array item");
    } finally {
      setLoading(false);
    }
  };

  return { toggleArray, loading, error };
};