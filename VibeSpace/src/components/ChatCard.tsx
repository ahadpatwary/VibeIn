'use client';
import { useEffect, useState, useRef } from 'react';
import { AvatarDemo } from "@/components/AvaterDemo"
// import { useChatTyping } from '@/hooks/useChatTyping';
import React from 'react';
import TypingIndicator from '@/components/TypingIndicator';
import { useSocketConnection } from '@/hooks/useSocketConnection';
// import { useChatInformation } from '@/hooks/useChatInformation';
// import { useActiveState } from '@/hooks/useActiveState';
// import { useGetMessage } from '@/hooks/useGetMessage';
import { ScrollArea } from './ui/scroll-area';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { v4 as uuidv4 } from 'uuid';
import { useProfileInformation } from '@/hooks/useProfileInformation';
import { BsArrow90DegRight } from "react-icons/bs";
import { BsArrow90DegLeft } from "react-icons/bs";
import { useGroupChatTyping } from '@/hooks/useGroupChatTyping';
import { useActiveState } from '@/hooks/useActiveState';
import { ReplyMessage } from './ReplyMessage';
import { LinkPreview } from './LinkPreview';
import { userIdClient } from '@/lib/userId';


interface receiveMessagePropType {
  _id?: string,
  messageId?: string,
  senderId: string,
  name: string,
  picture: string,
  text: string,
  referenceMessage: string,
  messageTime: string,
}


interface IMessage {
  _id?: string,
  messageId?: string,
  senderId: string,
  name: string,
  picture: string,
  text: string,
  referenceMessage: string,
  messageTime: string,
}

interface ChatCardProps {
  chatWith?: string;
  joinId: string;
  conversationName?: string;
  conversationPicture?: string;
}

interface Message {
  _id?: string,
  messageId?: string,
  senderId: string,
  name: string,
  picture: string,
  text: string,
  referenceMessage: string,
  messageTime: string,
}



export default function ChatCard({chatWith, joinId, conversationName, conversationPicture }: ChatCardProps) {

    const [userId, setUserId] = useState('');
    ;(async() => {
      const id = await userIdClient()!;
      if(!id) return ;
      setUserId(id);
  
    })();
 
  const [replyMessage, setReplyMessage] = useState<string | null>(null);
  const [refMessageId, setRefMessageId] = useState<string | null> (null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socket = useSocketConnection(userId);
  const { userName, profilePicture } = useProfileInformation();

    const { handleTyping, someOneGroupTyping } = useGroupChatTyping(socket!, joinId);

  // useGetMessage(socket!, userId, chatWith, setMessages);

  // const { handleTyping, someoneTyping } = useChatTyping(socket!, chatWith);

  const isLink = (text: string) => /(https?:\/\/[^\s]+)/g.test(text);
    console.log("ahad");

    useEffect(() => {
      console.log("HKDSFJSDKFJSDKLFJSDLKFJSDKLFSD;JFSDKLFJLDSK")
      if(!socket) return;

      console.log("userId", userId);

  
      socket.emit("join-group", { userId ,joinId });
  
      socket.on("error", (msg) => {
        alert(msg);
      });
  
      socket.on("receiveGroupMessage", (data: receiveMessagePropType) => {
        console.log("Received group message:", data);
        setMessages((prev) => [...prev, data]);
      });
    
      return () => {
        socket.off("receiveGroupMessage");
        // socket.off("error_message");
      };
    }, []);
  

  const handleMessageRefrence = (refMessageId: string | undefined, message: string) => {
    setReplyMessage(message!);
    setRefMessageId(refMessageId!);
    console.log(message);
  }

  const cancleRefMessage = () =>{
    setReplyMessage(null);
    setRefMessageId(null);
  } 

  const handleSend = () => {
    if (!newMessage) return;
        const messageData = { 
          type: 'oneToOne',
          messageId: uuidv4(),
          senderId: userId,
          receiverId: chatWith,
          name: userName,
          picture: profilePicture,
          joinId,
          text: newMessage,
          referenceMessage: refMessageId,
          messageTime: new Date().toISOString(),
          conversationName,
          conversationPicture,
        };
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
  
    <div className="flex flex-col h-full w-full ">

      {/* Header */}
      <header className="bg-neutral-600 h-16 p-2 flex items-center gap-3 flex-none sticky top-0 z-10">
        {/* <AvatarDemo src={messages[0]?.conversationPicture} size="size-12 sm:size-14" /> */}
        {/* <div className="flex flex-col"> */}
          {/* <h2 className="text-base text-black sm:text-lg font-semibold">{messages[0]?.conversationName}</h2> */}
          {/* <p className="text-sm text-gray-500">{offline ? "Offline" : "Online"}</p> */}
        {/* </div> */}
      </header>

      {/* Messages */}
      <ScrollArea className = "flex-1 w-full gap-4 overflow-y-auto bg-zinc-700">
      <main className=" px-2 sm:px-4 py-3">
        {messages?.length > 0 && messages.map((m) => {
          const isSender = m.senderId === userId;
          return (
            <div
              key={m._id || m.messageId}
              className={`mb-3 flex items-start gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <AvatarDemo src={m.picture} size="size-10" />
                {/* user message send korar time e tar picture pathabe// pore thik korbo */}
              </div>

              <div
                className={`max-w-[75%] sm:max-w-[65%] rounded-xl px-3 py-2 text-sm sm:text-base break-words ${
                  isSender
                    ? "bg-indigo-500 text-white self-end"
                    : "bg-white text-gray-800"
                }`}
>                   
                {isLink(m.text) && <LinkPreview url={m.text} />}
                {m.referenceMessage && 
                  <ReplyMessage replyText={m.referenceMessage} />
                }
                {m.text}
                <div className="text-[10px] sm:text-xs mt-1 text-gray-700 text-right">
                  {new Date(m.messageTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <button 
                onClick={() => handleMessageRefrence(m._id || m.messageId, m.text)}
              >
              { !isSender ? <BsArrow90DegRight /> : <BsArrow90DegLeft />}
              </button>
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

              <footer className="bg-zinc-600 p-2 sm:p-3 flex-none sticky bottom-0">
            {replyMessage && (
              <div className="overflow-hidden rounded pb-3 mb-3 bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between">
              <div className="flex-1 text-sm">
              <div className="text-xs text-gray-400">Replying to</div>
              <div className="max-w-[70%] truncate font-medium text-sm text-gray-100">{replyMessage}</div>
              {/* <div className="text-xs text-gray-400">— {replyMessage.senderName || replyMessage.senderId}</div> */}
              </div>
              <button 
                className="ml-3 text-gray-300 hover:text-white" 
                onClick={cancleRefMessage} 
                aria-label="Cancel reply">✕</button>
              </div>
            )}
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


            // if(type === 'oneToOne' && chatWithId && userId) {
            //     await conversation.create({
            //         type,
            //         participants: [ new Types.ObjectId(userId), new Types.ObjectId(chatWithId) ],
            //         deletedBy: [],
            //         blockedUser: [],
            //         requestUser: [],
            //         lastMessage: null,
            //         lastMessageTime: new Date(messageTime),
            //         extraFields: {
            //             groupName: conversationName,
            //             groupPicture: conversationPicture ? {
            //                 public_id: '',
            //                 url: conversationPicture
            //             } : undefined,
            //             groupBio: '',
            //             groupAdmin: undefined,
            //         }
            //     })
            //     io.to(chatWithId!).emit('receiveGroupMessage', message);
            //     return;
            // }