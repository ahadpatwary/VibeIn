'use client'
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AvatarDemo } from "../AvaterDemo";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";
import { MdGroup } from "react-icons/md";
import { MdGroups2 } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import Image from "next/image";
import { userIdClient } from "@/lib/userId";
import { useSocketConnection } from "@/hooks/useSocketConnection";



interface OneToOneConversation {
  conversationId: string;
  type: 'oneToOne';
  text: string;
  messageTime: string;
  typing: boolean;
  info: {
    user_one: {
      _id: string;
      name: string;
      picture: string;
    };
    user_two: {
      _id: string;
      name: string;
      picture: string;
    };
  };
}

interface GroupConversation {
  conversationId: string;
  type: 'group';
  text: string;
  messageTime: string;
  typing: boolean;
  info: {
    name: string;
    picture: string;
  };
}
export type Conversation = OneToOneConversation | GroupConversation;


interface ConversationsMap {
  [conversationId: string]: Conversation;
}


interface ChatSidebarProps {
  setConversationName?: (value: string) => void;
  setConversationPicture?: (value: string) => void;
  joinId?: string;
  setJoinId?: (value: string) => void;
  conversations?: string[];
  setConversations?: (value: string[]) => void;

  convObj?: ConversationsMap;

  // ✅ THIS IS THE FIX
  setConvObj?: React.Dispatch<
    React.SetStateAction<ConversationsMap>
  >;

  setState?: (value: "empty" | "group" | "oneToOne") => void;
}



const ChatSidebar = (
  {
    setConversationName,
    setConversationPicture,
    joinId,
    setJoinId,
    conversations, 
    setConversations,
    convObj,
    setConvObj,
    setState 
  }: ChatSidebarProps
) => {

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

  useEffect(() => {

    if(!socket) return;
      
    
    socket?.on('allConversation_update', (data) => {
      const {text, messageTime, joinId} = data;

      setConvObj?.((prev) => {
        const existing: Conversation = prev[joinId!];
        if (!existing) return prev;

        return {
          ...prev,
          [joinId!]: {
            ...existing,
            text,
            messageTime: messageTime,
          },
        };
      });
    })

    socket?.on('userTyping', (groupId) => {
      setConvObj?.(prev => {
        const existing = prev[groupId!];
        if (!existing) return prev;

        return {
          ...prev,
          [groupId!]: {
            ...existing,
            typing: true,
          },
        };
      });
    })

  
    socket?.on('userStopTyping', (groupId) => {
      setConvObj?.(prev => {
        const existing = prev[groupId!];
        if (!existing) return prev;

        return {
          ...prev,
          [groupId!]: {
            ...existing,
            typing: false,
          },
        };
      });
    })

    return () => {
      socket.off('allConversation_update');
      socket.off('userTyping');
      socket.off('userStopTyping');
    }
    

  }, [socket])





  const handleDesktopClick = (newJoinId: string, conv: string) => {
    if(convObj == undefined) return;
    const conversationName = convObj[conv].type === 'oneToOne' ? ( (convObj[conv].info?.user_one?._id == userId) ? convObj[conv]?.info?.user_two?.name : convObj[conv]?.info.user_one.name): (
                      convObj[conv].info.name
                    );
    if(!!setConversationName) setConversationName(conversationName);
    const conversationPicture = convObj[conv].type === 'oneToOne' ? ( (convObj[conv].info?.user_one?._id == userId) ? convObj[conv]?.info?.user_two?.picture : convObj[conv]?.info.user_one.picture): (
                      convObj[conv].info.picture
                    )
    if(!!setConversationPicture) setConversationPicture(conversationPicture);
    if(!!setState && convObj[conv].type === "oneToOne") setState("oneToOne");
    if(!!setState && convObj[conv].type === "group") setState("group");

    socket?.emit("join-group", { userId, joinId, newJoinId });
    socket?.emit('universalGroup', { userId });
  
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
          {conversations?.length! > 0 && convObj && conversations?.map((conv)=> (
              <div
                key={conv}
                className={`w-full ${conv === selected ? "bg-zinc-600" : "bg-zinc-700"} mb-2 rounded transition`}

                onClick={() => {
                  if(window.innerWidth <= 768){
                      // handleMobileClick(conv.participants[0], conv.participants[1])
                  }else{
                    handleDesktopClick(conv, conv)
                    setSelected(conv);
                  }
                }}
              >
                <div className="flex w-full p-2">
                  <AvatarDemo
                    src={convObj[conv]?.type === 'oneToOne' ? ( (convObj[conv]?.info?.user_one?._id == userId) ? convObj[conv]?.info?.user_two?.picture : convObj[conv]?.info?.user_one.picture): (
                      convObj[conv]?.info?.picture
                    )}
                    size="size-15" 
                  />
                  <div className="flex flex-col flex-1 min-w-0 px-2">
                    <div className="flex justify-between items-center w-full">
                      <h2 className="text-lg font-semibold text-gray-200 truncate">
                        {convObj[conv].type === 'oneToOne' ? ( (convObj[conv].info?.user_one?._id == userId) ? convObj[conv]?.info?.user_two?.name : convObj[conv]?.info.user_one.name): (
                      convObj[conv].info?.name
                    )}
                      </h2>
                      <p className="text-sm text-gray-400 ml-auto">
                        {new Date(Number(convObj[conv].messageTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <>
                      { convObj[conv].typing ? <p className="text-md pt-2 truncate text-green-200">typing ...</p> : <p className="text-gray-900 pt-1 text-md truncate">{convObj[conv].text} </p>
                      }
                    </>
         

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