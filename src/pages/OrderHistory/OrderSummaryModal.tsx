// src/pages/OrderHistory/OrderSummaryModal.tsx
import React from 'react';
import { IoCloseOutline, IoPrintOutline } from 'react-icons/io5';

interface OrderSummaryModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
  onUpdateItemQuantity: (itemId: string | number, newQty: number) => void;
  onChoosePaymentOption: () => void;
}

export const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  open,
  onClose,
  order,
  onUpdateItemQuantity,
  onChoosePaymentOption,
}) => {
  if (!open) return null;

  const handlePrint = () => {
    window.print(); // Basic print functionality
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-[20px] w-full max-w-[420px] shadow-xl flex flex-col relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[20px] font-bold text-gray-900">Order Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-black transition-colors"
          >
            <IoCloseOutline size={28} strokeWidth={2} />
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-6 mb-6">
          <p className="text-[13px] font-medium text-[#C2185B]">
            Check your Order Summary
          </p>
        </div>

        {/* Items List */}
        <div className="px-6 flex-grow overflow-y-auto max-h-[40vh] custom-scrollbar">
          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-gray-800 flex-1 truncate pr-2">
                  {item.name}
                </span>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mx-2">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        onUpdateItemQuantity(item.itemId, item.quantity - 1);
                      }
                    }}
                    className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] bg-gradient-to-br from-[#9C27B0] to-[#E91E63] text-white text-[16px] font-medium leading-none pb-0.5"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold text-gray-900 text-[14px]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateItemQuantity(item.itemId, item.quantity + 1)}
                    className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] bg-gradient-to-br from-[#9C27B0] to-[#E91E63] text-white text-[16px] font-medium leading-none pb-0.5"
                  >
                    +
                  </button>
                </div>

                <span className="font-semibold text-gray-500 w-[80px] text-right">
                  {(item.price * item.quantity).toLocaleString()} XOF
                </span>
              </div>
            ))}
          </div>

          {/* Divider Line */}
          <div className="h-[1px] w-full bg-[#F48FB1] mt-6 mb-4 opacity-50"></div>
        </div>

        {/* Totals Section */}
        <div className="px-6 pb-6">
          <div className="flex justify-between text-[13px] font-semibold text-gray-800 mb-2">
            <span>Items Net Total</span>
            <span>{(order.subtotal || 0).toLocaleString()} XOF</span>
          </div>
          <div className="flex justify-between text-[13px] font-semibold text-gray-800 mb-2">
            <span>Taxes</span>
            <span>{(order.tax || 0).toLocaleString()} XOF</span>
          </div>
          
          <div className="h-[1px] w-full bg-[#F48FB1] my-3 opacity-50"></div>
          
          <div className="flex justify-between text-[14px] font-bold text-gray-900 mb-8">
            <span>Total</span>
            <span>{(order.total || 0).toLocaleString()} XOF</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-white font-semibold text-[14px] bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] hover:opacity-90 transition-opacity"
            >
              <IoPrintOutline size={18} />
              Print Bill
            </button>
            <button
              onClick={onChoosePaymentOption}
              className="w-full py-3.5 rounded-[10px] text-white font-semibold text-[14px] bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] hover:opacity-90 transition-opacity"
            >
              Choose Payment Option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryModal;