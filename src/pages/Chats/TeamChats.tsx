// src/pages/TeamChats.tsx
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import searchIcon from "@/assets/chats/searchIcon.svg";
import sendIcon from "@/assets/chats/sendIcon.svg";
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { settingsTrainingSteps } from '@/walkthrough/steps';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  fetchConversations,
  fetchChatDetails,
  clearActiveChat,
  appendOptimisticMessage,
  confirmMessage,
} from '@/redux/slice/chatSlice';
import type { ApiMessage } from '@/api/chatApi';
import { useChatSocket } from '@/hooks/useChatSocket';

// --- Types ---
interface User {
  id: string; name: string; role: string; avatar: string; lastSeen: string;
  type: "individual"; mobile?: string;
}
interface Group {
  id: string; name: string; avatar: string; memberIds: string[];
  type: "group";
  lastMessage: { text: string; time: string; senderId: string; unread: boolean };
}
type Chat = User | Group;

const roles = ["All", "Waiters", "Chefs", "Managers"];

const mapApiToChat = (apiChat: any): Chat => {
  const mappedLastMessage = apiChat.last_message ? {
    text: apiChat.last_message.message || "",
    time: new Date(apiChat.last_message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    senderId: String(apiChat.last_message.sender_id),
    unread: apiChat.unread_count > 0,
  } : { text: "", time: "", senderId: "", unread: false };

  if (apiChat.type === "group") {
    return {
      id: String(apiChat.chat_conversation_id), 
      name: apiChat.title || "Group Chat",
      avatar: "", 
      memberIds: apiChat.participants?.map((p: any) => String(p.participant_id)) || [],
      type: "group",
      lastMessage: mappedLastMessage,
    };
  }

  const otherParticipant = apiChat.participants?.[0];

  return {
    id: String(apiChat.chat_conversation_id),
    name: apiChat.title || otherParticipant?.name || "Member",
    role: otherParticipant?.role || "Member",
    avatar: "", 
    lastSeen: "",
    type: "individual",
  };
};

const ChatTile = ({ chat, selected, onClick }: {
  chat: Chat; selected: boolean; onClick: () => void;
}) => {
  const unreadCount = chat.type === "group" && chat.lastMessage.unread ? 1 : 0;
  return (
    <div
      className={`flex items-center gap-3 px-2 py-3 cursor-pointer rounded-lg transition-all ${
        selected ? "bg-[#F8EAEE]" : "hover:bg-[#F8EAEE]"
      }`}
      onClick={onClick}
    >
      <img src={chat.avatar || "/default-avatar.png"} alt="avatar"
        className="w-12 h-12 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base truncate text-[#2C2C2E]">{chat.name}</div>
        <div className="truncate text-sm font-normal text-[#666668]">
          {chat.type === "group" ? chat.lastMessage.text : "Tap to view chat"}
        </div>
      </div>
      <div className="flex flex-col items-end min-w-[40px]">
        {unreadCount > 0 && (
          <div className="mt-1 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
        <div className="text-xs text-[#BDBDBD] font-semibold">
          {chat.type === "group" ? chat.lastMessage.time : ""}
        </div>
      </div>
    </div>
  );
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

interface ChatWindowProps {
  chat: Chat;
  messages: ApiMessage[];
  isMobile: boolean;
  onBack: () => void;
  loading: boolean;
  onSend: (text: string) => Promise<void>;
  socketConnected: boolean;
  myUserId: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat, messages, isMobile, onBack, loading, onSend, socketConnected, myUserId,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when a new message is added
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading chat history...</div>;
  }

  const handleSend = async () => {
    const text = message.trim();
    if (!text || sending) return;
    
    setSending(true);
    setMessage(""); // clear input immediately
    
    try {
      await onSend(text);
    } catch (e) {
      console.error("send failed", e);
      setMessage(text); // restore text on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden flex-1 min-h-0">
      <div className="flex items-center px-4 md:px-8 py-4 border-b border-[#E5E5EA] bg-white relative">
        {isMobile && onBack && (
          <button className="mr-3 flex-shrink-0 md:hidden" onClick={onBack}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#6A1B9A" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <img src={chat.avatar || "/default-avatar.png"} alt="avatar"
          className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <span className="font-bold text-lg text-[#2C2C2E] truncate">{chat.name}</span>
          {!socketConnected && (
            <span className="text-xs text-red-500">Reconnecting…</span>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-4 bg-white min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-[#222] mt-20">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg: any) => {
            // Determine if the message is from the current user
            const mine = myUserId ? String(msg.senderId) === String(myUserId) : false;
            return (
              <div
                key={msg.id}
                className={`px-4 py-2 rounded-xl mb-2 max-w-[75%] break-words ${
                  mine
                    ? "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white ml-auto"
                    : "bg-[#F8EAEE] text-black"
                }`}
              >
                {msg.text}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[#E5E5EA] px-4 py-4 flex items-center gap-3 bg-white">
        <input
          type="text"
          className="flex-1 border-none outline-none text-base text-[#666668]"
          placeholder="Start typing..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          disabled={!socketConnected}
        />
        <button
          className="text-2xl text-[#6A1B9A] flex items-center justify-center w-10 h-10 disabled:opacity-40"
          type="button"
          onClick={handleSend}
          disabled={sending || !message.trim() || !socketConnected}
        >
          <img src={sendIcon} alt="send" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const TeamChats: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const isMobile = useIsMobile();
  const leftPanelRef = useRef<HTMLDivElement>(null!);
  const navigate = useNavigate();
  
  const { joinChat, sendChatMessage, connected } = useChatSocket(); 

  const dispatch = useDispatch<AppDispatch>();
  const { conversations, messages, loadingList, loadingChat, error } =
    useSelector((state: RootState) => state.chat);

  const token = localStorage.getItem("token");

  const myUserId = useMemo<string | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id ? String(parsed.id) : null; 
    } catch { return null; }
  }, []);

  const {
    isActive, steps, currentStep, next, completed, activeTraining,
    completedTrainings, startTraining,
  } = useWalkthroughStore();

  useEffect(() => {
    if (!token) return;
    const typeParam = activeTab === "All" ? undefined : activeTab.toLowerCase().slice(0, -1);
    dispatch(fetchConversations({ search: search || undefined, type: typeParam }));
  }, [dispatch, activeTab, search, token]);

  const handleSelectChat = useCallback((chat: Chat) => {
    if (!token) return;
    setSelectedChat(chat);
    
    // Join the socket room for this specific conversation
    joinChat(chat.id); 
    
    // Fetch historical messages
    dispatch(fetchChatDetails(chat.id));

    const step = steps[currentStep];
    if (isActive && step && step.selector === ".team-chat-left-panel") next();
  }, [dispatch, token, steps, currentStep, isActive, next, joinChat]);

  const handleBack = () => {
    setSelectedChat(null);
    dispatch(clearActiveChat());
  };

  // 🔥 THIS IS THE ACTUAL SEND MESSAGE LOGIC 🔥
  const handleSend = useCallback(async (text: string) => {
    if (!selectedChat) return;

    const optimisticId = `tmp-${crypto.randomUUID()}`;
    
    // 1. Immediately add the message to the screen (Optimistic UI)
    dispatch(appendOptimisticMessage({
      id: optimisticId,
      text,
      senderId: myUserId ?? "me",
      createdAt: new Date().toISOString(),
    }));

    try {
      // 2. Emit the message to the Socket.IO server
      const ack = await sendChatMessage(selectedChat.id, text);
      
      // 3. The server responds with the actual saved message data
      const confirmed = ack?.message ?? ack?.data ?? null;
      
      if (confirmed?.id) {
        // 4. Replace the temporary optimistic message with the confirmed one
        dispatch(confirmMessage({
          clientId: optimisticId,
          message: {
            id: confirmed.id,
            text: confirmed.message ?? confirmed.text ?? text,
            senderId: confirmed.senderId ?? confirmed.sender_id ?? myUserId ?? "me",
            createdAt: confirmed.createdAt ?? new Date().toISOString(),
          },
        }));
      }
    } catch (e) {
      console.error("send failed", e);
      // Note: You could dispatch a `removeMessage(optimisticId)` here to roll back if it fails
    }
  }, [selectedChat, myUserId, dispatch, sendChatMessage]);

  useEffect(() => {
    if (completed && activeTraining === "teamchat" && !completedTrainings.settings) {
      startTraining("settings", settingsTrainingSteps);
      navigate("/");
    }
  }, [completed, activeTraining, completedTrainings, startTraining, navigate]);

  const chatList = useMemo(() => conversations.map(mapApiToChat), [conversations]);

  return (
    <div className="p-0 md:p-6 flex flex-col h-screen overflow-hidden">
      <div className="bg-white lg:shadow-2xl sm:shadow px-0 md:px-6 flex flex-1 min-h-0 rounded-2xl overflow-hidden relative team-chat-full-panel">

        {/* Left Panel */}
        <div
          ref={leftPanelRef}
          className={`w-full md:w-[420px] border-r-0 md:border-r-2 border-[#E5E5EA] pr-0 md:pr-4 flex flex-col min-h-0 relative team-chat-left-panel ${
            isMobile && selectedChat ? "hidden" : ""
          }`}
        >
          <div className="my-4 px-4 md:px-0">
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg bg-[#FAFAFA] pl-10 pr-6 py-3 text-sm text-[#666668] focus:outline-none"
                placeholder="Search Team"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ boxShadow: "0px -3px 0px 0px #E5E5EA inset" }}
              />
              <img src={searchIcon} alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
            </div>
          </div>

          <div className="flex gap-2 mb-4 px-4 md:px-0 overflow-x-auto">
            {roles.map((role) => (
              <button
                key={role}
                className={`px-4 py-1 rounded-full font-medium text-base transition-all whitespace-nowrap ${
                  activeTab === role
                    ? "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white"
                    : "bg-[#F8EAEE] hover:bg-[#F8EAEE]"
                }`}
                onClick={() => { setActiveTab(role); handleBack(); }}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 h-full flex flex-col px-2 md:px-0">
            {!token ? (
              <div className="text-center py-10 text-red-500">Your session has expired. Please log in again.</div>
            ) : loadingList ? (
              <div className="text-center py-10 text-gray-500">Loading conversations...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                {error.toLowerCase().includes("token") || error.toLowerCase().includes("access denied")
                  ? "Your session has expired. Please log in again."
                  : error}
              </div>
            ) : chatList.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No conversations found.</div>
            ) : (
              chatList.map((chat) => (
                <ChatTile
                  key={chat.id}
                  chat={chat}
                  selected={!!selectedChat && selectedChat.id === chat.id}
                  onClick={() => handleSelectChat(chat)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={`flex-1 flex flex-col min-h-0 w-full ${isMobile && !selectedChat ? "hidden" : ""}`}>
          {!selectedChat ? (
            <div className="flex items-center justify-center h-full text-center text-lg text-[#2C2C2E]">
              <div>
                Send and Receive message without any interruption
                <br />
                Message your team for any assistance or help required
              </div>
            </div>
          ) : (
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              isMobile={isMobile}
              onBack={handleBack}
              loading={loadingChat}
              onSend={handleSend}
              socketConnected={connected}
              myUserId={myUserId}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default TeamChats;