'use client'
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AvatarDemo } from "../AvaterDemo";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";
import { MdGroup } from "react-icons/md";
import { MdGroups2 } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import Image from "next/image";
import { userIdClient } from "@/lib/userId";
import { useSocketConnection } from "@/hooks/useSocketConnection";

interface dataType{
  conversationId: string,
  messageTime: string,
  text: string,
  type: string
  conversationName: string,
  conversationPicture: string,
}


interface ChatSidebarProps {
  setConversationName?: (value: string) => void;
  setConversationPicture?: (value: string) => void;
  joinId?: string;
  setJoinId?: (value: string) => void;
  // conversations?: Conversation[];
  conversations?: dataType[];
  setState?: (value: "empty" | "group" | "oneToOne") => void;
}

const ChatSidebar = ({setConversationName, setConversationPicture, joinId, setJoinId, conversations, setState }: ChatSidebarProps) => {

  const [ selected, setSelected ] = useState<string | null>(null);
  const router = useRouter();
  const [userId, setUserId] = useState('');

  ;(async() => {
    const id = await userIdClient();
    if(!id) return;
    setUserId(id);
  })()


  const socket = useSocketConnection(userId);

  

  const handleMobileClick = async (senderId: string, receiverId: string) => {
    const sendId = userId === senderId ? receiverId : senderId;
    router.push(`/chatloop?userId=${userId}&chatWith=${sendId}`);
  };
   

  const handleDesktopClick = (newJoinId: string, type: string, conversationName: string, conversationPicture: string) => {
    if(!!setConversationName) setConversationName(conversationName);
    if(!!setConversationPicture) setConversationPicture(conversationPicture);
    if(!!setState && type === "oneToOne") setState("oneToOne");
    if(!!setState && type === "group") setState("group");

    socket?.emit("join-group", { userId, joinId, newJoinId });
  
    if(!!setJoinId) setJoinId(newJoinId);
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

        <ScrollArea className = "w-full overflow-y-auto h-[100%] p-2">
          {conversations?.length! > 0 && conversations?.map((conv)=> (
              <div
                key={conv.conversationId}
                className={`w-full ${conv.conversationId === selected ? "bg-zinc-600" : "bg-zinc-700"} mb-2 rounded transition`}

                onClick={() => {
                  if(window.innerWidth <= 768){
                      // handleMobileClick(conv.participants[0], conv.participants[1])
                  }else{
                    handleDesktopClick(conv.conversationId, conv.type, conv?.conversationName,conv?.conversationPicture)
                    setSelected(conv.conversationId);
                  }
                }}
              >
                <div className="flex w-full p-2">
                  <AvatarDemo
                    src={conv?.conversationPicture}
                    size="size-15" 
                  />
                  <div className="flex flex-col flex-1 min-w-0 px-2">
                    <div className="flex justify-between items-center w-full">
                      <h2 className="text-lg font-semibold text-gray-200 truncate">
                        {conv?.conversationName}
                      </h2>
                      <p className="text-sm text-gray-400 ml-auto">
                        {new Date(conv.messageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-gray-900 text-sm truncate">{conv.text} </p>

                  </div>
                </div>
              </div> 
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