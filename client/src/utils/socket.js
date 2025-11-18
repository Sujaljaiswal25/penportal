import { io } from "socket.io-client";

// Get backend URL from environment variable or use default
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Initialize socket connection
const socket = io(SOCKET_URL, {
  autoConnect: false, // Manual connection control
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

// Connection event listeners
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export default socket;
