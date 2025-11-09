'use client';

import ChatCard from '@/components/ChatCard';
import { userIdClient } from '@/lib/userId';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import GroupCard from '@/components/GroupCard'

function ChatPageContent() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId') || '';


  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number>(0);

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


  return (
    <div style={{ height: viewportHeight }}>
      <GroupCard groupId={groupId}/>
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