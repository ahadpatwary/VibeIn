'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatCard from '@/components/ChatCard';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { userIdClient } from '@/lib/userId'
import { getData } from "@/lib/getData";
import { AvatarDemo } from '@/components/AvaterDemo';

interface conversation {
    _id: string,
    senderId: string,
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
    const router = useRouter();

    useEffect(() => {
        ;(async () => {
            const userID = await userIdClient();
            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getConversation', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID })
            });

            if(!res.status){
                console.error("something went wrong");
            }
            const { conversations } = await res.json();
            console.log(conversations);
            setTotalConv(conversations || []);
        })();
    }, [])

    const isMobile = useIsMobile();

    const handleDesktopClick = async (senderId: string, receiverId: string) => {
        console.log("ahad", senderId, receiverId);
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


    return (
        isMobile ? (

             <div className="w-full h-dvh flex flex-col bg-white border-r border-gray-300">

                <header className="p-4 border-b border-gray-300 flex flex-none justify-between items-center bg-indigo-600 text-white">
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
                                className="p-3 w-full bg-gray-200 rounded mb-2"
                                onClick={() => handleMobileClick(conv.senderId, conv.receiverId._id)}
                            >
                                <div className="flex cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    
                                    <AvatarDemo src={conv.receiverId.picture.url} size="size-15" />
                                    
                                    <div className="">
                                        <h2 className="text-lg text-black text-nowrap overflow-ellipsis font-semibold">{conv.receiverId.name}</h2>
                                        <p className="text-gray-600 overflow-ellipsis text-nowrap">{conv.lastMessage}</p>
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

                            <div className="w-full h-dvh flex flex-col bg-white border-r border-gray-300">

                                <header className="p-4 border-b border-gray-300 flex flex-none justify-between items-center bg-indigo-600 text-white">
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
                                <div className="p-3 ">


                                    {
                                        totalConv.map((conv : conversation) => 
                                            <button 
                                                key={conv._id}
                                                className="p-3 w-full mb-2 bg-gray-200 rounded"
                                                onClick={() => handleDesktopClick(conv.senderId, conv.receiverId._id)}
                                            >
                                                <div className="flex cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                               
                                                    <AvatarDemo src={conv.receiverId.picture.url} size="size-15" />
                                                    
                                                    <div className="">
                                                        <h2 className="text-lg text-black font-semibold">{conv.receiverId.name}</h2>
                                                        <p className="text-gray-600">{conv.lastMessage}</p>
                                                    </div>
                                                </div>    
                                            </button>
                                        )
                                    }
                                    

                                </div>
                                    </ScrollArea>
                                </div>
                        
                    
                </ResizablePanel>

                <ResizableHandle className= "w-0" />

                <ResizablePanel defaultSize={70} 
                    minSize= {50}
                >
                    {/* <ScrollArea className="w-full h-full overflow-y-auto scroll-smooth"> 
                        // Your chat space content goes here    
                    </ScrollArea> */}
                    {
                        userId && chatWith ?(
                            <ChatCard userId={userId} chatWith={chatWith} />
                        ): (
                            <h1>no chat here</h1>
                        )
                    }
                    

                </ResizablePanel>
        
                </ResizablePanelGroup>
            </div>

        )
    );
}