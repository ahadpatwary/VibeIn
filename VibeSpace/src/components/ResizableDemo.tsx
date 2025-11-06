'use client';

import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ShowCard } from '@/components/ShowCard';
import { MenubarDemo } from '@/components/Bar';
import { UserProfile } from '@/components/UserProfile';
import { CustomWrapper } from '@/components/CustomWrapper';
import { ScrollArea } from "./ui/scroll-area";


interface DotProps {
  post: ICard[];
  userId?: string;
  Dot: boolean;
}

export function ResizableDemo({ post, userId = "", Dot }: DotProps) {

  return (

      <div className="h-dvh w-full flex flex-col"> 
        <MenubarDemo />

        <ResizablePanelGroup
          direction="horizontal"
          className="flex! flex-1!"
        >

       

          <ResizablePanel defaultSize={30} minSize={30}>
            <UserProfile dot={Dot}  userId = {userId} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={70} 
            minSize= {50}
          >
            <ScrollArea className="w-full h-full overflow-y-auto scroll-smooth"> 
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
            </ScrollArea>

          </ResizablePanel>
  
        </ResizablePanelGroup>
        </div>
    );
}