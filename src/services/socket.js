// utils/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
  autoConnect: false
});

// Connection management
let isConnected = false;

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  isConnected = true;
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  isConnected = false;
  if (reason === "io server disconnect") {
    socket.connect();
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export const connectSocket = () => {
  if (!isConnected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (isConnected) {
    socket.disconnect();
  }
};

export default socket;