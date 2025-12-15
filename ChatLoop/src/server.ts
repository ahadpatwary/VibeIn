import http from 'http';
import { connectToDb } from './lib/db';
import { Server } from 'socket.io';
import { setupSocket } from './socket';
import app from './app';

const PORT = process.env.PORT || 8080;

// HTTP server create
const server = http.createServer(app);

// Socket.IO setup
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

// Socket event handlers
setupSocket(io);

// DB connect
async function startServer() {
  try {
    await connectToDb();
    console.log('✅ Connected to DB');

    // Server listen
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ DB connection failed:', error);
    process.exit(1); // Exit if DB fails
  }
}

startServer();