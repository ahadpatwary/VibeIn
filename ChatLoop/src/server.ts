import http from 'http';
import { connectToDb } from './lib/db';
import { Server } from 'socket.io';
import { setupSocket } from "./socket";
import app from './app';
import cluster from 'node:cluster';
import os from 'os';

const server = http.createServer(app);
const numCPUs = os.cpus().length;

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://vibe-in-teal.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocket(io);

(async () => {
  try {
    await connectToDb();
    console.log("connected to DB");
  } catch (error) {
    console.error(error);
  }
})();

// Node.js cluster check
if (cluster.isPrimary) { // <-- use isPrimary instead of isMaster
  const workerCount = numCPUs - 2; // reserve 2 cores for OS / DB
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < workerCount; i++) {
    cluster.fork(); // <-- fork exists under cluster
  }

  cluster.on(
    'exit',
    (worker: cluster.Worker, code: number | null, signal: NodeJS.Signals | null) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork(); // respawn worker
    }
  );
} else {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`socket server is running on PORT ${PORT}`);
  });
}