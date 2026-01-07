'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../lib/store/store';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useSession } from 'next-auth/react';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ 1. ALL hooks at top-level (NO early return before this)
  const storeRef = useRef<AppStore | null>(null);
  const { data: session, status } = useSession();
  const socket = useSocketConnection();

  // ✅ 2. create store once
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // derived values
  const userId = session?.user?.id;

  console.log(userId);

  // ✅ 3. side-effect safely
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!socket || !userId) return;

    socket.emit('addUser', userId);
  }, [status, socket, userId]);

  // ✅ 4. conditional rendering AFTER hooks
  if (status === 'loading') {
    return null; // loader
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}