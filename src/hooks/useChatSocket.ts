// src/hooks/useChatSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { connectSocket, getSocket } from "@/services/socket";
import { receiveMessage } from "@/redux/slice/chatSlice";
import type { ApiMessage } from "@/api/chatApi";

export const useChatSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const joinedRef = useRef<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = connectSocket(token);

    const onConnect = () => {
      setConnected(true);
      // Re-join all rooms after a reconnect
      joinedRef.current.forEach((id) => {
        socket.emit("chat:join", { chat_conversation_id: Number(id) });
      });
    };
    const onDisconnect = () => setConnected(false);

    const onNewMessage = (data: any) => {
      const message: ApiMessage & { conversationId?: string } = {
        id: data?.id ?? data?.message_id ?? crypto.randomUUID(),
        text: data?.message ?? data?.text ?? "",
        senderId: data?.senderId ?? data?.sender_id ?? data?.user_id ?? "",
        createdAt: data?.createdAt ?? data?.created_at ?? new Date().toISOString(),
        conversationId: data?.chat_conversation_id ?? data?.conversationId ?? data?.conversation_id,
      };
      dispatch(receiveMessage(message));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat:message:new", onNewMessage);
    
    // Check if already connected on mount
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat:message:new", onNewMessage);
    };
  }, [dispatch]);

  const joinChat = useCallback((conversationId: string | number) => {
    const socket = getSocket();
    const key = String(conversationId);
    if (!socket?.connected || joinedRef.current.has(key)) return;
    socket.emit("chat:join", { chat_conversation_id: Number(key) });
    joinedRef.current.add(key);
  }, []);

  const sendChatMessage = useCallback(
    (conversationId: string | number, text: string): Promise<any> => {
      const socket = getSocket();
      if (!socket?.connected) {
        return Promise.reject(new Error("Socket not connected"));
      }

      const clientMessageId = crypto.randomUUID();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Message send timed out")), 10_000);

        socket.emit(
          "chat:message:send",
          {
            chat_conversation_id: Number(conversationId),
            message_type: "text",
            message: text,
            client_message_id: clientMessageId,
          },
          (response: any) => {
            clearTimeout(timeout);
            if (response?.error) reject(new Error(response.error));
            else resolve({ ...response, client_message_id: clientMessageId });
          }
        );
      });
    },
    []
  );

  return { joinChat, sendChatMessage, connected };
};