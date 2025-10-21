// ✅ Force Client Component
'use client';
import ChatCard from '@/components/ChatCard';


export default function MyChatPage({ searchParams }: { searchParams: { [key: string]: string } }) {
  const userId = searchParams.userId;
  const chatWith = searchParams.chatWith;

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <ChatCard userId={userId} chatWith={chatWith} />
    </div>
  );
}