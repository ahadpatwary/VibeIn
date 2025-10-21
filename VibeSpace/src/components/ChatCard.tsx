'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area'
import { getData } from '@/lib/getData';
import { AvatarDemo } from "@/components/AvaterDemo"


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

  useEffect(() => {
    console.log(" Connecting to socket server...");
    socketRef.current = io("https://myapp-production-fc13.up.railway.app", {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
    }); 
    console.log(" Socket connected:", socketRef.current.id);
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
    (async()=>{
      const data: getDataType = await getData(chatWith, "User", ["name", "picture"]);
      setName(data?.name);
      setPicture(data?.picture?.url);
    })();
    const fetchMessages = async () => {
      const res = await fetch('/api/getMessages', {
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

  return (
    <div className="max-w-[70%] m-10  min-w-[450px] w-full border-2">
      <div className="bg-black-600 text-white p-4 shadow-md flex items-center">
        <AvatarDemo src={picture} /> 
        <div className="font-bold text-lg m-3">{name}</div>
      </div>

  
        <ScrollArea className="h-[500px]  min-w-[450px] ">
          
          {messages.map((m, i) => {
            const isSender = m.sender === userId;
            return (
      
            <div key={i} className={`m-5 ${isSender ? 'flex justify-end' : 'flex justify-start'}`}>
              <div
                className={`max-w-[65%] break-all overflow-wrap-anywhere p-3 rounded-lg ${
                  isSender ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
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
          <div ref={messagesEndRef}></div>
         
        </ScrollArea>

     

      {/* Input */}
      <div className="flex items-center p-4 bg-transition shadow-inner">
        <textarea
          className="flex-1 border rounded-md px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black-400 text-black min-h-[50px]"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}