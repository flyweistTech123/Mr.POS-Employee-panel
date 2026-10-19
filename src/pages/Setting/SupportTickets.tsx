import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSupportTicketsQuery } from "@/redux/api/settingsApi";
import Loader from "@/components/Loader";
import ongoingIconLight from "@/assets/setting/sms-tracking.svg";
import allIcon from "@/assets/setting/all-sms-gray.svg";
import resolvedIcon from "@/assets/setting/sms-star.svg";

const tabConfig = [
  { key: "all", label: "All Tickets", color: "text-[#007AFF]", icon: allIcon },
  { key: "ongoing", label: "On-Going", color: "text-[#F8A534]", icon: ongoingIconLight },
  { key: "resolved", label: "Resolved", color: "text-[#34C759]", icon: resolvedIcon },
];

const SupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useGetSupportTicketsQuery();
  
  const [filter, setFilter] = useState<"all" | "ongoing" | "resolved">("all");
  const [search, setSearch] = useState("");

  if (isLoading) return <div className="p-10"><Loader /></div>;
  if (isError || !response?.data) return <div className="p-10 text-red-500">Failed to load tickets.</div>;

  // Map API data to UI format
  const tickets = response.data.map((t: any) => ({
    id: t.support_ticket_id,
    ticketNumber: t.support_ticket_id,
    subject: t.SupportTicketType?.name || "Support Request",
    message: t.question,
    postedAt: new Date(t.CreateAt).toLocaleDateString(),
    businessName: t.Customer?.Name || t.CreateBy?.Name || "Unknown",
    avatar: "https://ui-avatars.com/api/?name=" + (t.Customer?.Name || "U"), // Fallback avatar
    status: t.Ticket_status === 'Solve' ? 'resolved' : t.Ticket_status === 'Process' ? 'ongoing' : 'all',
  }));

  // Filtering
  const filteredTickets = tickets.filter((t: any) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.message.toLowerCase().includes(search.toLowerCase()) || t.businessName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[#00000099] font-bold text-[32px]">
          Support Ticket &gt;
        </span>
        <span className="text-black font-bold text-[32px]">
          {tabConfig.find((t) => t.key === filter)?.label || "All Ticket"}
        </span>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search for ticket"
            className="w-full max-w-xs border rounded-md px-4 py-2 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] text-black/80 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 font-semibold text-lg pb-2 transition-all ${
              filter === tab.key ? `${tab.color}` : "text-[#BDBDBD]"
            }`}
            onClick={() => setFilter(tab.key as any)}
          >
            <img src={tab.icon} alt={tab.label} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="flex flex-col gap-6">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-10 text-[#BDBDBD]">No tickets found.</div>
        ) : (
          filteredTickets.map((ticket: any) => (
            <div
              key={ticket.id}
              className="rounded-2xl p-6 bg-gradient-to-br from-[#F8EAEE] via-[#F9F6FB] to-[#F8EAEE] shadow flex flex-col gap-2 relative"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    ticket.status === 'resolved' ? 'bg-[#34C759]' : ticket.status === 'ongoing' ? 'bg-[#F8A534]' : 'bg-[#007AFF]'
                  }`}></span>
                  <span className="text-black font-medium text-base">
                    Ticket# {ticket.ticketNumber}
                  </span>
                </div>
                <div className="text-black text-sm font-medium">
                  Posted at {ticket.postedAt}
                </div>
              </div>
              
              <div className="font-bold text-lg mb-1">{ticket.subject}</div>
              <div className="text-black/80 text-base mb-2 line-clamp-2">
                {ticket.message}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <img src={ticket.avatar} alt="avatar" className="w-7 h-7 rounded-full" />
                <span className="text-black/80 font-semibold text-base">
                  {ticket.businessName}
                </span>
                <span
                  className="ml-auto text-[#6A1B9A] font-semibold cursor-pointer"
                  onClick={() => navigate(`/settings/tickets/${ticket.ticketNumber}`)}
                >
                  Open Ticket
                </span>
              </div>

              <div className="absolute top-6 right-6 flex items-center gap-2">
                <button
                  className={`flex items-center gap-2 px-4 py-1 rounded-lg font-semibold text-white ${
                    ticket.status === 'resolved' ? 'bg-[#34C759]' : ticket.status === 'ongoing' ? 'bg-[#F8A534]' : 'bg-[#007AFF]'
                  }`}
                  style={{ minWidth: 110 }}
                >
                  <img src={ongoingIconLight} alt="status" className="w-5 h-5" />
                  {ticket.status === "resolved" ? "Resolved" : "On-Going"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SupportTickets;