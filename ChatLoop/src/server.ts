// src/server.ts
import cluster from 'node:cluster';
import os from 'node:os';
import { setSocketConnections } from './lib/socket_io';
import { getRedisClient } from './lib/redis';
import { connectToDb } from './lib/db';
import { connectToRabbitMQ } from './lib/rabbitMQ';
import { setupSocket } from './socket';
import { Server } from 'socket.io';
import http from 'http';

interface ExtendedServer {
    io: Server;
    server: http.Server;
}

const PORT = process.env.PORT || 8080;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < Math.min(5, numCPUs); i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster.fork();
    });

} else {
    const startWorker = async () => {
        try {
            console.log(`✅ Worker ${process.pid} starting...`);

            // Connect to DB & RabbitMQ
            await connectToDb();
            console.log(`✅ MongoDB connected successfully!`);
            await connectToRabbitMQ();

            // Each worker gets its own Redis client
            const pubClient = getRedisClient();
            if (!pubClient) throw new Error("Redis pub client failed to initialize");
            const subClient = pubClient.duplicate();

            // Ensure both clients are connected
            await pubClient.connect();
            await subClient.connect();

            // Redis event handlers
            [pubClient, subClient].forEach(client => {
                client.on('connect', () => console.log('✅ Redis client connected'));
                client.on('error', (err) => console.error(`❌ Redis error: ${err.message}`));
            });

            // Setup Socket.IO
            const { io, server } = setSocketConnections(pubClient, subClient) as ExtendedServer;
            setupSocket(io);

            server.listen(PORT, () => {
                console.log(`🚀 Worker ${process.pid} running on port ${PORT}`);
            });

        } catch (error) {
            console.error(`❌ Worker ${process.pid} failed:`, error);
            process.exit(1);
        }
    };

    startWorker();
}