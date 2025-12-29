import { Server } from 'socket.io';
import http from 'http';
import app from '../app';
let socketConnection: { io: Server; server: http.Server } | null = null;
import { createAdapter } from "@socket.io/redis-adapter";


export const setSocketConnections = (pubClient, subClient) => {
    if(!socketConnection) {
        socketConnection = initializeSocketIO(pubClient, subClient);
    }
    return socketConnection;
};


export const initializeSocketIO = (pubClient, subClient) => {
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