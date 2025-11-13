'use client';

import React, { useState, useEffect, lazy, Suspense, LazyExoticComponent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatCard from '@/components/ChatCard';
import { userIdClient } from '@/lib/userId';
import { AvatarDemo } from '@/components/AvaterDemo';
import options from '@/data/options.json';

// ---------------- Lazy Components ----------------
// Props type নির্ভর করে component এ
type LazyComponent<P = unknown> = LazyExoticComponent<React.ComponentType<P>>;

const componentMap: Record<string, LazyComponent> = {
  CreateGroup: lazy(() => import('@/components/CreateGroup')),
  AllGroup: lazy(() => import('@/components/AllGroup')),
  MyGroup: lazy(() => import('@/components/MyGroup')),
  AllRequest: lazy(() => import('@/components/AllRequest')),
};

// ---------------- Types ----------------
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

// ---------------- Component ----------------
export default function ChatSpacePage() {
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');
  const [totalConv, setTotalConv] = useState<Conversation[]>([]);
  const [myId, setMyId] = useState('');
  const [isClick, setIsClick] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const router = useRouter();
  const isMobile = useIsMobile();

  const SelectedComponent = selected ? componentMap[selected] : null;

  const handleRouteChange = () => {
    router.push('/chat-space/groupInfo');
  }

  // ---------------- Fetch Conversations ----------------
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

  // ---------------- Handlers ----------------
  const handleSelect = (compName: string) => setSelected(compName);

  const handleDesktopClick = async (senderId: string, receiverId: string) => {
    const user = await userIdClient();
    if (!user) return;

    const sendId = user === senderId ? receiverId : senderId;
    setUserId(user);
    setChatWith(sendId);
  };

  const handleMobileClick = async (senderId: string, receiverId: string) => {
    const user = await userIdClient();
    if (!user) return;

    const sendId = user === senderId ? receiverId : senderId;
    router.push(`/chatloop?userId=${user}&chatWith=${sendId}`);
  };

  const toggleOptions = () => setIsClick((prev) => !prev);

  // ---------------- Render ----------------
  if (isMobile) {
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
              onClick={() => handleMobileClick(conv.senderId._id, conv.receiverId._id)}
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
          <button className="text-2xl font-semibold" onClick={handleRouteChange}>
            O
          </button>
        </header>
      </div>
    );
  }

  // ---------------- Desktop View ----------------
  return (
    <div className="h-dvh w-full flex">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={30}>
          <div className="w-full h-dvh flex flex-col bg-zinc-800">
            <header className="p-4 flex justify-between items-center bg-neutral-700 text-white">
              <h1 className="text-2xl font-semibold">Chat Space</h1>
              <button className="text-2xl font-semibold" onClick={toggleOptions}>
                O
              </button>
            </header>

            <ScrollArea className="flex-1 p-3 overflow-y-auto">
              {!isClick
                ? totalConv.map((conv) => (
                    <button
                      key={conv._id}
                      className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                      onClick={() => handleDesktopClick(conv.senderId._id, conv.receiverId._id)}
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
                              {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <p className="text-gray-900 text-sm truncate">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))
                : options.map((opt) => (
                    <button
                      key={opt.key}
                      className="w-full mb-2 bg-zinc-700 rounded p-3 hover:bg-zinc-700 transition"
                      onClick={() => handleSelect(opt.component)}
                    >
                      {opt.option}
                    </button>
                  ))}
            </ScrollArea>

            <header className="py-2 px-7 flex justify-between items-center bg-neutral-700 text-white">
              <button className="text-2xl font-semibold" onClick={toggleOptions}>
                O
              </button>
            </header>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={70} minSize={50}>
          {!isClick ? (
            userId && chatWith ? (
              <ChatCard userId={userId} chatWith={chatWith} />
            ) : (
              <div className="relative h-screen w-full">
                <Image
                  src="/chatSpace.jpg"
                  alt="Chat Space Background"
                  fill
                  quality={90}
                  className="object-cover"
                  priority
                />
              </div>
            )
          ) : SelectedComponent ? (
            <Suspense fallback={<div>Loading...</div>}>
              <SelectedComponent />
            </Suspense>
          ) : (
            <p>Select an option...</p>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}