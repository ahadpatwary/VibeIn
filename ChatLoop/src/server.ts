import cluster from 'node:cluster';
import os from 'node:os';
import http from 'http';
import { connectToDb } from './lib/db';
import { Server } from 'socket.io';
import { setupSocket } from './socket';
import { setSocketConnections } from './lib/socket_io';
import { connectToRabbitMQ } from './lib/rabbitMQ';

interface ExtendedServer  {
    io: Server;
    server: http.Server;
};

const PORT = process.env.PORT || 8080;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < 5; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster.fork();
    });
} else {
    // Worker process
    async function startWorker() {
        try {
            console.log(`✅ Worker ${process.pid} connected to DB`);

            await connectToDb();
            await connectToRabbitMQ();
            const { io, server } = setSocketConnections() as ExtendedServer;

            setupSocket(io);

            server.listen(PORT, () => {
                console.log(`🚀 Worker ${process.pid} running on port ${PORT}`);
            });

        } catch (error) {
            console.error(`❌ Worker ${process.pid} DB connection failed:`, error);
            process.exit(1);
        }
    }

    startWorker();
}
