import { Server, Socket } from "socket.io";

export const typingStateHandler = (io: Server, socket: Socket) => {
  // User কোনো room-এ join করবে
  socket.on("joinRoom", (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  // Typing শুরু
  socket.on("typing", ({ roomId }) => {
    if (!roomId) return;
    // শুধু ওই room এর অন্যদের কাছে পাঠাও
    socket.to(roomId).emit("someoneTyping");
  });

  // Typing বন্ধ
  socket.on("stopTyping", ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit("someoneStopTyping");
  });

  // Disconnect handle করা (optional)
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};