import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocketConnection = () => {

  if (socket) return socket;

  socket = io("https://vibein-production-d87a.up.railway.app", {
    transports: ["websocket"],
    secure: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  return socket;
};