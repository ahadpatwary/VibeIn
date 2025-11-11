import { useState, useEffect } from 'react'

interface Message {
  senderId: {
    _id: string,
    name: string,
    picture: {
      public_id: string,
      url: string,
    }
  };
  groupId: string;
  text: string;
  createdAt: string;
}

export const useGetGroupMessage = (groupId: string) => {
  const [groupMessage, setGroupMessage] = useState<Message[]>([]);

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