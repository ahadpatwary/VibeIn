"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { updateUser } from "@/lib/toggle"


interface ToggleButtonProps {
  id?: string
  name?: string
  state?: string
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export function ToggleButton({
  id,
  name,
  state,
  setIsOpen,
}: ToggleButtonProps) {
  const [active, setActive] = useState<string>(state as string)
  const [loading, setLoading] = useState(false) // 🔥 loading state

  console.log(active);

  const handleClick = () => {
    setActive((prev) => {
      if(prev == 'public'){
        performUpdate("private");
        return "private";
      }
      else{
        performUpdate("public");
        return "public";
      }
    });
  };

  const performUpdate = async (newState: string) => {
    setLoading(true);
    try {
      if (name) {
        console.log(newState);
        await updateUser(id, name, newState );
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      if (setIsOpen) setIsOpen(false);
      setLoading(false);
    }
  };


  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={loading} // operation চললে button disable থাকবে
      className={cn(
        "cursor-pointer",
      )}
    >
      {loading
        ? "Updating..." // 🔥 DB operation চললে এই লেখা
        : state
      }
    </Button>
  )
}