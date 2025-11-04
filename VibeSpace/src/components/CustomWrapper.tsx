"use client";

import React from "react";
import { ScrollArea } from '@/components/ui/scroll-area'

interface CustomWrapperProps {
  children: React.ReactNode; // child accept করার জন্য
  className?: string; // optional className
}

export function CustomWrapper({ children }: CustomWrapperProps) {
  return (
    <>
      <ScrollArea className = "w-full px-2 gap-4 overflow-y-auto">
        <div className="flex flex-wrap">
            {children}
        </div>

      

      </ScrollArea>
    </>
  );
}