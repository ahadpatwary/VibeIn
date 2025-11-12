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

type LazyComponent<P = unknown> = LazyExoticComponent<React.ComponentType<P>>;

const componentMap: Record<string, LazyComponent> = {
  CreateGroup: lazy(() => import('@/components/CreateGroup')),
  AllGroup: lazy(() => import('@/components/AllGroup')),
  MyGroup: lazy(() => import('@/components/MyGroup')),
  AllRequest: lazy(() => import('@/components/AllRequest')),
};



export default function Home(){
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (compName: string) => setSelected(compName);

    return (
                  <div className="w-full h-dvh flex flex-col bg-zinc-800">
                    <header className="p-4 flex justify-between items-center bg-neutral-700 text-white">
                      <h1 className="text-2xl font-semibold">Chat Space</h1>
                      <button className="text-2xl font-semibold" >
                        O
                      </button>
                    </header>
        
                    <ScrollArea className="flex-1 p-3 overflow-y-auto">
                        {options.map((opt) => (
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
                      <button className="text-2xl font-semibold" >
                        O
                      </button>
                    </header>
                  </div>
    )
}