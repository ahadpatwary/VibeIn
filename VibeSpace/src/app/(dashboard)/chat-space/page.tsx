'use client';

import ChatSidebar from "@/components/chatApp/ChatSidebar";
import { useIsMobile } from "@/hooks/useIsMobile";
import React, { useState } from 'react';
import Image from 'next/image';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ChatCard from '@/components/ChatCard';
import useGetConversation from "@/hooks/useGetConversation";
import GroupCard from "@/components/GroupCard";


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
  // const [isClick, setIsClick] = useState(false);
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');
  const isMobile = useIsMobile();
  const conversations = useGetConversation() || [];
  const [state, setState] = useState<"empty" | "group" | "oneToOne">("empty");
  const [groupId, setGroupId] = useState('');


  return (
    <>
      {
        isMobile ? 
          <ChatSidebar/> : (
          <div className="h-dvh w-full flex">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={30} minSize={30}>
                  
                <ChatSidebar 
                  // setIsClick={setIsClick} 
                  setUserId={setUserId} 
                  setChatWith={setChatWith}
                  setGroupId ={setGroupId}
                  conversations = {conversations}
                  setState ={setState}

                />
              </ResizablePanel>

              <ResizableHandle />
                <ResizablePanel defaultSize={70} minSize={50}>
                  {(() => {
                    if (state === "oneToOne" && userId && chatWith) {
                      return <ChatCard userId={userId} chatWith={chatWith} />;
                    } 
                    else if (state === "group" && groupId) {
                      return( 
                        <GroupCard 
                            userId={userId} 
                            groupId={groupId} 
                            groupName="ajmol Group" 
                            groupPicture=""
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