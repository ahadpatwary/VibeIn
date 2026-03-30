// 'use client';

// import ChatSidebar from "@/components/chatApp/ChatSidebar";
// import { useIsMobile } from "@/hooks/useIsMobile";
// import { useState } from 'react';
// import Image from 'next/image';
// import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
// import useGetConversation from "@/hooks/useGetConversation";
// import GroupCard from "@/components/chatApp/GroupCard";


// // const ChatSpacePage = () => {
// //   const isMobile = useIsMobile();
// //   const { conversations, setConversations, convObj, setConvObj } = useGetConversation();


// //   const [state, setState] = useState<"empty" | "group" | "oneToOne">("empty");
// //   const [joinId, setJoinId] = useState('');
// //   const [conversationName , setConversationName] = useState('');
// //   const [conversationPicture, setConversationPicture] = useState('');


// //   return (
// //     <>
// //       {
// //         isMobile ? 
// //           <ChatSidebar/> : (
// //           <div className="h-dvh w-full flex">
// //             <ResizablePanelGroup direction="horizontal" className="flex-1">
// //               <ResizablePanel defaultSize={30} minSize={30}>
                  
// //                 <ChatSidebar 
// //                   setConversationName={setConversationName} 
// //                   setConversationPicture={setConversationPicture}
// //                   joinId={joinId}
// //                   setJoinId={setJoinId} 
// //                   conversations={conversations}
// //                   setConversations={setConversations}
// //                   convObj={convObj}
// //                   setConvObj={setConvObj}
// //                   setState ={setState}
// //                 />
// //               </ResizablePanel>

// //               <ResizableHandle />
// //                 <ResizablePanel defaultSize={70} minSize={50}>
// //                   {(() => {
// //                     if (state === "oneToOne" && joinId) {
// //                       return(
// //                         <GroupCard 
// //                           type= "oneToOne"
// //                           joinId={joinId} 
// //                           conversationName={conversationName}
// //                           conversationPicture={conversationPicture}
// //                         />
// //                       )
// //                     } 
// //                     else if (state === "group" && joinId) {
// //                       return( 
// //                         <GroupCard 
// //                             type="group"
// //                             joinId={joinId}
// //                             conversationName={conversationName}
// //                             conversationPicture={conversationPicture}
// //                         />
// //                       )
// //                     } 
// //                     else {
// //                       return (
// //                         <div className="relative h-screen w-full">
// //                           <Image
// //                             src="/Chat_llustration.png"
// //                             alt="Chat Space Background"
// //                             fill
// //                             quality={90}
// //                             className="object-cover"
// //                             priority
// //                           />
// //                         </div>
// //                       );
// //                     }
// //                   })()}
// //                 </ResizablePanel>

// //             </ResizablePanelGroup>
// //           </div>
// //         )
// //       }
// //     </>
// //   )
// // }

// // export default ChatSpacePage;


'use client'

// import { CustomWrapper } from '@/components/CustomWrapper'
// import { useSession } from "next-auth/react"
// import { useCards }  from '@/hooks/useFetchCards';
// import { Card } from "@/components/ui/card"
// import { UserProfile } from '@/components/UserProfile';
// import CarouselDemo from '@/components/Embla';
// import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
// import { MenubarDemo } from '@/components/Bar';
// import { ScrollArea } from '@/components/ui/scroll-area'

// import { ShowCard } from '@/modules/feedPost/components/ShowCard';
// import { useCard } from '@/modules/feedPost/hooks/useCard';
import { Card } from "@/shared/components/ui/card";
// import { Button } from '@/shared/components/ui/button';
import { MenubarDemo } from '@/shared/components/Bar';
import CarouselDemo from '@/shared/components/Embla';
import Image from 'next/image';
// import GroupCard from '@/shared/components/chatApp/GroupCard';
// import ChatSidebar from '@/shared/components/chatApp/ChatSidebar';
import { useState } from 'react';



function Feed() {
  // const { data: session } = useSession()
  // const { activeCards } = useCards(session?.user.id!);
  const router = useRouter();

  const handleClick = () => {
    router.push('/create-post');
  }

  // const { conversations, setConversations, convObj, setConvObj } = useGetConversation();
  const [conversations, setConversations] = useState([])
  const [convObj, setConvObj] = useState([])


  const [state, setState] = useState<"empty" | "group" | "oneToOne">("empty");
  const [joinId, setJoinId] = useState('');
  const [conversationName , setConversationName] = useState('');
  const [conversationPicture, setConversationPicture] = useState('');

  return (

    <div className="flex flex-col min-h-dvh max-h-dvh">

      <MenubarDemo />
      <div className='flex-1 max-w-7xl w-full mx-auto gap-2 px-2 flex flex-row justify-around'>

        <div className='min-h-flex-1 my-2 flex-3 flex flex-row justify-around'>
          <div className='flex-1 min-h-full max-w-[500px] bg-gray-900 rounded-l-sm '>
            {/* <ChatSidebar 
              setConversationName={setConversationName} 
              setConversationPicture={setConversationPicture}
              joinId={joinId}
              setJoinId={setJoinId} 
              conversations={conversations}
              setConversations={setConversations}
              convObj={convObj}
              setConvObj={setConvObj}
              setState ={setState}
            /> */}
          </div>

     

          <div className='flex-2 hidden md:block rounded-r-sm'>
            {(() => {
              if (state === "oneToOne" && joinId) {
                return(
                  // <GroupCard 
                  //   type= "oneToOne"
                  //   joinId={joinId} 
                  //   conversationName={conversationName}
                  //   conversationPicture={conversationPicture}
                  // />
                  <p>ahad </p>
                )
              } 
              else if (state === "group" && joinId) {
                return( 
                  // <GroupCard 
                  //     type="group"
                  //     joinId={joinId}
                  //     conversationName={conversationName}
                  //     conversationPicture={conversationPicture}
                  // />
                  <p>ahad </p>

                )
              } 
              else {
                return (
                  <div className="relative h-full w-full">
                    <Image
                      src="/Chat_llustration.png"
                      alt="Chat Space Background"
                      fill
                      quality={90}
                      className="object-cover rounded-r-sm"
                      priority
                    />
                  </div>
                );
              }
            })()}
          </div>
        </div>

        <Card className='flex-1 min-h-auto h-min min-w-0 mt-2 hidden lg:block'>
          < CarouselDemo />
        </Card>

      </div>
      <footer className=' block md:hidden sticky bottom-0'>
        <MenubarDemo footer={true} />
      </footer>
    </div>

  );
}

export default Feed;