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
  referenceMessage: {
    senderId:{
      name: string,
      picture: {
        public_id: string,
        url: string,
      }
    },
    text: string,
  }
  groupId: string;
  text: string;
  createdAt: string;
}

export const useGetGroupMessage = (groupId: string) => {
  const [groupMessage, setGroupMessage] = useState<Message[]>([{
    senderId: {
      _id: "123",
      name: "ahad",
      picture: {
        public_id: "",
        url: "",
      }
    },
    referenceMessage: {
      senderId:{
        name: "",
        picture: {
          public_id: "",
          url: "",
        }
      },
      text: "ahad",
    },
    groupId: "",
    text: "",
    createdAt: ""
  }]);

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