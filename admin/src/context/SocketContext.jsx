import React, { createContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export const SocketContext = createContext();

const SOCKET_URL = "http://localhost:8001";

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null); // ← add this

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token: localStorage.getItem("token") },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket); // ← update state

    newSocket.on("connect", () => {
      console.log("Socket kết nối:", newSocket.id);
      const user = JSON.parse(localStorage.getItem("user")) || { _id: "" };
      newSocket.emit("user-online", user._id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Lỗi kết nối socket:", error.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket ngắt kết nối, lý do:", reason);
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      console.log(`Thử kết nối lại lần ${attempt}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) return null; // Hoặc loading spinner

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
