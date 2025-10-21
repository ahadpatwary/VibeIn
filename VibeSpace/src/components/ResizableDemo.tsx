'use client';

import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ShowCard } from '@/components/ShowCard';
import { MenubarDemo } from '@/components/Bar';
import { UserProfile } from '@/components/UserProfile';
import { CustomWrapper } from '@/components/CustomWrapper';
import { useIsMobile } from "@/hooks/use-mobile";

interface DotProps {
  post: ICard[];
  userId?: string;
  Dot: boolean;
}

export function ResizableDemo({ post, userId = "", Dot }: DotProps) {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-full flex flex-col ">

      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"} // laptop: horizontal, mobile: vertical
        className="h-[calc(100vh-4rem)]! mt-14!"
      >
      <MenubarDemo />

        <ResizablePanel defaultSize={30} minSize={isMobile ? 2 : 1} className="" >
          <UserProfile dot={Dot}  userId = {userId} />
        </ResizablePanel>

        <ResizableHandle withHandle className={isMobile ? "h-3 " : "w-3 "} />

        <ResizablePanel defaultSize={70} 
          minSize={isMobile ? 2 : 1}  
          className="overflow-auto ">
          <CustomWrapper>
            {post.map((card) => (
              <ShowCard
                key={card._id}
                cardId={card._id}
                userId={card.user}
                title={card.title}
                image={card.image?.url}
                description={card.description}
                dot={Dot}
              />
            ))}
          </CustomWrapper>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}