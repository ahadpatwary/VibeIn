'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../lib/store/store'
import { useSocketConnection } from '@/hooks/useSocketConnection'
import { useSession } from "next-auth/react";


export default function StoreProvider({ children,}: {children: React.ReactNode}) {

  console.log("yes, all are connect successfully!");
  
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  const { data: session } = useSession();
  const userId = session?.user.id;

  if(!userId) throw new Error("userId not found");

  useEffect(() => {

    const socket = useSocketConnection();
    
    // socket?.emit("universalGroup", { userId });
    socket?.emit("addUser", userId);

  }, [userId])

  return <Provider store={storeRef.current}>{children}</Provider>
}