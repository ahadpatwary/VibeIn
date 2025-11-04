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


interface IMessage {
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
}



export default function ChatCard({ userId, chatWith }: { userId: string, chatWith: string }) {

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socket = useSocketConnection(userId, chatWith);
  const { name, picture, myPicture } = useChatInformation( userId, chatWith, setMessages);

  const offline = useActiveState(socket!, chatWith);

  useGetMessage(socket!, userId, chatWith, setMessages);

  const { handleTyping, someoneTyping } = useChatTyping(socket!, chatWith);


  const handleSend = () => {
    if (!newMessage) return;
    const messageData = { sender: userId, receiver: chatWith, text: newMessage };
    socket?.emit('sendMessage', messageData);
    setMessages(prev => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
    setNewMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    setNewMessage(e.target.value)
    handleTyping(); 

  };



  // ✅ 2️⃣ Auto-scroll when messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [messages]);

  return (
    // h-[calc(var(--vh)*100)]
    <div className="flex flex-col h-dvh w-full bg-gray-100">

      {/* Header */}
      <header className="bg-white h-16 p-2 flex items-center gap-3 border-b border-gray-300 flex-none sticky top-0 z-10">
        <AvatarDemo src={picture} size="size-12 sm:size-14" />
        <div className="flex flex-col">
          <h2 className="text-base text-black sm:text-lg font-semibold">{name}</h2>
          <p className="text-sm text-gray-500">{offline ? "Offline" : "Online"}</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 scroll-smooth bg-gray-200">
        {messages.map((m, i) => {
          const isSender = m.sender === userId;
          return (
            <div
              key={i}
              className={`mb-3 flex items-start gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <AvatarDemo src={isSender ? myPicture : picture} size="size-10" />
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

        {someoneTyping ? (
          <div className="mb-2 flex justify-start">
            <TypingIndicator />
          </div>
        ) : <div className='h-7' />}

        <div ref={messagesEndRef}></div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 p-2 sm:p-3 flex-none sticky bottom-0">
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