const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./config/db");
const cors = require("cors");

const { Server } = require("socket.io");
const http = require("http");
const { setupSocket } = require("./socket/socketHandler.js");
const { startScheduleCheck } = require("./socket/socketSchedule.js");

const authRoute = require("./route/authRoute.js");
const userRoute = require("./route/userRoute.js");
const protectedRoute = require("./route/protectedRoute.js");
const companyRoute = require("./route/companyRoute.js");
const memberRoute = require("./route/memberRoute.js");
const leaderRoute = require("./route/leaderRoute.js");
const notificationRoute = require("./route/notificationRoute.js");
const groupRoute = require("./route/groupRoute.js");

dotenv.config();
const app = express();

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  // "http://103.45.235.153",
  "http://127.0.0.1:5500",
  "https://apitaskmanager.pdteam.net",
  "https://taskmanager.pdteam.net",
 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use('/uploads', express.static('uploads'));

ConnectDB();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// API routes
app.use("/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/protected", protectedRoute);
app.use("/api/company", companyRoute);
app.use("/api/member", memberRoute);
app.use("/api/leader", leaderRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/group", groupRoute);

// SOCKET setup
setupSocket(io);
startScheduleCheck();

const PORT = process.env.PORT || 8001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
