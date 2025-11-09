'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatCard from '@/components/ChatCard';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { userIdClient } from '@/lib/userId'
// import { getData } from "@/lib/getData";
import { AvatarDemo } from '@/components/AvaterDemo';
import Image from 'next/image';
import options from "@/data/options.json";
import React, { lazy, Suspense } from 'react'

    // Lazy load components dynamically
    const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<unknown>>> = {
        CreateGroup: lazy(() => import('@/components/CreateGroup')),
        AllGroup: lazy(() => import('@/components/AllGroup')),
        SendRequest: lazy(() => import('@/components/SendRequest')),
        AllRequest: lazy(() => import('@/components/AllRequest')),
    };

interface conversation {
    _id: string,
    senderId: {
        name: string, 
        picture: {
            public_id: string,
            url: string,
        }
        _id: string,
    }
    receiverId: {
        name:string,
        picture: {
            public_id: string,
            url: string,
        },
        _id: string,
    }
    lastMessage: string,
    lastMessageTime: Date,
}


export default function ChatSpacePage() {
    const [userId, setUserId] = useState("");
    const [chatWith, setChatWith] = useState("");
    const [totalConv, setTotalConv] = useState([]);
    const [myId, setMyId] = useState("");
    const [isClick, setIsClick] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();

      const handleSelect = (compName: string) => {
    setSelected(compName);
  };

    const SelectedComponent = selected ? componentMap[selected] : null;

    useEffect(() => {
        ;(async () => {
            const userID = await userIdClient();
            if(!userID) return ;
            setMyId(userID!);
            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getConversation', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID })
            });

            if(!res.status){
                console.error("something went wrong");
            }
            const { conversations } = await res.json();
            
            setTotalConv(conversations || []);
        })();
    }, [])

    

    const isMobile = useIsMobile();

    const handleDesktopClick = async (senderId: string, receiverId: string) => {
        const user = await userIdClient();

        const sendId = user == senderId ? receiverId : senderId;

        setUserId(user!);
        setChatWith(sendId);
    }

    const handleMobileClick = async (senderId: string, receiverId: string) => {

        const user = await userIdClient();

        const sendId = user == senderId ? receiverId : senderId;

        router.push(`/chatloop?userId=${user}&chatWith=${sendId}`);
    }

    const handleSubmit = () => {
        setIsClick(pre => !pre);
        
    }

    return (
        isMobile ? (

             <div className="w-full h-dvh flex flex-col bg-zinc-800 ">

                <header className="p-4 flex flex-none justify-between items-center bg-neutral-700 text-white">
                    <h1 className="text-2xl font-semibold">Chat Space</h1>
                    <div className="relative">
                        <button id="menuButton" className="focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-100" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path d="M2 10a2 2 0 012-2h12a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                            </svg>
                        </button>
                        
                        <div id="menuDropdown" className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg hidden">
                            <ul className="py-2 px-3">
                                <li><a href="#" className="block px-4 py-2 text-gray-800 hover:text-gray-400">Option 1</a></li>
                                <li><a href="#" className="block px-4 py-2 text-gray-800 hover:text-gray-400">Option 2</a></li>
                            </ul>
                        </div>
                    </div>
                </header>
                                
                <ScrollArea className="flex-1 p-3 overflow-y-auto">

                    {
                        totalConv.map((conv : conversation) => 
                          
                            <button
                                key={conv._id}
                                className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                                onClick={() => handleMobileClick(conv.senderId._id, conv.receiverId._id)}
                                >
                                    <div className="flex w-full p-2">
                                    <AvatarDemo 
                                        src={ 
                                            myId === conv.senderId._id ? (
                                                conv.receiverId.picture.url
                                            ) :(
                                                conv.senderId.picture.url
                                            )
                                        }
                                        size="size-15" />

                                    <div className="flex w-[10px] flex-col flex-1 min-w-0 px-2">
                                        <div className="flex justify-between items-center w-full">
                                        <h2 className="text-lg font-semibold text-gray-200 truncate">
                                            {
                                                myId === conv.senderId._id ? (
                                                    conv.receiverId.name
                                                ) :(
                                                    conv.senderId.name
                                                )
                                            }
                                            </h2>
                                        <p className="text-sm text-gray-400 ml-auto">
                                                {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        </div>
                                        <p className="text-gray-900 text-sm truncate">{conv.lastMessage}</p>
                                    </div>
                                    </div>
                                </button>

                        )
                    }

                </ScrollArea>
            </div>

        ) : (

            <div className= 'h-dvh w-full flex '>

                <ResizablePanelGroup
                    direction="horizontal"
                    className="flex! flex-1!"
                >

            

                <ResizablePanel defaultSize={30} minSize={30}>

                            <div className="w-full h-dvh flex flex-col bg-zinc-800 ">

                                <header className="p-4 flex flex-none justify-between items-center bg-neutral-700 text-white">
                                    <h1 className="text-2xl font-semibold">Chat Space</h1>
                                    <button
                                        className="text-2xl font-semibold"
                                        onClick={handleSubmit}
                                    >
                                        O
                                    </button>
                                </header>
                                
                            <ScrollArea className="flex-1 p-3 overflow-y-auto">
                                <div className="p-3 ">


                                    {
                                        !isClick ? (  totalConv.map((conv : conversation) => 
                                            <button
                                                key={conv._id}
                                                className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                                                onClick={() => handleDesktopClick(conv.senderId._id, conv.receiverId._id)}
                                                >
                                                    <div className="flex w-full p-2">
                                                    <AvatarDemo 
                                                        src={ 
                                                            myId === conv.senderId._id ? (
                                                                conv.receiverId.picture.url
                                                            ) :(
                                                                conv.senderId.picture.url
                                                            )
                                                        }
                                                     size="size-15" />

                                                    <div className="flex w-[10px] flex-col flex-1 min-w-0 px-2">
                                                        <div className="flex justify-between items-center w-full">
                                                        <h2 className="text-lg font-semibold text-gray-200 truncate">
                                                            {
                                                                myId === conv.senderId._id ? (
                                                                    conv.receiverId.name
                                                                ) : (
                                                                    conv.senderId.name
                                                                )
                                                            }
                                                            </h2>
                                                        <p className="text-sm text-gray-400 ml-auto">
                                                                {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                        </div>
                                                        <p className="text-gray-900 text-sm truncate">{conv.lastMessage}</p>
                                                    </div>
                                                    </div>
                                                </button>
                                            ) 

                                        ): (
                                            options.map((opt) => 

                                                <button
                                                    key={opt.key}
                                                    className="w-full mb-2 bg-zinc-700 rounded p-3 hover:bg-zinc-700 transition"
                                                    onClick={() => handleSelect(opt.component)}
                                                    >
                                                        {opt.option}
                                                </button>
                                            )
                                        )
                                    }
                                    

                                </div>
                            </ScrollArea>

                                <header className="py-2 px-7 flex flex-none justify-between items-center bg-neutral-700 text-white">
                                    <button
                                        className="text-2xl font-semibold"
                                        onClick={handleSubmit}
                                    >
                                        O
                                    </button>
                                    <button
                                        className="text-2xl font-semibold"
                                        onClick={handleSubmit}
                                    >
                                        O
                                    </button>
                                </header>
                        </div>
                        
                    
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={70} 
                    minSize= {50}
                >


                    {
                        !isClick ? ( 
                            userId && chatWith ?(
                                <ChatCard userId={userId} chatWith={chatWith} />
                            ): (
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
                        ) : ( SelectedComponent ?
                                <Suspense fallback={<div>Loading...</div>}>
                                    <SelectedComponent /> 
                                </Suspense>
                                : 
                                <p>Select an option...</p>
                            )
                                    
                    }     
           
                </ResizablePanel>
        
                </ResizablePanelGroup>
            </div>

        )
    );
}