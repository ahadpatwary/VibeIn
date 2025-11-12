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
import removeGroupRouter from './api/removeGroup';
import leaveGroupRouter from './api/leaveGroup';
import sendGroupRequestRouter from './api/sendGroupRequest';
import getTotalGroupsRouter from './api/getTotalGroups'
import getSendRequestRouter from './api/getSendRequest';
import getGroupMessageRouter from './api/getGroupMessage';
import linkPreviewRouter from './api/linkPreview';
import deleteGroupMessageRouter from './api/deleteGroupMessage';
import deleteMessageRouter from './api/deleteMessage';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/getMessages", messageRoutes);
app.use('/api/getConversation', conversationRoutes);
app.use('/api/createGroup', createGroupRoute);
app.use('/api/blockUser', blockUserRouter);
app.use('/api/cancleRequest', cancleRequestRouter);
app.use('/api/getAllGroups', getAllGroupsRouter);
app.use('/api/getComingRequest', getComingRouter);
app.use('/api/getGroups', getGroupsRouter);
app.use('/api/getSendRequest', getSendRequest);
app.use('/api/removeGroup', removeGroupRouter);
app.use('/api/leaveGroup', leaveGroupRouter);
app.use('/api/sendGroupRequest', sendGroupRequestRouter)
app.use('/api/getTotalGroups', getTotalGroupsRouter)
app.use('/api/getSendRequest', getSendRequestRouter);
app.use('/api/getGroupMessage', getGroupMessageRouter);
app.use('/api/linkPreview', linkPreviewRouter);
app.use('/api/deleteGroupMessage', deleteGroupMessageRouter);
app.use('/api/deleteMessage', deleteMessageRouter);

export default app;