/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface ReserveTableModalProps {
  open: boolean;
  onClose: () => void;
  tables: any[];
}

const TableCard = ({ label }: { label: string }) => (
  <div className="relative flex flex-col items-center justify-center w-[120px] h-[90px] bg-[#FDF0F4] rounded-2xl border border-pink-100">
    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
      <svg width="100" height="70" viewBox="0 0 120 90" fill="none"><rect x="20" y="10" width="80" height="50" rx="8" fill="#A579D1" /><rect x="5" y="20" width="10" height="30" rx="4" fill="#A579D1" /><rect x="105" y="20" width="10" height="30" rx="4" fill="#A579D1" /><rect x="30" y="65" width="60" height="10" rx="4" fill="#A579D1" /></svg>
    </div>
    <div className="z-10 w-10 h-10 rounded-full bg-gradient-to-r from-[#8E24AA] to-[#D32F2F] flex items-center justify-center text-white font-bold text-sm shadow-md">
      {label}
    </div>
  </div>
);

const ReserveTableModal: React.FC<ReserveTableModalProps> = ({ open, onClose, tables }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-[900px] max-w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Reserve Tabel</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Coustmise Tabel</h3>
          
          {/* Form Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <input type="text" placeholder="Person Name" className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full" />
            <select className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full text-gray-500">
              <option>Contact No</option>
            </select>
            <div className="relative">
              <input type="text" placeholder="DD-MM-YY" className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full" />
              <span className="absolute right-4 top-3.5 text-gray-400">📅</span>
            </div>

            <select className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full text-gray-500">
              <option>Select Time</option>
            </select>
            <select className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full text-gray-500">
              <option>No of person</option>
            </select>
            <select className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full text-gray-500">
              <option>Select Floor</option>
            </select>
          </div>

          {/* Available Tables */}
          <h3 className="text-base font-bold mb-4">Available tables to merge on your inputs</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {tables.slice(0, 5).map((t) => (
              <TableCard key={t.Table_id} label={`t-0${t.Table_id}`} />
            ))}
            {/* Fallback cards if no tables */}
            {tables.length === 0 && (
               <>
                 <TableCard label="t-01" />
                 <TableCard label="t-02" />
                 <TableCard label="t-3" />
                 <TableCard label="t-02" />
                 <TableCard label="t-3" />
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserveTableModal;