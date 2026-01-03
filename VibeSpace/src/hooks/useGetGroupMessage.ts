import { useState, useEffect } from 'react'

interface receiveMessagePropType {
  _id: string,
  type: 'oneToOne'| 'group',
  senderId: string,
  name: string,
  picture: string,
  text: string,
  referenceMessage: string | null,
  messageTime: number,
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
        console.log("message", data);
        setGroupMessage(data.messages || []);

      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    })();
  }, [groupId]);

  return { groupMessage, setGroupMessage };
}