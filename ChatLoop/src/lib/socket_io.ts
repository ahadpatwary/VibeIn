// src/lib/socket_io.ts
import { Server } from 'socket.io';
import http from 'http';
import app from '../app';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

let socketConnection: { io: Server; server: http.Server } | null = null;


export const initializeSocketIO = (pubClient: Redis, subClient: Redis) => {
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: [
                'https://smreaz.com',
                'http://localhost:3000',
                'https://vibe-in-teal.vercel.app'
            ],
            methods: ['GET', 'POST'],
            credentials: true
        },
        adapter: createAdapter(pubClient, subClient),
    });

    return { io, server };
};

/**
 * Singleton Socket.IO connection per worker
 */
export const setSocketConnections = (pubClient: Redis, subClient: Redis) => {
    if (!socketConnection) {
        socketConnection = initializeSocketIO(pubClient, subClient);
    }
    return socketConnection;
};