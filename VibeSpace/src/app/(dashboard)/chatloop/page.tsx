'use client';

import { userIdClient } from '@/lib/userId';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useProfileInformation } from '@/hooks/useProfileInformation';
import GroupCard from '@/components/GroupCard';
import { useCheckConversationExistence } from '@/hooks/useCheckConversationExistences';
// import { useSocketConnection } from '@/hooks/useSocketConnection';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const chatWith = searchParams.get('chatWith') || '';
  const [joinId, setJoinId] = useState<string | null>(null);


  useCheckConversationExistence(userId, chatWith, setJoinId)!;

  const { userName,  profilePicture } = useProfileInformation(chatWith);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  // const socket = useSocketConnection(userId);



  

  useEffect(() => {
    (async () => {
      try {
        const fetchedUserId = await userIdClient();
        setStoredUserId(fetchedUserId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    })();

    const updateHeight = () => {
      const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      setViewportHeight(height);
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    };

    updateHeight();
    window.visualViewport?.addEventListener('resize', updateHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);

  if (!storedUserId || storedUserId !== userId) {
    return <div>Please log in to access your chat.</div>;
  }
  // socket?.emit("join-group", { userId, joinId: '', newJoinId: joinId });

  return (
    <div style={{ height: viewportHeight }}>
      <GroupCard
        type= "oneToOne"
        joinId={joinId}
        setJoinId={setJoinId}
        chatWith={chatWith} 
        conversationName={userName}
        conversationPicture={profilePicture}
      />
    </div>
  );
}

// ✅ Suspense wrapper এখন top-level এ
export default function MyChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}