import express from "express";
import cors from "cors";
// import messageRoutes from "./api/routes/messageRoutes";
// import userRoutes from "./api/routes/userRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// app.use("/api/messages", messageRoutes);
// app.use("/api/users", userRoutes);


export default app;