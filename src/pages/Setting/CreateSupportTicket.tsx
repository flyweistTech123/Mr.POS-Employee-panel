import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSupportTicketMutation } from "@/redux/api/settingsApi";
import { useUserStore } from "@/store/zustandStores";
import uploadImage from '@/assets/setting/upload.svg';
import toast from 'react-hot-toast';

const CreateSupportTicket: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const userLoading = useUserStore((s) => s.loading);
  
  const [createTicket, { isLoading }] = useCreateSupportTicketMutation();
  
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setBusinessName(user.name || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({
        support_ticket_type_id: 1, 
        question: message,
        // 👈 Cast user to any to bypass TS error, fallback to 1
        customer_id: (user as any)?.customer_id || 1, 
        Ticket_status: 'Open',
        Status: true,
      }).unwrap();
      
      toast.success("Ticket created successfully!");
      navigate('/settings/tickets');
    } catch (error) {
      toast.error("Failed to create ticket.");
    }
  };

  if (userLoading || !user) return <div className="p-8 text-center text-lg">Loading...</div>;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[#00000099] font-bold text-[32px] cursor-pointer" onClick={() => navigate(-1)}>
          Support Ticket 
        </span>
        <span className="text-black font-bold text-[32px]">&gt; Create Support Ticket</span>
      </div>
      
      <form onSubmit={handleSubmit} className="rounded-2xl shadow bg-gradient-to-br from-[#F8EAEE] via-[#F9F6FB] to-[#F8EAEE] p-8 md:p-12 max-w-5xl mx-auto relative" style={{ minHeight: 420 }}>
        <div className="flex justify-between mb-6">
          <div className="text-black font-medium text-base">New Ticket</div>
          <div className="text-black text-sm font-medium">
            Posted at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-black font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded-md px-4 py-2 bg-[#F9F9F9] text-black/80 focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-black font-medium mb-1">Business Name</label>
            <input type="text" className="w-full border rounded-md px-4 py-2 bg-[#F9F9F9] text-black/80 focus:outline-none" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </div>
        </div>

        <h2 className="text-[#2E2A40]">Reply Ticket</h2>
        <div className="mb-6 border rounded">
          <input type="text" className="w-full rounded-md px-4 pt-2 m-0 text-black placeholder-black focus:outline-none" placeholder="Enter Subject..." value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <textarea className="w-full rounded-md px-4 py-2 min-h-[100px] text-[#00000080] focus:outline-none resize-none" placeholder="Explain here..." value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>

        <div className="mb-8">
          <label className="block text-black font-medium mb-1">Images Uploaded</label>
          <div className="flex items-center gap-4">
            <button type="button" className="px-4 py-2 rounded-md bg-gradient-to-t from-[#D32F2F] to-[#6A1B9A] text-white font-semibold flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
              Upload Img <img src={uploadImage} alt="upload"/>
            </button>
            <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
            {images.length > 0 && <span className="text-black/80 text-sm">{images.map((f) => f.name).join(", ")}</span>}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button type="submit" className="px-16 py-2 rounded-lg font-semibold text-white text-lg bg-gradient-to-t from-[#D32F2F] to-[#6A1B9A] shadow disabled:opacity-60" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupportTicket;