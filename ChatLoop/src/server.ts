import http from 'http'
import { connectToDb } from './lib/db';
import { Server } from 'socket.io'
import { setupSocket } from "./socket";
import app from './app';


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



const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`socket server is running on PORT ${PORT}`);
})