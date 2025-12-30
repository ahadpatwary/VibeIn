'use client';

import ChatSidebar from "@/components/chatApp/ChatSidebar";
import { useIsMobile } from "@/hooks/useIsMobile";
import React, { useState, lazy, Suspense, LazyExoticComponent } from 'react';
import Image from 'next/image';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import SettingSidebar from "@/components/chatApp/SettingSidebar";



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


const GroupInfo = () => {
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
                      <div className="m-2">
                        <SelectedComponent/>
                      </div>
                    </Suspense>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <Image
                          src="/Chat_llustration.png"
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