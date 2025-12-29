import { Server } from 'socket.io';
import http from 'http';
import app from '../app';
let socketConnection: { io: Server; server: http.Server } | null = null;
import { createAdapter } from "@socket.io/redis-adapter";
import Redis  from 'ioredis';


export const setSocketConnections = (pubClient: Redis, subClient: Redis) => {
    if(!socketConnection) {
        socketConnection = initializeSocketIO(pubClient, subClient);
    }
    return socketConnection;
};


export const initializeSocketIO = (pubClient: Redis, subClient: Redis) => {
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