'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatCard from '@/components/ChatCard';
import { Avatar } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

export default function ChatSpacePage() {
    const [userId, setUserId] = useState("");
    const [chatWith, setChatWith] = useState("");
    const [totalConv, setTotalConv] = useState([]);

    useEffect(() => {
        ;(async () => {
            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getConversation');

            if(!res.status){
                console.error("something went wrong");
            }
            const { conversation } = await res.json();
            setTotalConv(conversation || []);
        })();
    }, [])

    const isMobile = useIsMobile();

    const handleDesktopClick = () => {
        
        setUserId("");
        setChatWith("");
    }

    const handleMobileClick = (senderId, receiverId) => {
        
        setUserId(senderId);
        setChatWith(receiverId);
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
                        totalConv.map((conv) => {
                            <div 
                                className="p-3"
                                onClick={() => handleMobileClick(conv.senderId, conv.receiverId)}
                            >
                                <div className="flex items-center mb-4 cursor-pointer       hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <Avatar src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" size="size-10"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg text-black font-semibold">Alice</h2>
                                        <p className="text-gray-600">{conv.lastMessage}</p>
                                        <p>{conv.lastMessageTime}</p>
                                    </div>
                                </div>    
                            </div>
                        })
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
                                    <div 
                                        className="flex items-center mb-4 cursor-pointer       hover:bg-gray-100 p-2 rounded-md"
                                        conClick={handleDesktopClick}
                                    >
                                        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                            <img src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg text-black font-semibold">Alice</h2>
                                            <p className="text-gray-600">Hoorayy!!</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <img src="https://placehold.co/200x/ad922e/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">Martin</h2>
                                        <p className="text-gray-600">That pizza place was amazing! We should go again sometime. 🍕</p>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <img src="https://placehold.co/200x/2e83ad/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">Charlie</h2>
                                        <p className="text-gray-600">Hey, do you have any recommendations for a good movie to watch?</p>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <img src="https://placehold.co/200x/c2ebff/0f0b14.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">David</h2>
                                        <p className="text-gray-600">I just finished reading a great book! It was so captivating.</p>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <img src="https://placehold.co/200x/e7c2ff/7315d1.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">Ella</h2>
                                        <p className="text-gray-600">What's the plan for this weekend? Anything fun?</p>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <img src="https://placehold.co/200x/ffc2e2/ffdbdb.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">Fiona</h2>
                                        <p className="text-gray-600">I heard there's a new exhibit at the art museum. Interested?</p>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                                        <img src="https://placehold.co/200x/f83f3f/4f4f4f.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" className="w-12 h-12 rounded-full"/>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">George</h2>
                                        <p className="text-gray-600">I tried that new cafe downtown. The coffee was fantastic!</p>
                                    </div>
                                    </div>

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