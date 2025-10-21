"use client";

import { HiDotsHorizontal } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface CustomDotProps {
  children: (props: {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => ReactNode;
  className?: string;
}

function Dot({ children, className }: CustomDotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"down" | "up">("down");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);

  // when open → check space & set dropdown position
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setPosition("up"); // ওপরে দেখাবে
      } else {
        setPosition("down"); // নিচে দেখাবে
      }
    }
  }, [isOpen]);

  return (
    <>
      <div ref={containerRef} className={`relative inline-block z-50 ${className || ""}`}>
        {/* Trigger button */}
        <Button
          variant="outline"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="h-8 w-8 p-0 flex justify-center items-center rounded-full cursor-pointer"
          onClick={handleToggle}
        >
          <HiDotsHorizontal className="text-lg" />
        </Button>

        {/* Dropdown menu */}
        {isOpen && (
          <Card
            className={`absolute ${position === "down" ? "top-full mt-2" : "bottom-full mb-2"} 
                        right-0 w-56 max-w-xs 
                        rounded-lg border shadow-lg p-3 
                        flex flex-col gap-2`}
          >
            {children({ setIsOpen })}
          </Card>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export { Dot };