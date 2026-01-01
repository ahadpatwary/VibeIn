import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocketConnection = (userId?: string) => {
  if (!socket) {
    socket = io("https://vibein-production-d87a.up.railway.app", {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }

  if (userId) {
    socket.emit("addUser", userId);
  }

  return socket;
};
