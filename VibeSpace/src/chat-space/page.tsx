import { useIsMobile } from '@/hooks/useIsMobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
// import { ScrollArea } from "@/components/ui/scroll-area";
import ChatCard from '@/components/ChatCard';

export default function chatSpacePage() {
    const isMobile = useIsMobile();
    const userId = "currentUserId";
    const chatWith = "userToChatWithId";

    return (
        isMobile ? (

            <h1>Mobile</h1>

        ) : (

            <div className= 'h-dvh w-full flex '>

                <ResizablePanelGroup
                    direction="horizontal"
                    className="flex! flex-1!"
                >

            

                <ResizablePanel defaultSize={30} minSize={30}>
                    // Your user profile component goes here
                </ResizablePanel>

                <ResizableHandle withHandle className= "w-3 " />

                <ResizablePanel defaultSize={70} 
                    minSize= {50}
                >
                    {/* <ScrollArea className="w-full h-full overflow-y-auto scroll-smooth"> 
                        // Your chat space content goes here    
                    </ScrollArea> */}
                
                    <ChatCard userId={userId} chatWith={chatWith} />

                </ResizablePanel>
        
                </ResizablePanelGroup>
            </div>

        )
    );
}