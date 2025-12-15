import http from 'http';
import { connectToDb } from './lib/db';
import { Server } from 'socket.io';
import { setupSocket } from "./socket";
import app from './app';
import * as cluster from 'node:cluster'; // ✅ namespace import
import * as os from 'os';

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
    console.log("Connected to DB");
  } catch (error) {
    console.error(error);
  }
})();

if (cluster.isPrimary) { // ✅ Node 18+ use isPrimary
  const workerCount = numCPUs - 2;
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker: cluster.Worker, code: number | null, signal: NodeJS.Signals | null) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on PORT ${PORT}`);
  });
}