"use client";

import React from "react";
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "./ui/button";

interface CustomWrapperProps {
  children: React.ReactNode; // child accept করার জন্য
  className?: string; // optional className
}

export function CustomWrapper({ children }: CustomWrapperProps) {
  return (
    <>
      <ScrollArea className = "w-auto overflow-y-auto">
        <div className="flex flex-col m-2 ml-4 mr-4 justify-around items-around">

          {children}
        </div>
      </ScrollArea>
    </>
  );
}