'use client';

import ChatSidebar from "@/components/chatApp/ChatSidebar";
import { useIsMobile } from "@/hooks/useIsMobile";
import React, { useState } from 'react';
import Image from 'next/image';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ChatCard from '@/components/ChatCard';
import useGetConversation from "@/hooks/useGetConversation";
import GroupCard from "@/components/GroupCard";




interface Conversation {
  _id: string;
  type: 'oneToOne' | 'group';

  participants: string[];
  deletedBy: string[];
  blockedUser: string[];
  requestUser: string[];

  lastMessage?: string;

  info?: {
    name?: string;
    picture?: {
      public_id: string;
      url: string;
    };
    bio?: string;
    admin?: string;
  };
}




const ChatSpacePage = () => {
  const isMobile = useIsMobile();
  const conversations = useGetConversation();


  const [state, setState] = useState<"empty" | "group" | "oneToOne">("empty");
  const [joinId, setJoinId] = useState('');
  const [conversationName , setConversationName] = useState('');
  const [conversationPicture, setConversationPicture] = useState('');


  return (
    <>
      {
        isMobile ? 
          <ChatSidebar/> : (
          <div className="h-dvh w-full flex">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={30} minSize={30}>
                  
                <ChatSidebar 
                  setConversationName={setConversationName} 
                  setConversationPicture={setConversationPicture}
                  setJoinId={setJoinId} 
                  conversations = {conversations}
                  setState ={setState}
                />
              </ResizablePanel>

              <ResizableHandle />
                <ResizablePanel defaultSize={70} minSize={50}>
                  {(() => {
                    if (state === "oneToOne" && joinId) {
                      return(
                        <ChatCard 
                          joinId={joinId} 
                          conversationName={conversationName}
                          conversationPicture={conversationPicture}
                        />
                      )
                    } 
                    else if (state === "group" && joinId) {
                      return( 
                        <GroupCard 
                            joinId={joinId}
                            conversationName={conversationName}
                            conversationPicture={conversationPicture}
                        />
                      )
                    } 
                    else {
                      return (
                        <div className="relative h-screen w-full">
                          <Image
                            src="/Chat_llustration.png"
                            alt="Chat Space Background"
                            fill
                            quality={90}
                            className="object-cover"
                            priority
                          />
                        </div>
                      );
                    }
                  })()}
                </ResizablePanel>

            </ResizablePanelGroup>
          </div>
        )
      }
    </>
  )
}

export default ChatSpacePage;