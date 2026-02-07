// 'use client';

// import { useRef, useEffect } from 'react';
// import { Provider } from 'react-redux';
// import { makeStore, AppStore } from '../lib/store/store';
// import { useSocketConnection } from '@/hooks/useSocketConnection';

// export default function StoreProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // ✅ 1. ALL hooks at top-level (NO early return before this)
//   const storeRef = useRef<AppStore | null>(null);
//   const socket = useSocketConnection();

//   // ✅ 2. create store once
//   if (!storeRef.current) {
//     storeRef.current = makeStore();
//   }

//   // derived values
//   const userId = "123456";

//   console.log(userId);

//   // ✅ 3. side-effect safely
//   // useEffect(() => {
//   //   if (!socket || !userId) return;

//   //   socket.emit('addUser', userId);
//   // }, [ socket, userId]);


//   return <Provider store={storeRef.current}>{children}</Provider>;
// }