/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import AddGuestDrawer from "./AddGuestDrawer"; // ✅ Import the new component

interface WaitlistDrawerProps {
  open: boolean;
  onClose: () => void;
}

const waitlistData = [
  { id: 1, name: "Rahul", persons: 2, time: "10 Min", phone: "9991999191" },
  { id: 2, name: "Rahul", persons: 2, time: "10 Min", phone: "9991999191" },
  { id: 3, name: "Rahul", persons: 2, time: "10 Min", phone: "9991999191" },
];

const WaitlistDrawer: React.FC<WaitlistDrawerProps> = ({ open, onClose }) => {
  // ✅ State to toggle between waitlist and adding a guest
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  if (!open) return null;

  // If adding a guest, render the AddGuestDrawer instead
  if (isAddingGuest) {
    return <AddGuestDrawer open={open} onClose={() => setIsAddingGuest(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-[360px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Waitlist ({waitlistData.length})</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {waitlistData.map((item) => (
            <div key={item.id} className="border border-pink-200 bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Name: <span className="font-bold text-gray-800">{item.name}</span></span>
                <span className="text-xs font-semibold text-[#8E24AA] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Persons: {item.persons}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">⏱ Waiting: {item.time}</span>
                <span className="flex items-center gap-1">📞 Contact No: {item.phone}</span>
              </div>
              <button className="w-full py-2 bg-[#00C853] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#00A844] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                Notify
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          {/* ✅ Wired the Add Guest button to toggle the state */}
          <button 
            onClick={() => setIsAddingGuest(true)}
            className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Add Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistDrawer;