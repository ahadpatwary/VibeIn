import { Server } from "socket.io";
import { addUserHandler } from "./events/addUser";
import { disConnectUserHandler } from "./events/disConnectuser";
import { sendMessageHandler } from "./events/sendMessage";

export const setupSocket = (io: Server) => {

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    addUserHandler(io, socket);
    sendMessageHandler(io, socket);
    disConnectUserHandler(io, socket);

  });
};