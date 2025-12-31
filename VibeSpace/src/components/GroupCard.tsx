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

interface PropType {
  type: string;
  chatWith?: string;
  joinId: string | null;
  setJoinId?: (value: string) => void;
  conversationName: string;
  conversationPicture: string;
}

interface ReceiveMessage {
  type: 'oneToOne' | 'group';
  messageId?: string;
  senderId: string;
  receiverId: string | null;
  name: string;
  picture: string;
  joinId: string | null;
  text: string;
  referenceMessage: string | null;
  messageTime: string;
  conversationName: string;
  conversationPicture: string;
}

export default function GroupCard({
  type,
  chatWith,
  joinId,
  setJoinId,
  conversationName,
  conversationPicture
}: PropType) {

  /* -------------------- STATE -------------------- */
  const [userId, setUserId] = useState('');
  const [replyMessage, setReplyMessage] = useState<string | null>(null);
  const [refMessageId, setRefMessageId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isGroup, setIsGroup] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* -------------------- USER ID -------------------- */
  useEffect(() => {
    (async () => {
      const id = await userIdClient();
      if (id) setUserId(id);
    })();
  }, []);

  /* -------------------- SOCKET -------------------- */
  const socket = useSocketConnection(userId);

  /* -------------------- PROFILE -------------------- */
  const { userName, profilePicture } = useProfileInformation();

  /* -------------------- GROUP MESSAGE -------------------- */
  const { groupMessage, setGroupMessage } = useGetGroupMessage(joinId!);

  /* -------------------- TYPING -------------------- */
  const { handleTyping, someOneGroupTyping } = useGroupChatTyping(socket, joinId!);

  /* -------------------- JOIN GROUP -------------------- */
  useEffect(() => {
    if (!socket || !joinId || !userId) return;

    socket.emit("join-group", { userId, joinId });

    const onError = (msg: string) => alert(msg);
    socket.on("error", onError);

    return () => {
      socket.off("error", onError);
    };
  }, [socket, joinId, userId]);

  /* -------------------- RECEIVE MESSAGE -------------------- */
  useEffect(() => {
    if (!socket) return;

    const handler = (data: ReceiveMessage) => {
      if (data.joinId) setJoinId?.(data.joinId);
      setGroupMessage(prev => [...prev, data]);
    };

    socket.on("receiveGroupMessage", handler);

    return () => {
      socket.off("receiveGroupMessage", handler);
    };
  }, [socket, setGroupMessage, setJoinId]);

  /* -------------------- AUTO SCROLL -------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessage]);

  /* -------------------- HELPERS -------------------- */
  const isLink = (text: string) => /(https?:\/\/[^\s]+)/g.test(text);

  const handleSend = () => {
    if (!newMessage.trim() || !socket || !joinId) return;

    const messageData: ReceiveMessage = {
      type: "group",
      messageId: uuidv4(),
      senderId: userId,
      receiverId: chatWith || null,
      name: userName,
      picture: profilePicture,
      joinId,
      text: newMessage,
      referenceMessage: refMessageId,
      messageTime: new Date().toISOString(),
      conversationName,
      conversationPicture,
    };

    socket.emit('sendGroupMessage', messageData);
    setGroupMessage(prev => [...prev, messageData]);

    setNewMessage('');
    setReplyMessage(null);
    setRefMessageId(null);
  };

  /* -------------------- UI -------------------- */
  return (
    <>
      {isGroup ? (
        <div className="flex flex-col h-full w-full">

          {/* Header */}
          <header className="bg-neutral-600 h-16 p-2 flex items-center gap-3">
            <AvatarDemo src={conversationPicture} size="size-12" />
            <div>
              <h2 className="font-semibold">{conversationName}</h2>
              <p className="text-sm text-gray-500">Offline</p>
            </div>
            <button
              className="absolute right-2"
              onClick={() => setIsGroup(false)}
            >
              <AiFillSetting className="size-7" />
            </button>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1 bg-zinc-700">
            <main className="p-3">
              {groupMessage.map(msg => {
                const isSender = msg.senderId === userId;
                return (
                  <div
                    key={msg.messageId}
                    className={`mb-3 flex ${isSender ? 'flex-row-reverse' : ''}`}
                  >
                    <AvatarDemo src={msg.picture} size="size-10" />
                    <div className={`mx-2 p-2 rounded ${isSender ? 'bg-indigo-500 text-white' : 'bg-white'}`}>
                      {msg.referenceMessage && <ReplyMessage replyText={msg.referenceMessage} />}
                      {isLink(msg.text) && <LinkPreview url={msg.text} />}
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {someOneGroupTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </main>
          </ScrollArea>

          {/* Footer */}
          <footer className="p-3 bg-zinc-600 flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="flex-1 p-2 text-black rounded"
            />
            <button onClick={handleSend} className="bg-indigo-500 px-4 rounded text-white">
              Send
            </button>
          </footer>

        </div>
      ) : (
        <Setting
          groupName={conversationName}
          groupPicture={conversationPicture}
          setIsGroup={setIsGroup}
          joinId={joinId!}
          userId={userId}
        />
      )}
    </>
  );
}
