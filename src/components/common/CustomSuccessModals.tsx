import React from "react";
import successIcon from "@/assets/order/success_icon_large.svg";

// ✅ Modal 1: Order Sent to Kitchen
interface KitchenSuccessModalProps {
  open: boolean;
  onClose: () => void;
  itemCount: number;
}

export const KitchenSuccessModal: React.FC<KitchenSuccessModalProps> = ({ open, onClose, itemCount }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl w-[400px] p-8 text-center shadow-2xl relative z-10">
        <div className="flex justify-center mb-4">
          <img src={successIcon} alt="success" className="w-20 h-20" />
        </div>
        <h2 className="text-xl font-bold text-[#00C853] mb-2">Order Sent to Kitchen</h2>
        <p className="text-sm text-gray-600 mb-8">
          {itemCount} items sent to preparation, Kitchen has received the order.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#00C853] text-white font-semibold hover:bg-[#00A844]">
            Continue
          </button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#00C853] text-[#00C853] font-semibold hover:bg-green-50">
            Undo
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Modal 2: Payment Received Successful
interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  method: string;
  reference?: string;
  onPrint: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ 
  open, onClose, amount, method, reference, onPrint 
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl w-[400px] p-8 text-center shadow-2xl relative z-10">
        <div className="flex justify-center mb-4">
          <img src={successIcon} alt="success" className="w-20 h-20" />
        </div>
        <h2 className="text-xl font-bold text-[#00C853] mb-2">Payment Received Successful !</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your Dish has been created and will be updated in the menu in couple of minutes
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-sm font-bold">{amount.toLocaleString()} XOF</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Method:</span>
            <span className="text-sm font-bold">{method}</span>
          </div>
          {reference && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Reference:</span>
              <span className="text-sm font-bold">{reference}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#00C853] text-white font-semibold hover:bg-[#00A844]">
            Start new Order
          </button>
          <button onClick={onPrint} className="flex-1 py-3 rounded-xl border border-[#00C853] text-[#00C853] font-semibold hover:bg-green-50">
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};