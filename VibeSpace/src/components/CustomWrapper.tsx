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
          <Card className='h-auto m-2 p-0'>
            <Button className="h-13 m-2 w-auto"> Create a post</Button>
            <div className="p-0 m-0 h-8"></div>
          </Card>
          {children}
        </div>
      </ScrollArea>
    </>
  );
}