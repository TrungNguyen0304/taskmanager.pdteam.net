// src/services/socketService.js
import io from "socket.io-client";
const socket = io("ws://localhost:8001", {
  auth: {
    token: localStorage.getItem("jwtToken"), 
  },
});

export const initializeSocket = (userId) => {
  socket.emit("user-online", userId);
};

export const onNotification = (callback) => {
  socket.on("team-assigned", callback);
  socket.on("project-assigned", callback);
  socket.on("project-removed", callback);
  socket.on("task-assigned", callback);
  socket.on("task-removed", callback);
  socket.on("report-submitted", callback);
  socket.on("report-evaluated", callback);
  socket.on("task-overdue", callback);
  socket.on("project-overdue", callback);
  socket.on("project-status-updated", callback);
};

export const disconnectSocket = () => {
  socket.disconnect();
};