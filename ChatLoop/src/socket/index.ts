import { Server } from "socket.io";
import { addUserHandler } from "./events/addUser";
import { disConnectUserHandler } from "./events/disConnectuser";
import { sendMessageHandler } from "./events/sendMessage";
import { typingStateHandler } from "./events/typingState";
import { joinGroupHandler } from "./events/jointGroup";
import { sendGroupMessageHandler } from "./events/sendGroupMessage";

export const setupSocket = (io: Server) => {

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    addUserHandler(io, socket);
    sendMessageHandler(io, socket);
    typingStateHandler(io, socket);
    joinGroupHandler(io, socket);
    sendGroupMessageHandler(io, socket);
    disConnectUserHandler(io, socket);

  });
};