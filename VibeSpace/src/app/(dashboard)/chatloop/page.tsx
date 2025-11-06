'use client';
import ChatCard from '@/components/ChatCard';
import { userIdClient } from '@/lib/userId';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MyChatPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const chatWith = searchParams.get('chatWith') || '';

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

      // 👉 CSS variable set করা হচ্ছে
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

  return (
    <div
      style={{ height: viewportHeight }}
      className=''
    >
       <Suspense fallback={<div>Loading chat...</div>}>
          <ChatCard userId={userId} chatWith={chatWith} />
       </Suspense>
    </div>
  );
}
