import { Server } from 'socket.io';
import http from 'http';
import app from '../app';
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedisClient } from './redis';
let socketConnection: { io: Server; server: http.Server } | null = null;


const pubClient = getRedisClient();
pubClient?.on("connect", () => console.log("✅ Redis pub connected"));
pubClient?.on("error", (err) => console.error("Redis pub error:", err.message));

const subClient = pubClient?.duplicate();
subClient?.on("connect", () => console.log("✅ Redis sub connected"));
subClient?.on("error", (err) => console.error("Redis sub error:", err.message));


export const setSocketConnections = () => {
    if(!socketConnection) {
        socketConnection = initializeSocketIO();
    }
    return socketConnection;
};


export const initializeSocketIO = () => {
    try {
        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {     
                origin: [
                    'http://localhost:3000',
                    'https://vibe-in-teal.vercel.app'   
                ],
                methods: ['GET', 'POST'],
                credentials: true,
            },
            adapter: createAdapter(pubClient, subClient),
        });
        return { io, server };

    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
        return null;
    }
};