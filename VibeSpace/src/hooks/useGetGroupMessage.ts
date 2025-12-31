import { useState, useEffect } from 'react'

interface receiveMessagePropType {
    type: 'oneToOne'| 'group',
    _id?: string,
    messageId?: string,
    senderId: string,
    receiverId: string | null,
    name: string,
    picture: string,
    joinId: string | null,
    text: string,
    referenceMessage: string | null,
    messageTime: string,
    conversationName: string,
    conversationPicture: string,
}

export const useGetGroupMessage = (groupId: string) => {
  const [groupMessage, setGroupMessage] = useState<receiveMessagePropType[]>([]);
  if(groupId === undefined) return { groupMessage, setGroupMessage };


  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getGroupMessage', {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId })
        })

        const data = await res.json();
        setGroupMessage(data.messages || []);

      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    })();
  }, [groupId]);

  return { groupMessage, setGroupMessage };
}