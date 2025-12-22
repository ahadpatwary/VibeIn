import { Server } from 'socket.io';
import http from 'http';
import app from '../app';

let socketConnection: Server | null = null;

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
        });
        return { io, server };

    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
};