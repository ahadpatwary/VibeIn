// src/server.ts
import http from 'http';
import { connectToDb } from './lib/db';
import { Server } from 'socket.io';
import { setupSocket } from "./socket";
import app from './app';
import * as cluster from 'node:cluster'; // ✅ TS-friendly import
import * as os from 'os';

const server = http.createServer(app);
const numCPUs = os.cpus().length;

console.log("Total CPU cores:", numCPUs);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://vibe-in-teal.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocket(io);

// Connect to DB
(async () => {
  try {
    await connectToDb();
    console.log("Connected to DB");
  } catch (error) {
    console.error("DB connection error:", error);
  }
})();

// Node.js cluster
if (cluster.isPrimary) { // ✅ use isPrimary instead of isMaster
  const workerCount = numCPUs - 2; // reserve 2 cores for OS/DB
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking ${workerCount} workers...`);

  // Spawn workers
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  // Respawn worker if it exits
  cluster.on(
    'exit',
    (worker: cluster.Worker, code: number | null, signal: NodeJS.Signals | null) => {
      console.log(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
      console.log("Spawning a new worker...");
      cluster.fork();
    }
  );
} else {
  // Worker process
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} is running. Socket server listening on PORT ${PORT}`);
  });
}