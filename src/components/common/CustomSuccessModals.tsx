/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import successIcon from "@/assets/order/success_icon_large.svg";

// ✅ Kitchen Success Modal (Already existed, kept for reference)
export const KitchenSuccessModal = ({ open, onClose, itemCount }: { open: boolean; onClose: () => void; itemCount: number }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl w-[400px] p-8 text-center shadow-2xl relative z-10">
        <div className="flex justify-center mb-4">
          <img src={successIcon} alt="success" className="w-20 h-20" />
        </div>
        <h2 className="text-xl font-bold text-[#00C853] mb-2">Order Sent to Kitchen</h2>
        <p className="text-sm text-gray-600 mb-8">{itemCount} items sent to preparation.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#00C853] text-white font-semibold">Continue</button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#00C853] text-[#00C853] font-semibold">Undo</button>
        </div>
      </div>
    </div>
  );
};

// ✅ NEW: Exact Payment Success Modal from your screenshot
export const PaymentSuccessModal = ({ 
  open, 
  onClose, 
  amount, 
  method, 
  reference 
}: { 
  open: boolean; 
  onClose: () => void; 
  amount: number; 
  method: string; 
  reference: string; 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl w-[420px] p-8 text-center shadow-2xl relative z-10">
        <div className="flex justify-center mb-4">
          <img src={successIcon} alt="success" className="w-20 h-20" />
        </div>
        
        <h2 className="text-xl font-bold text-[#00C853] mb-2">Payment Received Successful !</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your Dish has been created and will be updated in the menu in couple of minutes
        </p>

        <div className="flex flex-col items-center gap-1 mb-8">
          <div className="text-sm text-gray-800">
            Amount: <span className="font-bold">{amount.toLocaleString()} XOF</span>
          </div>
          <div className="text-sm text-gray-800">
            Method: <span className="font-bold">{method}</span>
          </div>
          <div className="text-sm text-gray-800">
            Reference: <span className="font-bold">{reference}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#00C853] text-white font-semibold hover:bg-[#00A844] transition-colors">
            Start new Order
          </button>
          <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl border border-[#00C853] text-[#00C853] font-semibold hover:bg-green-50 transition-colors">
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};