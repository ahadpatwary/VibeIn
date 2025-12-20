// 'use client';

// import React, {lazy, LazyExoticComponent } from 'react';
// import { useRouter } from 'next/navigation';

// import { ScrollArea } from '@/components/ui/scroll-area';

// import options from '@/data/options.json';
// import SettingSidebar from '@/components/chatApp/SettingSidebar';

// type LazyComponent<P = unknown> = LazyExoticComponent<React.ComponentType<P>>;

// const componentMap: Record<string, LazyComponent> = {
//   CreateGroup: lazy(() => import('@/components/CreateGroup')),
//   AllGroup: lazy(() => import('@/components/AllGroup')),
//   MyGroup: lazy(() => import('@/components/MyGroup')),
//   AllRequest: lazy(() => import('@/components/AllRequest')),
// };



// export default function groupInfo(){

//   const router = useRouter();
//   const handleSelect = (routerName: string) => {
//     router.push(`/chat-space/groupInfo/${routerName}`);
//   }

//     return (
//       // <div className="w-full h-dvh flex flex-col bg-zinc-800">
//       //   <header className="p-4 flex justify-between items-center bg-neutral-700 text-white">
//       //     <h1 className="text-2xl font-semibold">Chat Space</h1>
//       //     <button className="text-2xl font-semibold" >
//       //       O
//       //     </button>
//       //   </header>

//       //   <ScrollArea className="flex-1 p-3 overflow-y-auto">
//       //       {options.map((opt) => (
//       //         <button
//       //           key={opt.key}
//       //           className="w-full mb-2 bg-zinc-700 rounded p-3 hover:bg-zinc-700 transition"
//       //           onClick={() => handleSelect(opt.router)}
//       //         >
//       //           {opt.option}
//       //         </button>
//       //       ))}
//       //   </ScrollArea>

//       //   <header className="py-2 px-7 flex justify-between items-center bg-neutral-700 text-white">
//       //     <button className="text-2xl font-semibold" >
//       //       O
//       //     </button>
//       //   </header>
//       // </div>

//       <SettingSidebar />
//     )
// }

'use client';

import ChatSidebar from "@/components/chatApp/ChatSidebar";
import { useIsMobile } from "@/hooks/useIsMobile";

import React, { useState, useEffect, lazy, Suspense, LazyExoticComponent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatCard from '@/components/ChatCard';
import { userIdClient } from '@/lib/userId';
import { AvatarDemo } from '@/components/AvaterDemo';
import options from '@/data/options.json';
import SettingSidebar from "@/components/chatApp/SettingSidebar";

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



const GroupInfo = () => {
  const [isClick, setIsClick] = useState(false);
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<string | null>(null);

  
  const SelectedComponent = selected ? componentMap[selected] : null;

  return (
    <>
      {
        isMobile ? 
          <ChatSidebar/> : (
          <div className="h-dvh w-full flex">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={30} minSize={30}>
                  <SettingSidebar setSelected={setSelected}/>
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize={70} minSize={50}>
                {
                  SelectedComponent ? (
                    <Suspense fallback={<div className="p-4">Loading...</div>}>
                       <SelectedComponent />
                    </Suspense>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <Image
                          src="/chat-illustration.png"
                          alt="Chat Illustration"
                          width={300}
                          height={300}
                          className="mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Select an option to get started</h2>
                        <p className="text-gray-600">Choose an option from the sidebar to manage your group settings.</p>
                      </div>
                    </div>
                  )   
                }
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )
      }
    </>
  )
}

export default GroupInfo;