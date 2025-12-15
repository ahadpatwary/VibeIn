import cluster from 'node:cluster';
import os from 'os';
import http from 'http';
import net from 'net';
import { connectToDb } from './lib/db';
import { setupSocket } from './socket';
import app from './app';
import { Server } from 'socket.io';

const PORT = Number(process.env.PORT) || 8080;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart worker if it dies
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster.fork();
    });

    // Sticky session server
    const stickyServer = net.createServer((socket) => {
        // Hash by remote port or IP to assign worker
        const workerIndex = socket.remotePort! % numCPUs;
        const worker = Object.values(cluster.workers!)[workerIndex + 1]; // cluster.workers is object
        worker!.send('sticky-session', socket);
    });

    stickyServer.listen(PORT, () => {
        console.log(`Primary listening for connections on port ${PORT}`);
    });

} else {
    // Worker process
    async function startWorker() {
        try {
            await connectToDb();
            console.log(`Worker ${process.pid} connected to DB`);

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

            setupSocket(io);

            // Listen for sticky session sockets from primary
            process.on('message', (msg: any, socket: any) => {
                if (msg === 'sticky-session' && socket) {
                    server.emit('connection', socket);
                }
            });

            console.log(`Worker ${process.pid} ready`);
        } catch (err) {
            console.error(`Worker ${process.pid} failed:`, err);
            process.exit(1);
        }
    }

    startWorker();
}
