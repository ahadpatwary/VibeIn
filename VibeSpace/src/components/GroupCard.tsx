'use client';
import { useEffect, useState, useRef } from 'react';
import { AvatarDemo } from "@/components/AvaterDemo"
import { useChatTyping } from '@/hooks/useChatTyping';
import React from 'react';
import TypingIndicator from '@/components/TypingIndicator';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useChatInformation } from '@/hooks/useChatInformation';
import { useActiveState } from '@/hooks/useActiveState';
import { useGetMessage } from '@/hooks/useGetMessage';
import { ScrollArea } from './ui/scroll-area';
import { userIdClient } from '@/lib/userId';
import { Button } from './ui/button';
import { useGetGroupMessage } from '@/hooks/useGetGroupMessage';
import { useGroupChatTyping } from '@/hooks/useGroupChatTyping';
import { LinkPreview } from './LinkPreview';


interface Message {
  senderId: {
    _id: string,
    name: string,
    picture: {
      public_id: string,
      url: string,
    }
  };
  groupId: string;
  text: string;
  createdAt: string;
}

interface propType{
    userId: string,
    groupId: string,
    groupName: string,
    groupPicture: string,
    setIsGroupList: (prev: boolean) => boolean
}


export default function GroupCard({userId, groupId, groupName, groupPicture, setIsGroupList}: propType) {

  const [newMessage, setNewMessage] = useState('');
  // const [messages, setMessages] = useState<IMessage[]>([]);
  const { groupMessage, setGroupMessage } = useGetGroupMessage(groupId);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socket = useSocketConnection(userId);
  console.log("soc", socket);
//   const { name, picture, myPicture } = useChatInformation( userId, chatWith, setMessages);

//   const offline = useActiveState(socket!, chatWith);

//   useGetMessage(socket!, userId, chatWith, setMessages);

  const { handleTyping, someOneGroupTyping } = useGroupChatTyping(socket!, groupId);  
// const [messages, setMessages] = useState([]);

  useEffect(() => {
 
    if(!socket) return;
 
    socket.emit("join-group", { groupId, userId });
    console.log("socket.id");

    socket.on("error", (msg) => {
      alert(msg);
    });

    socket.on("receiveGroupMessage", (data) => {
      console.log(data);
      setGroupMessage((prev) => [...prev, data]);
    });
  
    return () => {
      socket.off("receiveGroupMessage");
      // socket.off("error_message");
    };
  }, [socket, groupId, userId]);


  const handleSend = () => {
    if (newMessage.trim() === "") return;
   
    const messageData = { 
      userId,
      groupId,
      text: newMessage 
    };
    socket?.emit('sendGroupMessage', messageData);
    // setGroupMessage(prev => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
    setNewMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    setNewMessage(e.target.value)
    handleTyping(); 

  };

  const isLink = (text) => /(https?:\/\/[^\s]+)/g.test(text);



  // ✅ 2️⃣ Auto-scroll when messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [groupMessage]);

  return (
  
    <div className="flex flex-col h-full w-full ">

      {/* Header */}
      <header className="bg-neutral-600 h-16 p-2 flex items-center gap-3 flex-none sticky top-0 z-10">
        <AvatarDemo src={groupPicture} size="size-12 sm:size-14" />
        <div className="flex flex-col">
          <h2 className="text-base text-black sm:text-lg font-semibold">{groupName}</h2>
          <p className="text-sm text-gray-500">Offline </p>
        </div>
        <Button className='' onClick={() => setIsGroupList((prev ) => !prev)}/>
      </header>

      {/* Messages */}
      <ScrollArea className = "flex-1 w-full gap-4 overflow-y-auto bg-zinc-700">
      <main className=" px-2 sm:px-4 py-3">
        {groupMessage.map((m: Message, i) => {
          // console.log(m);
          const isSender = m.senderId._id == userId;
          return (
            <div
              key={i}
              className={`mb-3 flex items-start gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <AvatarDemo src={m.senderId.picture.url} size="size-10" />
              </div>

              <div
                className={`max-w-[75%] sm:max-w-[65%] rounded-xl px-3 py-2 text-sm sm:text-base break-words ${
                  isSender
                    ? "bg-indigo-500 text-white self-end"
                    : "bg-white text-gray-800"
                }`}
              >
                {
                  isLink(m.text) ? <LinkPreview url={m.text}/> : m.text
                }
                <div className="text-[10px] sm:text-xs mt-1 text-gray-700 text-right">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {someOneGroupTyping ? (
          <div className="mb-2 flex justify-start">
            <TypingIndicator />
          </div>
        ) : <div className='h-7' />}

        <div ref={messagesEndRef}></div>
      </main>
      </ScrollArea>

      {/* Footer */}
      <footer className="bg-zinc-600 p-2 sm:p-3 flex-none sticky bottom-0">
        <div className="flex items-center gap-2">
          <textarea
            placeholder="Type a message..."
            className="w-full p-2 sm:p-3 rounded-md border border-gray-400 focus:outline-none  text-black resize-none h-12 sm:h-14"
            value={newMessage}
            onChange={handleChange}
          />
          <button
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-md transition-colors"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}