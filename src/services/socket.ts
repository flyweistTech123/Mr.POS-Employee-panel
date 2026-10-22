// src/services/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://pos-backend-7xuw.onrender.com";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  // If a stale disconnected instance exists, clean it up first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],       // skip polling for lower latency
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket?.id);
  });
  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });
  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error:", err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};