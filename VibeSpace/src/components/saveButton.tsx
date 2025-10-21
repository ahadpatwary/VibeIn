"use client";
import { useState, useEffect } from "react";
import { useToggleArray } from "@/hooks/useToggleArray";
import { useCheckArray } from "@/hooks/useCheckArray";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AiTwotonePushpin } from "react-icons/ai";
import { RiUnpinLine } from "react-icons/ri";


export const SaveButton = ({ cardId }: { cardId?: string }) => {
  const [saved, setSaved] = useState(false);
  const { toggleArray, loading } = useToggleArray();

  // ✅ Hook টা টপ লেভেলে কল করতে হবে (useEffect এর ভিতরে না)
  const exists = useCheckArray(cardId, "savedCards");

  // ✅ exists change হলে state update করো
  useEffect(() => {
    if (exists !== saved) {
      setSaved(exists);
    }
  }, [exists]);

  // ✅ click handler
  const handleToggle = async () => {
    setSaved(prev => !prev); // instant UI update
    const res = await toggleArray(cardId, "savedCards");
    if (res?.liked === undefined) {
      setSaved(prev => !prev); // revert if failed
    }
  };

  return (
    <Button
      variant="outline"
      className="p-0 h-8 w-8 flex justify-center items-center rounded-full cursor-pointer"
      onClick={() => {
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
        handleToggle(); // এখানে toggle call করা হলো
      }}
      disabled={loading}
    >
      {saved ? <RiUnpinLine /> : <AiTwotonePushpin />}
    </Button>

  )
};