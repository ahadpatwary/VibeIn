'use client';

import React, {lazy, LazyExoticComponent } from 'react';
import { useRouter } from 'next/navigation';

import { ScrollArea } from '@/components/ui/scroll-area';

import options from '@/data/options.json';

type LazyComponent<P = unknown> = LazyExoticComponent<React.ComponentType<P>>;

const componentMap: Record<string, LazyComponent> = {
  CreateGroup: lazy(() => import('@/components/CreateGroup')),
  AllGroup: lazy(() => import('@/components/AllGroup')),
  MyGroup: lazy(() => import('@/components/MyGroup')),
  AllRequest: lazy(() => import('@/components/AllRequest')),
};

interface componentProps {
  setSelected: (routerName: string) => void;
}
const SettingSidebar = ({ setSelected }: componentProps ) => {

  const router = useRouter();
  const handleSelect = (routerName: string) => {
    router.push(`/chat-space/groupInfo/${routerName}`);
  }

  const handleRoute = () => {
    router.push('/chat-space');
  }

    return (
      <div className="w-full h-dvh flex flex-col bg-zinc-800">
        <header className="p-4 flex justify-between items-center bg-neutral-700 text-white">
          <h1 className="text-2xl font-semibold">Chat Space</h1>
          <button className="text-2xl font-semibold" onClick={ handleRoute }>
            O
          </button>
        </header>

        <ScrollArea className="flex-1 p-3 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.key}
                className="w-full mb-2 bg-zinc-700 rounded p-3 hover:bg-zinc-700 transition"
                onClick={() => setSelected(opt.component)}
              >
                {opt.option}
              </button>
            ))}
        </ScrollArea>

        <header className="py-2 px-7 flex justify-between items-center bg-neutral-700 text-white">
          <button className="text-2xl font-semibold" onClick={ handleRoute } >
            O
          </button>
        </header>
      </div>
    )
}

export default SettingSidebar;