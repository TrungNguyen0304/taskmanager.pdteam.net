// src/services/socketService.js
import io from "socket.io-client";
const socket = io("http://localhost:8001", {
  auth: {
    token: localStorage.getItem("jwtToken"), 
  },
});

export const initializeSocket = (userId) => {
  socket.emit("user-online", userId);
};

export const onNotification = (callback) => {
  socket.on("team-assigned", callback);//1
  socket.on("project-assigned", callback);//2
  socket.on("project-removed", callback);//3
  socket.on("task-assigned", callback);//4
  socket.on("task-removed", callback);//5
  socket.on("report-submitted-member", callback);//6
  socket.on("report-evaluated-member", callback);//7
  socket.on("update-status", callback);//8
  socket.on("report-submitted-leader", callback);//9
  socket.on("report-evaluated-leader", callback);//10
  socket.on("task-overdue", callback);//11
  socket.on("project-overdue", callback);//12
  socket.on("project-status-updated", callback);//13
  socket.on("member-added", callback);//14
};

export const disconnectSocket = () => {
  socket.disconnect();
};