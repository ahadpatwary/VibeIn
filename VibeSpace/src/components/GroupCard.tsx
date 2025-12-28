'use client';
import { useEffect, useState, useRef } from 'react';
import { AvatarDemo } from "@/components/AvaterDemo"
import React from 'react';
import TypingIndicator from '@/components/TypingIndicator';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useGetGroupMessage } from '@/hooks/useGetGroupMessage';
import { useGroupChatTyping } from '@/hooks/useGroupChatTyping';
import { LinkPreview } from './LinkPreview';
import { ReplyMessage } from './ReplyMessage';
import { BsArrow90DegRight } from "react-icons/bs";
import { BsArrow90DegLeft } from "react-icons/bs";
import { Setting } from './Setting';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useProfileInformation } from '@/hooks/useProfileInformation';
import { v4 as uuidv4 } from 'uuid';

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

interface propType {
  joinId: string;
  conversationName: string;
  conversationPicture: string;
  setIsGroupList?: React.Dispatch<React.SetStateAction<boolean>>;
}

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


export default function GroupCard({ joinId, conversationName, conversationPicture, setIsGroupList}: propType) {

  const userId = useSelector((state: RootState) => state.user.id);
  const [replyMessage, setReplyMessage] = useState<string | null>(null);
  const [refMessageId, setRefMessageId] = useState<string | null> (null);
  const [newMessage, setNewMessage] = useState('');
  const { groupMessage, setGroupMessage } = useGetGroupMessage(joinId);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socket = useSocketConnection(userId);
  const [isGroup, setIsGroup] = useState(true);
  const { userName, profilePicture } = useProfileInformation();


  const { handleTyping, someOneGroupTyping } = useGroupChatTyping(socket!, joinId);  

  useEffect(() => {
 
    if(!socket) return;

    socket.emit("join-group", { joinId, userId });

    socket.on("error", (msg) => {
      alert(msg);
    });

    socket.on("receiveGroupMessage", (data: receiveMessagePropType) => {
      console.log("Received group message:", data);
      setGroupMessage((prev) => [...prev, data]);
    });
  
    return () => {
      socket.off("receiveGroupMessage");
      // socket.off("error_message");
    };
  }, [socket, joinId, userId]);

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
    if (newMessage.trim() === "") return;
   
    const messageData = { 
      messageId: uuidv4(),
      senderId: userId,
      name: userName,
      picture: profilePicture,
      joinId,
      text: newMessage,
      referenceMessage: refMessageId,
      messageTime: new Date().toISOString(),
      conversationName,
      conversationPicture
    };
    console.log(messageData);
    socket?.emit('sendGroupMessage', messageData);
    setGroupMessage(prev => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
    setNewMessage('');
    setReplyMessage(null);
    setRefMessageId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    setNewMessage(e.target.value)
    handleTyping(); 

  };

  const isLink = (text: string) => /(https?:\/\/[^\s]+)/g.test(text);


  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [groupMessage]);

  return (
    <> 
    {
      isGroup ? (
          <div className="flex flex-col h-full w-full ">

        {/* Header */}
        <header className="bg-neutral-600 h-16 p-2 flex items-center gap-3 flex-none sticky top-0 z-10">
          <AvatarDemo src={conversationPicture} size="size-12 sm:size-14" />
          <div className="flex flex-col">
            <h2 className="text-base text-black sm:text-lg font-semibold">{conversationName}</h2>
            <p className="text-sm text-gray-500">Offline </p>
          </div>
          <Button className='' onClick={() => !!setIsGroupList && setIsGroupList((prev) => !prev)}/>
          <Button className='' onClick={() => setIsGroup((prev) => !prev)}>A</Button>
            
        </header>

        {/* Messages */}
        <ScrollArea className = "flex-1 w-full gap-4 overflow-y-auto bg-zinc-700">
        <main className=" px-2 sm:px-4 py-3">
          {groupMessage.length > 0 && groupMessage.map((message) => {
            const isSender = message.senderId == userId;
            return (
              <div
                key={message._id || message.messageId}
                className={`mb-3 flex items-start gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center">
                  <AvatarDemo src={message.picture} size="size-10 " />
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
                    {new Date(message.messageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <button 
                  onClick={() => handleMessageRefrence(message._id || message.messageId, message.text)}
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
          joinId={joinId} 
          userId={userId}
        />
      )
    }
    </>
  );
}