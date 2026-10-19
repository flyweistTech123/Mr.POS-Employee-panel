import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSupportTicketByIdQuery, useGetSupportTicketRepliesQuery, useCreateSupportTicketReplyMutation } from '@/redux/api/settingsApi';
import { useUserStore } from '@/store/zustandStores';
import AddResponseForm from './AddResponseModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import headphoneIcon from '@/assets/setting/customer-service.svg';
import userIcon from '@/assets/profile/user.svg';

const SupportTicketDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketId = Number(id);
  const user = useUserStore((s) => s.user);

  const { data: ticketData, isLoading: loadingTicket } = useGetSupportTicketByIdQuery(ticketId);
  const { data: repliesData, isLoading: loadingReplies } = useGetSupportTicketRepliesQuery(ticketId);
  const [createReply, { isLoading: isSending }] = useCreateSupportTicketReplyMutation();

  const [showAddResponse, setShowAddResponse] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (loadingTicket || loadingReplies) return <div className="p-8"><Loader /></div>;
  if (!ticketData?.data) return <div className="p-8 text-center">Ticket not found.</div>;

  const ticket = ticketData.data;
  const replies = repliesData?.data || [];

  const conversation = [
    {
      id: 'original',
      sender: 'employee',
      name: ticket.Customer?.Name || ticket.CreateBy?.Name || 'User',
      message: ticket.question,
      icon: userIcon,
      time: new Date(ticket.CreateAt).toLocaleString(),
    },
    ...replies.map((reply: any) => ({
      id: reply._id,
      sender: 'admin',
      name: reply.Employee?.Name || 'Support Team',
      message: reply.reply,
      icon: headphoneIcon,
      time: new Date(reply.CreateAt).toLocaleString(),
    }))
  ];

  const handleSubmitResponse = async (data: { message: string; images: File[] }) => {
    try {
      await createReply({
        support_ticket_id: ticketId,
        reply: data.message,
        // 👈 Fixed: Cast user to any to bypass TS error, fallback to 25
        employee_id: (user as any)?.employee_id || 25, 
        Ticket_status: 'Process',
        Status: true,
      }).unwrap();
      
      setShowAddResponse(false);
      setShowSuccess(true);
    } catch (error) {
      toast.error("Failed to add response.");
    }
  };

  const handleSuccessButton = () => {
    setShowSuccess(false);
    navigate('/settings/tickets');
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {showAddResponse ? (
        <div className="max-w-2xl mx-auto">
          <AddResponseForm
            onClose={() => setShowAddResponse(false)}
            onSubmit={handleSubmitResponse}
            ticketId={String(ticket.support_ticket_id)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[#00000099] font-bold text-[32px]">Support Ticket &gt;</span>
            <span className="text-black font-bold text-[32px]">Ticket #{ticket.support_ticket_id}</span>
          </div>
          
          <div className="rounded-2xl bg-[#F8EAEE] p-8 flex flex-col md:flex-row md:justify-between mb-8">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="font-bold">Requestor</span>
                <span className="font-bold">{ticket.Customer?.Name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Subject</span>
                <span className="font-bold">{ticket.SupportTicketType?.name || 'Support Request'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Created on</span>
                <span className="font-bold">{new Date(ticket.CreateAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Ticket Status</span>
                <span className={`font-bold ${ticket.Ticket_status === 'Solve' ? 'text-[#34C759]' : 'text-[#F8A534]'}`}>
                  {ticket.Ticket_status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {conversation.map((msg) => (
              <div key={msg.id} className={`w-full rounded-xl border ${msg.sender === 'admin' ? 'bg-[#F8EAEE]' : 'bg-white'} p-4 flex flex-col gap-2 shadow-sm`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img src={msg.icon} alt="icon" className="w-5 h-5 rounded-full" />
                    <span className="font-bold text-base">{msg.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <div className="text-black font-normal text-base whitespace-pre-wrap">{msg.message}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button className="px-12 py-2 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-[#D32F2F] to-[#6A1B9A] shadow hover:opacity-90 transition-opacity" onClick={() => setShowAddResponse(true)}>
              Add Response
            </button>
          </div>
        </>
      )}

      <SuccessModal
        open={showSuccess}
        title="Ticket Response Added Successfully !"
        subtitle="Your response has been sent to the customer."
        buttonText="View All Tickets"
        onButtonClick={handleSuccessButton}
      />
    </div>
  );
};

export default SupportTicketDetail;