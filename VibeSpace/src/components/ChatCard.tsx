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
    socketRef.current.on("getUsers", (users) => {
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
        <div className="flex flex-col h-screen w-full border-2 relative">
          <header className="bg-white p-1 text-gray-700 flex gap-4 items-center border-b border-gray-300">
            <AvatarDemo src={picture} size="size-14" />
            <div className='flex flex-col'>
              <h2 className="text-lg font-semibold mt-2">{name}</h2>
              <p className="text-sm text-gray-500">{ offline ? "Offline" : "Online" }</p>
            </div>
           
          </header>

          <ScrollArea className="h-screen p-2 overflow-y-auto pb-22">



            {messages.map((m, i) => {
              const isSender = m.sender === userId;
              return (

              <div key={i} className={`mb-4 cursor-pointer flex gap-3 ${isSender ? 'flex-row-reverse justify-start' : 'justify-start'}`}>

                <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                  {!isSender ? 
                    <AvatarDemo src={picture} size="size-10" /> 
                    :
                    <AvatarDemo src={myPicture} size="size-10" />
                  }
                </div> 
                
      
                
                <div
                  className={`overflow-break text-wrap ${
                    isSender ? 'flex max-w-60 bg-indigo-500 text-black rounded-lg p-3 gap-3' : 'flex max-w-60 text-black bg-white rounded-lg p-3 gap-3'
                  }`}
                >
                  {m.text}
                  <div className="text-xs mt-1 text-black">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>

              </div>

              );
            })}

          { 
            someoneTyping ? 
            (
              // <div style={{ fontStyle: "italic", color: "gray", marginTop: "5px" }} className='z-200'>
              //   User is typing...
              // </div>
              <TypingIndicator />
            ) : <div className='h-7 bg-transparent' />
          }

            <div ref={messagesEndRef}></div>
               
          </ScrollArea>

            <footer className="bg-gray-900 border-t border-gray-300 p-4 absolute bottom-0 w-screen">
                <div className="flex items-center">
                    <textarea
                      
                      placeholder="Type a message..." 
                      className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500 text-black resize-none h-13"
                      value={newMessage}
                      onChange={handleChange}
                    />
                    <button
                      className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2" 
                      onClick={handleSend}
                    >Send</button>
                </div>
            </footer>
        </div>
  );
}