"use client";
import { useState, useEffect } from "react";
import { useToggleArray } from "@/hooks/useToggleArray";
import { useCheckArray } from "@/hooks/useCheckArray";
import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";

export const LikeButton = ({ cardId }: { cardId?: string }) => {
  const [liked, setLiked] = useState(false);
  const { toggleArray, loading } = useToggleArray();

  // ✅ Hook টা টপ লেভেলে কল করতে হবে (useEffect এর ভিতরে না)
  const exists = useCheckArray(cardId, "likedCards");

  // ✅ exists change হলে state update করো
  useEffect(() => {
    if (exists !== liked) {
      setLiked(exists);
    }
  }, [exists]);

  // ✅ click handler
  const handleToggle = async () => {
    setLiked(prev => !prev); // instant UI update
    const res = await toggleArray(cardId, "likedCards");
    if (res?.liked === undefined) {
      setLiked(prev => !prev); // revert if failed
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 ${
        liked ? " text-blue " : "text-black "
      }`}
    >
      {liked ? <AiFillLike className="size-5 " /> : <AiOutlineLike className="size-5"/> }
    </button>
  );
};