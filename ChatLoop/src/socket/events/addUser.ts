import { Server, Socket } from "socket.io";
import { activeUsers } from "../activeUsers";
import { getRedisClient } from "../../lib/redis";

import { initPresenceBatch } from '../events/setInterval'


export const addUserHandler = (io: Server, socket: Socket) => {

    initPresenceBatch(io); // একবারই call, server start-up এ
    
    socket.on('addUser', async (userId: string) => {

        const Redis = getRedisClient();
        if(!Redis) return;

        await Redis.set(`user:online:${userId}`, "1", "EX", 300); // string
        await Redis.sadd("online:users", userId); //set because set element can't expire

        activeUsers[userId] = socket.id;
        io.emit('getUsers', Object.keys(activeUsers));
    })
}