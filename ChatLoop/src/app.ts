import express from "express";
import cors from "cors";
// import messageRoutes from "./api/routes/messageRoutes";
// import userRoutes from "./api/routes/userRoutes";
import messageRoutes from './api/getMessage'
import conversationRoutes from './api/getConversation';
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/getMessages", messageRoutes);
app.use('/api/getConversation', conversationRoutes);

// app.use("/api/messages", messageRoutes);
// app.use("/api/users", userRoutes);


export default app;