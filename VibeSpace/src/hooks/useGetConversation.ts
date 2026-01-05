import { userIdClient } from "@/lib/userId";
import { useState, useEffect } from "react";

interface ConversationsMap {
  [conversationId: string]: Conversation;
}

interface OneToOneConversation {
  conversationId: string;
  type: 'oneToOne';
  text: string;
  messageTime: string;
  typing: boolean; // pore thik korbo
  info: {
    user_one: {
      _id: string;
      name: string;
      picture: string;
    };
    user_two: {
      _id: string;
      name: string;
      picture: string;
    };
  };
}

interface GroupConversation {
  conversationId: string;
  type: 'group';
  text: string;
  messageTime: string;
  typing: boolean;
  info: {
    name: string;
    picture: string;
  };
}
export type Conversation = OneToOneConversation | GroupConversation;


const useGetConversation = () => {
    const [conversations, setConversations] = useState<string[]>([]);
    const [convObj, setConvObj] = useState<ConversationsMap>({});
    
    useEffect(() => {
        ;( async () => {

            const userID = await userIdClient()!;
        
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
            console.log("data", data.conversations);
            // setConversations(data.conversations || []);

            const idList = [];
            const convObjData: ConversationsMap = {};

            const conversations: Conversation[] = data.conversations;

            for(const conv of conversations){
                convObjData[conv.conversationId] = {
                  ...conv,
                  typing: true,
                };
                idList.push(conv.conversationId);
            }

            console.log("convObjData", convObjData);
            console.log("convList", idList);

            setConversations(idList);
            setConvObj(convObjData);

        })();
    }, []);

    return { conversations, setConversations, convObj, setConvObj };
}

export default useGetConversation;