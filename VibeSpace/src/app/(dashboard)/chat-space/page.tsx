'use client';

import ChatSidebar from "@/components/chatApp/ChatSidebar";
import { useIsMobile } from "@/hooks/useIsMobile";
import React, { useState } from 'react';
import Image from 'next/image';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ChatCard from '@/components/ChatCard';


interface ConversationUser {
  _id: string;
  name: string;
  picture: { public_id: string; url: string };
}

interface Conversation {
  _id: string;
  senderId: ConversationUser;
  receiverId: ConversationUser;
  lastMessage: string;
  lastMessageTime: string | Date;
}

const ChatSpacePage = () => {
  const [isClick, setIsClick] = useState(false);
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');
  const isMobile = useIsMobile();

  return (
    <>
      {
        isMobile ? 
          <ChatSidebar/> : (
          <div className="h-dvh w-full flex">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={30} minSize={30}>
                  
                <ChatSidebar 
                  setIsClick={setIsClick} 
                  setUserId={setUserId} 
                  setChatWith={setChatWith}
                />
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize={70} minSize={50}>
                {
                  !isClick ? (
                    userId && chatWith ? (
                      <ChatCard userId={userId} chatWith={chatWith} />
                    ) : (
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
                    )
                  
                  ): <h1>ahad</h1>
                }
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )
      }
    </>
  )
}

export default ChatSpacePage;