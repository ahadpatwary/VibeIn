'use client'
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AvatarDemo } from "../AvaterDemo";
import { useEffect, useState } from "react";
import { userIdClient } from "@/lib/userId";
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";
import { MdGroup } from "react-icons/md";
import { MdGroups2 } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import Image from "next/image";


interface Conversation {
  _id: string;
  type: 'oneToOne' | 'group';

  participants: string[];
  deletedBy: string[];
  blockedUser: string[];
  requestUser: string[];

  lastMessage: string;
  lastMessageTime: Date;

  info: {
    name: string;
    picture: {
      public_id: string;
      url: string;
    };
    bio?: string;
    admin?: string;
  };
}

interface ChatSidebarProps {
  setUserId?: (value: string) => void;
  setChatWith?: (value: string) => void;
  setGroupId?: (value: string) => void;
  conversations?: Conversation[];
  setState?: (value: "empty" | "group" | "oneToOne") => void;
}

const ChatSidebar = ({ setUserId, setChatWith, setGroupId, conversations, setState }: ChatSidebarProps) => {
    const router = useRouter();
  

    const handleMobileClick = async (senderId: string, receiverId: string) => {
    const user = await userIdClient();
    if (!user) return;

    const sendId = user === senderId ? receiverId : senderId;
    router.push(`/chatloop?userId=${user}&chatWith=${sendId}`);
  };
   
  const handleGroup = (groupId: string) => {  
    console.log("ahadz", groupId);  
    if(!!setState) setState("group");
    if(!!setGroupId) setGroupId(groupId);
  }

    const handleDesktopClick = async (senderId: string, receiverId: string) => {
    const user = await userIdClient();
    if (!user) return;

    if(!!setState) setState("oneToOne");


    const sendId = user === senderId ? receiverId : senderId;
    if( setUserId && setChatWith){
      setUserId(user);
      setChatWith(sendId);
    }

  };
    const handleClick = () => {
        router.push('/chat-space/groupInfo');
    } 
    return (
        <div className="w-full h-dvh flex flex-col bg-zinc-800">
        <header className="p-4 flex justify-between items-center bg-neutral-700 text-white">
          <Image 
              src="/ChatSpace_dark.png" 
              alt="VibeIn Logo"
              width={10}
              height={10}
            />
          <h1 className="text-2xl font-semibold">Chat Space</h1>
          <button className="text-2xl font-semibold" onClick={handleClick}>
            <HiDotsVertical />
          </button>
        </header>

        <ScrollArea className="flex-1 p-3 overflow-y-auto">
          {conversations?.length! > 0 && conversations?.map((conv)=> (
            <>
              { conv.type == "oneToOne" ? (
              <div
                key={conv._id}
                className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                onClick={() => {
                  if(window.innerWidth <= 768){
                      handleMobileClick(conv.participants[0], conv.participants[1])
                  }else{
                    console.log(conv);
                      handleDesktopClick(conv.participants[0], conv.participants[1]);
                      // setIsClick(true);
                  }
                }}
              >
                <div className="flex w-full p-2">
                  <AvatarDemo
                    // src={myId === conv.senderId._id ? conv.receiverId.picture.url : conv.senderId.picture.url}
                    src={conv.info.picture.url}
                    size="size-15"
                  />
                  <div className="flex flex-col flex-1 min-w-0 px-2">
                    <div className="flex justify-between items-center w-full">
                      <h2 className="text-lg font-semibold text-gray-200 truncate">
                        {/* {myId === conv.senderId._id ? conv.receiverId.name : conv.senderId.name} */}
                        {conv.info.name}
                      </h2>
                      <p className="text-sm text-gray-400 ml-auto">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-gray-900 text-sm truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
              ) : (
            <button
              key={conv._id}
              className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
              onClick={() => {
                if(window.innerWidth <= 768){
                    // handleMobileClick(conv._doc.participants[0], conv._doc.participants[1])
                }else{
                    // handleDesktopClick(conv._doc.participants[0], conv._doc.participants[1]);
                    handleGroup(conv._id);
                }
              }}
            >
              <div className="flex w-full p-2">
                <AvatarDemo
                  src={conv.info.picture.url}
                  size="size-15"
                />
                <div className="flex flex-col flex-1 min-w-0 px-2">
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-semibold text-gray-200 truncate">
                      {conv.info.name}
                    </h2>
                    <p className="text-sm text-gray-400 ml-auto">
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-gray-900 text-sm truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </button>
              )}
            </>
          ))}
        </ScrollArea>
        <header className="py-3 px-7 flex justify-between items-center bg-neutral-700 text-white">
          <Button>
            <MdGroup />
          </Button>
          <Button>
            <MdGroups2 />
          </Button>
        </header>
      </div>
    )
}
export default ChatSidebar;