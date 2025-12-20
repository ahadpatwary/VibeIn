'use client'
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AvatarDemo } from "../AvaterDemo";
import { useEffect, useState } from "react";
import { userIdClient } from "@/lib/userId";
import { useRouter } from 'next/navigation';
import { set } from "lodash";
import { useIsMobile } from "@/hooks/use-mobile";


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

interface ChatSidebarProps {
    // setIsClick?: React.Dispatch<React.SetStateAction<boolean>>;
    // setUserId?: React.Dispatch<React.SetStateAction<string>>;
    // setChatWith?: React.Dispatch<React.SetStateAction<string>>;
    setIsClick?: (value: boolean) => void;
    setUserId?: (value: string) => void;
    setChatWith?: (value: string) => void;
}

const ChatSidebar = ({setIsClick, setUserId, setChatWith }: ChatSidebarProps) => {
    const [totalConv, setTotalConv] = useState<Conversation[]>([]);
    const [myId, setMyId] = useState('');
  const router = useRouter();
      useEffect(() => {
    (async () => {
      const userID = await userIdClient();
      if (!userID) return;

      setMyId(userID);

      const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getConversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID }),
      });

      if (!res.ok) {
        console.error('Something went wrong');
        return;
      }

      const data = await res.json();
      setTotalConv(data.conversations || []);
    })();
  }, []);

    const handleMobileClick = async (senderId: string, receiverId: string) => {
    const user = await userIdClient();
    if (!user) return;

    const sendId = user === senderId ? receiverId : senderId;
    router.push(`/chatloop?userId=${user}&chatWith=${sendId}`);
  };

    const handleDesktopClick = async (senderId: string, receiverId: string) => {
    const user = await userIdClient();
    if (!user) return;

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
          <h1 className="text-2xl font-semibold">Chat Space</h1>
        </header>

        <ScrollArea className="flex-1 p-3 overflow-y-auto">
          {totalConv.map((conv) => (
            <button
              key={conv._id}
              className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
              onClick={() => {
                if(window.innerWidth <= 768){
                    handleMobileClick(conv.senderId._id, conv.receiverId._id)
                }else{
                    handleDesktopClick(conv.senderId._id, conv.receiverId._id);
                    // setIsClick(true);
                }
              }}
            >
              <div className="flex w-full p-2">
                <AvatarDemo
                  src={myId === conv.senderId._id ? conv.receiverId.picture.url : conv.senderId.picture.url}
                  size="size-15"
                />
                <div className="flex flex-col flex-1 min-w-0 px-2">
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-semibold text-gray-200 truncate">
                      {myId === conv.senderId._id ? conv.receiverId.name : conv.senderId.name}
                    </h2>
                    <p className="text-sm text-gray-400 ml-auto">
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-gray-900 text-sm truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
        <header className="py-3 px-7 flex justify-between items-center bg-neutral-700 text-white">
          <button className="text-2xl font-semibold" onClick={handleClick}>
            O
          </button>
        </header>
      </div>
    )
}
export default ChatSidebar;