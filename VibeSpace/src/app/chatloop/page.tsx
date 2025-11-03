// ✅ Force Client Component
'use client';
import ChatCard from '@/components/ChatCard';
import { userIdClient } from '@/lib/userId';
import { useEffect } from 'react';


export default function MyChatPage({ searchParams }: { searchParams: { [key: string]: string } }) {
  const userId = searchParams.userId;
  const chatWith = searchParams.chatWith;
  let storedUserId: string | null = null;

  useEffect(() => {
    (async () => {
      try {
        storedUserId = await userIdClient();
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    })();
  }, []);

  if (!storedUserId || storedUserId !== userId) {
    return <div>Please log in to access your chat.</div>;
  }

  return (
    <ChatCard userId={userId} chatWith={chatWith} />
  );
}