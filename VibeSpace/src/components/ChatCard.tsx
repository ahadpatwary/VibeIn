'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area'
import { getData } from '@/lib/getData';
import { AvatarDemo } from "@/components/AvaterDemo"
import { useChatTyping } from '@/hooks/useChatTyping';
import React from 'react';
import TypingIndicator from '@/components/TypingIndicator';


interface IMessage {
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
}

interface getDataType {
  name:string;
  picture:{
    url:string;
    public_id:string;
  }
}

export default function ChatCard({ userId, chatWith }: { userId: string, chatWith: string }) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const [myPicture, setMyPicture] = useState("");
  const { handleTyping, someoneTyping } = useChatTyping(socketRef.current, chatWith);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    socketRef.current = io("https://vibein-production-d87a.up.railway.app", {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
    }); 
    socketRef.current.emit('addUser', userId);

    socketRef.current.on('getMessage', (msg: IMessage) => {
      if ((msg.sender === chatWith && msg.receiver === userId) || (msg.sender === userId && msg.receiver === chatWith)) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, chatWith]);

    useEffect(() => {
    // getUsers event শুনবে backend থেকে
    socketRef.current && socketRef.current?.on("getUsers", (users) => {
      setOnlineUsers(users);
    });


    // cleanup
    return () => {
      socketRef.current?.off("getUsers");
    };
  }, [userId, chatWith]);

  useEffect(() => {
    setOffline(!onlineUsers.includes(chatWith));
  }, [onlineUsers, chatWith]);

  useEffect(() => {
    (async()=>{
      const data: getDataType = await getData(chatWith, "User", ["name", "picture"]);
      setName(data?.name);
      setPicture(data?.picture?.url);

      const myData: getDataType =  await getData(userId, "User", ["picture"]);
      setMyPicture(myData?.picture?.url);

    })();
    const fetchMessages = async () => {
      const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getMessages', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, chatWith })
      });
      const data = await res.json();
      setMessages(data.messages || []); // data.messages array না থাকলে empty array
    };
    fetchMessages();
  }, [userId, chatWith]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage) return;
    const messageData = { sender: userId, receiver: chatWith, text: newMessage };
    socketRef.current?.emit('sendMessage', messageData);
    setMessages(prev => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
    setNewMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    setNewMessage(e.target.value)
    handleTyping(); // প্রতিবার টাইপ করলে debounce trigger হবে

  };

  return (   
<div className="flex flex-col h-screen w-full border border-gray-300 bg-gray-50">

  {/* Header */}
  <header className="bg-white p-3 text-gray-700 flex items-center gap-3 border-b border-gray-300 flex-shrink-0">
    <AvatarDemo src={picture} size="size-12 sm:size-14" />
    <div className="flex flex-col">
      <h2 className="text-base sm:text-lg font-semibold">{name}</h2>
      <p className="text-sm text-gray-500">{offline ? "Offline" : "Online"}</p>
    </div>
  </header>

  {/* Scrollable Messages */}
  <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 scroll-smooth">
    {messages.map((m, i) => {
      const isSender = m.sender === userId;
      return (
        <div
          key={i}
          className={`mb-3 flex items-start gap-2 ${
            isSender ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center">
            {!isSender ? (
              <AvatarDemo src={picture} size="size-10" />
            ) : (
              <AvatarDemo src={myPicture} size="size-10" />
            )}
          </div>

          <div
            className={`max-w-[75%] sm:max-w-[65%] rounded-xl px-3 py-2 text-sm sm:text-base break-words ${
              isSender
                ? "bg-indigo-500 text-white self-end"
                : "bg-white text-gray-800"
            }`}
          >
            {m.text}
            <div className="text-[10px] sm:text-xs mt-1 text-gray-600 text-right">
              {new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      );
    })}

    {someoneTyping ? <TypingIndicator /> : <div className="h-6" />}

    <div ref={messagesEndRef}></div>
  </div>

  {/* Footer */}
  <footer className="bg-gray-100 border-t border-gray-300 p-2 sm:p-3 flex-shrink-0">
    <div className="flex items-center gap-2">
      <textarea
        placeholder="Type a message..."
        className="w-full p-2 sm:p-3 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black resize-none h-12 sm:h-14"
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