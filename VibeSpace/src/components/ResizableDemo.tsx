'use client';

import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ShowCard } from '@/components/ShowCard';
import { MenubarDemo } from '@/components/Bar';
import { UserProfile } from '@/components/UserProfile';
import { CustomWrapper } from '@/components/CustomWrapper';
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import CarouselDemo from "./Embla";

interface DotProps {
  post: ICard[];
  userId?: string;
  Dot: boolean;
}

export function ResizableDemo({ post, userId = "", Dot }: DotProps) {

  return (
    <div className="flex justify-around"> 
      <div className="flex flex-col min-w-[310px] max-w-[700px] w-full"> 
      

            <UserProfile dot={Dot}  userId = {userId} />

            <ScrollArea className="w-full h-full overflow-y-auto scroll-smooth"> 
              <CustomWrapper>
                {post.map((card) => (
                  <ShowCard 
                    key = {card._id} 
                    cardId = {card._id} 
                    userId= {card?.user._id}
                    image = {card.image?.url} 
                    title = {card.title} 
                    description = {card.description} 
                    dot = { Dot } 
                    userName= {card?.user.name}
                    userProfile= {card?.user.picture}
                  />
                ))}
              </CustomWrapper>
            </ScrollArea>
        </div>
<Card className='h-[500px] max-w-[350px] m-2 flex-1 '>
        < CarouselDemo />
        </Card>
        </div>
    );
}