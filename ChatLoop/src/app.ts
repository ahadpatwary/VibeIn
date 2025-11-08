import express from "express";
import cors from "cors";

import messageRoutes from './api/getMessage'
import conversationRoutes from './api/getConversation';
import createGroupRoute from './api/createGroup';
import blockUserRouter from './api/blockUser';
import cancleRequestRouter from './api/cancleRequest'
import getAllGroupsRouter from './api/getAllGroups';
import getComingRouter from './api/getComingRequest';
import getGroupsRouter from './api/getGroups';
import getSendRequest from './api/getSendRequest';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/getMessages", messageRoutes);
app.use('/api/getConversation', conversationRoutes);
app.use('/api/createGroup', createGroupRoute);
app.use('/api/blockUser', blockUserRouter);
app.use('/api/cancleRequest', cancleRequestRouter);
app.use('/api/getAllGroups', getAllGroupsRouter);
app.use('/api/getComingRouter', getComingRouter);
app.use('/api/getGroups', getGroupsRouter);
app.use('/api/getSendRequest', getSendRequest);


export default app;