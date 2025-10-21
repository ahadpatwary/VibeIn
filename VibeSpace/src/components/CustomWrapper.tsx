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
        <ScrollArea className = "w-full">
        <div className="h-[calc(100vh-4rem)] flex flex-wrap gap-4 justify-center">

          {children}

        </div>
      </ScrollArea>
    </>
  );
}