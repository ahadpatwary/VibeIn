import http from 'http'
import { connectToDb } from './lib/db';
import { Server } from 'socket.io'
import { setupSocket } from "./socket";
import app from './app';
import cluster from 'node:cluster';


const server = http.createServer(app);

const numCPUs = require('os').cpus().length;

console.log("corecup", numCPUs);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://vibe-in-teal.vercel.app"], // ✅ specific origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocket(io);


(async()=>{
  try {
    await connectToDb();
    console.log("connected to DB");
  } catch (error) {
    console.error(error);
  }
})();


if (cluster.isMaster) {
  const workerCount = numCPUs - 2; // reserve 1 core for OS
  console.log(`Master ${process.pid} is running`);

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
    console.log(`socket server is running on PORT ${PORT}`);
  })
}