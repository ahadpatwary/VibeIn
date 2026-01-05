'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AvatarDemo } from "@/components/AvaterDemo";
import TypingIndicator from '@/components/TypingIndicator';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { ScrollArea } from './ui/scroll-area';
import { useGetGroupMessage } from '@/hooks/useGetGroupMessage';
import { useGroupChatTyping } from '@/hooks/useGroupChatTyping';
import { LinkPreview } from './LinkPreview';
import { ReplyMessage } from './ReplyMessage';
import { BsArrow90DegRight, BsArrow90DegLeft } from "react-icons/bs";
import { Setting } from './Setting';
import { useProfileInformation } from '@/hooks/useProfileInformation';
import { v4 as uuidv4 } from 'uuid';
import { userIdClient } from '@/lib/userId';
import { AiFillSetting } from "react-icons/ai";
interface OneToOneConversation {
  conversationId: string;
  type: 'oneToOne';
  text: string;
  messageTime: string;
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
  info: {
    name: string;
    picture: string;
  };
}
export type Conversation = OneToOneConversation | GroupConversation;


interface ConversationsMap {
  [joinId: string]: Conversation;
}

interface PropType {
  type: string;
  chatWith?: string;
  joinId: string | null;
  setJoinId?: (value: string) => void;
  setConvObj: (value: ConversationsMap) => void;
  conversationName: string;
  conversationPicture: string;
}

interface ReceiveMessage {
  _id: string;
  type: 'oneToOne' | 'group';
  senderId: string;
  receiverId: string | null,
  name: string;
  picture: string;
  joinId: string | null;
  text: string;
  referenceMessage: string | null;
  messageTime: number;
}

export default function GroupCard({
  type,
  chatWith,
  joinId,
  setJoinId,
  setConvObj,
  conversationName,
  conversationPicture
}: PropType) {

  const [userId, setUserId] = useState('');
  const [replyMessage, setReplyMessage] = useState<string | null>(null);
  const [refMessageId, setRefMessageId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isGroup, setIsGroup] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const id = await userIdClient();
      if (id) setUserId(id);
    })();
  }, []);

  const socket = useSocketConnection(userId);

  const { userName, profilePicture } = useProfileInformation();
  const { groupMessage, setGroupMessage } = useGetGroupMessage(joinId!);

  const { handleTyping, someOneGroupTyping } = useGroupChatTyping(socket, joinId!);


  useEffect(() => {
    if (!socket) return;

    const handler = (data: ReceiveMessage) => {
      setGroupMessage(prev => [...prev, data]);
    };

    socket.on("receiveGroupMessage", handler);

    socket.on("joinId", (data: string) => {
      if (data) setJoinId?.(data);
    })

    return () => {
      socket.off("receiveGroupMessage", handler);
    };
  }, [socket, setGroupMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessage]);

  const isLink = (text: string) => /(https?:\/\/[^\s]+)/g.test(text);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    setNewMessage(e.target.value)
    handleTyping(); 

  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;

 
// setConvObj?.(prev => {

//   const existing = prev[joinId!];
//   if (!existing) return prev;

//   return {
//     ...prev,
//     [joinId!]: {
//       ...existing,
//       text: newMessage,
//       messageTime: Date.now(),
//     },
//   };
// });


    const id = uuidv4();
    const conversationType = type === 'oneToOne' ? 'oneToOne' : 'group';
    const messageTime = Date.now();

    const messageData: ReceiveMessage = {
      _id: id,
      type: conversationType,
      senderId: userId,
      receiverId: chatWith || null,
      name: userName,
      picture: profilePicture,
      joinId,
      text: newMessage,
      referenceMessage: refMessageId,
      messageTime,
    };

    socket.emit('sendGroupMessage', messageData);
    
    setGroupMessage(prev => [...prev, {
      _id: id,
      type: conversationType,
      senderId: userId,
      name: userName,
      picture: profilePicture,
      text: newMessage,
      referenceMessage: refMessageId,
      messageTime,
    }]);

    setNewMessage('');
    setReplyMessage(null);
    setRefMessageId(null);
  };

  const handleMessageRefrence = (refMessageId: string | undefined, message: string) => {
    setReplyMessage(message!);
    setRefMessageId(refMessageId!);
    console.log(message);
  }
  
  const cancleRefMessage = () =>{
    setReplyMessage(null);
    setRefMessageId(null);
  } 


 return (
    <> 
    {
      isGroup ? (
          <div className="flex flex-col h-full w-full ">

        {/* Header */}
        <header className="bg-neutral-600 h-16 p-2 flex items-center gap-3 flex-none sticky top-0 z-10">
          {/* <Button className='' onClick={() => !!setIsGroupList && setIsGroupList((prev) => !prev)}/> */}
          <AvatarDemo src={conversationPicture} size="size-12 sm:size-14" />
          <div className="flex flex-col">
            <h2 className="text-base text-black sm:text-lg font-semibold">{conversationName}</h2>
            <p className="text-sm text-gray-500">Offline </p>
          </div>

          <button className='absolute right-2 hover:bg-transparent ' onClick={() => joinId && setIsGroup((prev) => !prev)}>
            <AiFillSetting className='size-7'/>
          </button>
            
        </header>

        {/* Messages */}
        <ScrollArea className = "flex-1 w-full gap-4 overflow-y-auto bg-zinc-700">
        <main className=" px-2 sm:px-4 py-3">
          {groupMessage.length > 0 && groupMessage.map((message) => {
            const isSender = message.senderId == userId;
            return (
              <div
                key={message._id}
                className={`mb-3 flex items-start gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center">
                  <AvatarDemo src={message.picture } size="size-10 " />
                </div>

                <div
                  className={`max-w-[70%] sm:max-w-[65%] rounded-xl px-3 py-2 text-sm sm:text-base break-words ${
                    isSender
                      ? "bg-indigo-500 text-white self-end"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {isLink(message.text) && <LinkPreview url={message.text} />}
                  {message.referenceMessage && 
                    <ReplyMessage replyText={message.referenceMessage} />
                  }
                    {message.text}
                  <div className="text-[10px] sm:text-xs mt-1 text-gray-700 text-right">
                    {new Date(Number(message.messageTime)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <button 
                  onClick={() => handleMessageRefrence(message._id, message.text)}
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

        {/* Footer */}
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
      ): (
        <Setting 
          groupName={conversationName} 
          groupPicture={conversationPicture} 
          setIsGroup={setIsGroup}
          joinId={joinId!} 
          userId={userId}
        />
      )
    }
    </>
  );
}
