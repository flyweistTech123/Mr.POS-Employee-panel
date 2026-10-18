import React, { useMemo, useState, useEffect } from "react";
import searchIcon from "@/assets/chats/searchIcon.svg";
import sendIcon from "@/assets/chats/sendIcon.svg";
import mentionIcon from "@/assets/chats/mentionIcon.svg";
import cameraIcon from "@/assets/chats/cameraIcon.svg";
import customerServiceIcon from "@/assets/setting/customer-service.svg";
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { settingsTrainingSteps } from '@/walkthrough/steps';
import { useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store'; 
import { 
  fetchConversations, 
  fetchChatDetails, 
  clearActiveChat 
} from '@/redux/slice/chatSlice';
import type { ApiConversation } from '@/api/chatApi';

// --- Your existing Types ---
interface User { id: string; name: string; role: string; avatar: string; lastSeen: string; type: "individual"; mobile?: string; }
interface Group { id: string; name: string; avatar: string; memberIds: string[]; type: "group"; lastMessage: { text: string; time: string; senderId: string; unread: boolean; }; }
type Chat = User | Group;

const roles = ["All", "Waiters", "Chefs", "Managers"];

const mapApiToChat = (apiChat: ApiConversation): Chat => {
  if (apiChat.type === "group") {
    return {
      id: apiChat.id, name: apiChat.name, avatar: apiChat.avatar || "", memberIds: apiChat.memberIds || [], type: "group",
      lastMessage: apiChat.lastMessage || { text: "", time: "", senderId: "", unread: false },
    };
  }
  return {
    id: apiChat.id, name: apiChat.name, role: apiChat.role || "Member", avatar: apiChat.avatar || "", lastSeen: apiChat.lastSeen || "", type: "individual",
  };
};

const ChatTile = ({ chat, selected, onClick }: { chat: Chat; selected: boolean; onClick: () => void; }) => {
  const unreadCount = chat.type === "group" && chat.lastMessage.unread ? 1 : 0;
  return (
    <div className={`flex items-center gap-3 px-2 py-3 cursor-pointer rounded-lg transition-all ${selected ? "bg-[#F8EAEE]" : "hover:bg-[#F8EAEE]"}`} onClick={onClick}>
      <img src={chat.avatar || "/default-avatar.png"} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base truncate text-[#2C2C2E]">{chat.name}</div>
        <div className="truncate text-sm font-normal text-[#666668]">{chat.type === "group" ? chat.lastMessage.text : "Tap to view chat"}</div>
      </div>
      <div className="flex flex-col items-end min-w-[40px]">
        {unreadCount > 0 && <div className="mt-1 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</div>}
        <div className="text-xs text-[#BDBDBD] font-semibold">{chat.type === "group" ? chat.lastMessage.time : ""}</div>
      </div>
    </div>
  );
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

// ChatWindow now receives messages via props from the Parent component
const ChatWindow = ({ chat, messages, isMobile, onBack, leftPanelRef, loading }: any) => {
  const [message, setMessage] = useState("");

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading chat details...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden flex-1 min-h-0">
      <div className="flex items-center px-4 md:px-8 py-4 border-b border-[#E5E5EA] bg-white relative">
        {isMobile && onBack && (
          <button className="mr-3 flex-shrink-0 md:hidden" onClick={onBack}>
             <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
        <img src={chat.avatar || "/default-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <span className="font-bold text-lg text-[#2C2C2E] truncate">{chat.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 bg-white min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-[#222] mt-20">No messages yet.</div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className="bg-[#F8EAEE] text-black px-4 py-2 rounded-xl mb-2">{msg.text}</div>
          ))
        )}
      </div>

      <div className="border-t border-[#E5E5EA] px-4 py-4 flex items-center gap-3 bg-white">
         <input type="text" className="flex-1 border-none outline-none text-base text-[#666668]" placeholder="Start typing..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="text-2xl text-[#6A1B9A] flex items-center justify-center w-10 h-10" type="button"><img src={sendIcon} alt="send" className="w-6 h-6" /></button>
      </div>
    </div>
  );
};

const TeamChats: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  const isMobile = useIsMobile();
  const leftPanelRef = React.useRef<HTMLDivElement>(null!);
  const navigate = useNavigate();
  
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, messages, loadingList, loadingChat, error } = useSelector((state: RootState) => state.chat);
  
  const { isActive, steps, currentStep, next, completed, activeTraining, completedTrainings, startTraining } = useWalkthroughStore();

  // Fetch conversations when tab or search changes
  useEffect(() => {
    const typeParam = activeTab === "All" ? undefined : activeTab.toLowerCase().slice(0, -1); 
    dispatch(fetchConversations({ search: search || undefined, type: typeParam }));
  }, [dispatch, activeTab, search]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    dispatch(fetchChatDetails(chat.id)); // Fetch messages for this specific chat
    
    const step = steps[currentStep];
    if (isActive && step && step.selector === '.team-chat-left-panel') {
      next();
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
    dispatch(clearActiveChat());
  };

  React.useEffect(() => {
    if (completed && activeTraining === 'teamchat' && !completedTrainings.settings) {
      startTraining('settings', settingsTrainingSteps);
      navigate('/');
    }
  }, [completed, activeTraining, completedTrainings, startTraining, navigate]);

  const chatList = useMemo(() => conversations.map(mapApiToChat), [conversations]);

  return (
    <div className="p-0 md:p-6 flex flex-col h-screen overflow-hidden">
      {/* Titles ... */}
      <div className="bg-white lg:shadow-2xl sm:shadow px-0 md:px-6 flex flex-1 min-h-0 rounded-2xl overflow-hidden relative team-chat-full-panel">
        
        {/* Left Panel */}
        <div ref={leftPanelRef} className={`w-full md:w-[420px] border-r-0 md:border-r-2 border-[#E5E5EA] pr-0 md:pr-4 flex flex-col min-h-0 relative team-chat-left-panel ${isMobile && selectedChat ? " hidden" : ""}`}>
          <div className="my-4 px-4 md:px-0">
            <div className="relative">
              <input type="text" className="w-full rounded-lg bg-[#FAFAFA] pl-10 pr-6 py-3 text-sm text-[#666668] focus:outline-none" placeholder="Search Team" value={search} onChange={(e) => setSearch(e.target.value)} style={{ boxShadow: "0px -3px 0px 0px #E5E5EA inset" }} />
              <img src={searchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
            </div>
          </div>

          <div className="flex gap-2 mb-4 px-4 md:px-0 overflow-x-auto">
            {roles.map((role) => (
              <button key={role} className={`px-4 py-1 rounded-full font-medium text-base transition-all whitespace-nowrap ${activeTab === role ? "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white" : "bg-[#F8EAEE] hover:bg-[#F8EAEE]"}`} onClick={() => { setActiveTab(role); handleBack(); }}>
                {role}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 h-full flex flex-col px-2 md:px-0">
            {loadingList ? (
              <div className="text-center py-10 text-gray-500">Loading conversations...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : chatList.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No conversations found.</div>
            ) : (
              chatList.map((chat) => (
                <ChatTile key={chat.id} chat={chat} selected={!!selectedChat && selectedChat.id === chat.id} onClick={() => handleSelectChat(chat)} />
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={`flex-1 flex flex-col min-h-0 w-full ${isMobile && !selectedChat ? ' hidden' : ''}`}>
          {!selectedChat ? (
            <div className="flex items-center justify-center h-full text-center text-lg text-[#2C2C2E]">
              <div>Send and Receive message without any interruption<br />Message your team for any assistance or help required</div>
            </div>
          ) : (
            <ChatWindow 
              chat={selectedChat} 
              messages={messages} // <-- Pass messages from Redux here
              isMobile={isMobile} 
              onBack={handleBack} 
              leftPanelRef={leftPanelRef} 
              loading={loadingChat} // <-- Pass loading state from Redux here
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default TeamChats;