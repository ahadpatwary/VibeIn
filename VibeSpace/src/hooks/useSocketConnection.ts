import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";



export const useSocketConnection = (userId: string) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {

        if(userId === "") return;
        if(socketRef.current) return socketRef.current;

        socketRef.current = io("https://vibein-production-d87a.up.railway.app", {
            transports: ["websocket"],
            secure: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });
        
        socketRef.current && socketRef.current.emit('addUser', userId);

        return () => {
            socketRef.current?.disconnect();
        };
    }, [userId]);


    return socketRef.current;
}