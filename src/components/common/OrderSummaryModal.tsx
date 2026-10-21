import React, { useState } from "react";
import type { OrderItem } from "@/types/order";
import downloadReceiptIcon from '@/assets/payment/receipt_download.svg'
import successReceiptIcon from '@/assets/payment/success_tick_receipt.svg'
import billIcon from '@/assets/payment/bill_icon.svg'
import { useWalkthroughStore } from '@/store/walkthroughStore';

interface OrderSummaryModalProps {
  open: boolean;
  onClose: () => void;
  order: {
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    orderId?: string;
    paymentType?: string;
    customerName?: string;
  };
  onUpdateItemQuantity: (itemId: string, newQty: number) => void;
  onChoosePaymentOption: () => void;
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  open,
  onClose,
  order,
  onUpdateItemQuantity,
  onChoosePaymentOption,
}) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const { isActive, steps, currentStep } = useWalkthroughStore();
  
  const isOnOrderSummaryStep = isActive && steps[currentStep]?.selector === '.order-summary-modal';

  if (!open) return null;

  const receipt = {
    orderNumber: order.orderId || '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    paymentType: order.paymentType || '',
    customerName: order.customerName || '',
    total: order.total,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100 pointer-events-auto">
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="order-summary-modal bg-white rounded-2xl w-[420px] max-w-full shadow-xl overflow-hidden relative z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 mb-4">
          <div className="text-2xl font-bold text-left">Order Summary</div>
          <button className="text-4xl font-bold " onClick={onClose}>&times;</button>
        </div>
        {!showReceipt ? (
          <>
            <div className="px-6 pb-2 mb-8 text-primary-gradient font-medium text-sm">Check your Order Summary</div>
            <div className="flex flex-col gap-4 px-6 pt-2 pb-4 flex-1">
              {order.items.map((item) => (
                <React.Fragment key={item.itemId}>
                  <div className="flex  justify-between flex-col border-b border-[#D32F2F] pb-2 mb-2">
                    <div className="flex  justify-between">
                      <div className="flex-1 text-left font-medium">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-7 h-7 rounded bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white text-lg font-bold flex items-center justify-center"
                          onClick={() => onUpdateItemQuantity(item.itemId, Math.max(1, (item.quantity || 1) - 1))}
                        >
                          –
                        </button>
                        <span className="w-6 text-center font-bold">{item.quantity || 1}</span>
                        <button
                          className="w-7 h-7 rounded bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white text-lg font-bold flex items-center justify-center"
                          onClick={() => onUpdateItemQuantity(item.itemId, (item.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="w-20 text-right font-semibold">{item.price.toLocaleString()} XOF</div>
                    </div>
                    {item.addOns && item.addOns.length > 0 && (
                      <>
                        <div className="flex justify-end items-center w-full pt-2">
                          <span className="text-[10px] font-semibold text-[#D32F2F] text-right">
                            {item.addOns.map((addon) => addon.name).join(", ")} 
                            {(() => {
                              const addOnTotal = item.addOns.reduce((sum, a) => sum + (a.price || 0), 0) * (item.quantity || 1);
                              return addOnTotal > 0 ? `+${addOnTotal.toLocaleString()} XOF` : '';
                            })()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="px-6 pb-2 mt-8">
              <div className="flex justify-between border-b border-[#D32F2F] pb-1 mb-1">
                <span className="text-base">Items Net Total</span>
                <span className="text-base font-semibold">{order.subtotal.toLocaleString()} XOF</span>
              </div>
              <div className="flex justify-between border-b border-[#D32F2F] pb-1 mb-1">
                <span className="text-base">Taxes</span>
                <span className="text-base font-semibold">{order.tax.toLocaleString()} XOF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">{order.total.toLocaleString()} XOF</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-center px-6 pb-6 pt-2">
              <button
                className="w-4/5 py-3 rounded-xl text-lg font-semibold text-white border bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] shadow-md hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                onClick={() => setShowReceipt(true)}
                disabled={isOnOrderSummaryStep}
                style={{ 
                  pointerEvents: isOnOrderSummaryStep ? 'none' : 'auto',
                  opacity: isOnOrderSummaryStep ? 0.6 : 1
                }}
              >
                <img src={billIcon}  alt="downloadReceiptIcon"/> Print Bill
              </button>
              <button
                className="choose-payment-btn w-4/5 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
                onClick={() => {
                  onChoosePaymentOption();
                  const walkthrough = useWalkthroughStore.getState();
                  const step = walkthrough.steps[walkthrough.currentStep];
                  if (walkthrough.isActive && step && step.selector === '.choose-payment-btn') {
                    walkthrough.next();
                  }
                }}
                disabled={isOnOrderSummaryStep}
                style={{ 
                  pointerEvents: isOnOrderSummaryStep ? 'none' : 'auto',
                  opacity: isOnOrderSummaryStep ? 0.6 : 1
                }}
              >
                Choose Payment Option
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-6 pt-2">
            <div className="flex flex-col items-center justify-center w-full">
              <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xs mx-auto flex flex-col items-center">
                <img src={successReceiptIcon}  alt="success"/> 
                <div className="text-xl font-semibold text-center mb-1">Payment Success!</div>
                <div className="text-sm text-center mb-4 text-[#474747]">Your payment has been successfully done.</div>
                <div className="text-center text-sm text-[#00000099] font-bold mb-1">Total Payment</div>
                <div className="text-center text-2xl font-bold mb-4">{receipt.total.toLocaleString()} XOF</div>
                <div className="grid grid-cols-2 gap-2 w-full mb-2">
                  <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left">
                    <div className="font-semibold text-[#00000099]">Order Number</div>
                    <div>{receipt.orderNumber}</div>
                  </div>
                  <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left">
                    <div className="font-semibold text-[#00000099]">Date & Time</div>
                    <div>{receipt.date}, {receipt.time}</div>
                  </div>
                  <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left">
                    <div className="font-semibold text-[#00000099]">Payment Type</div>
                    <div>{receipt.paymentType || '-'}</div>
                  </div>
                  <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left">
                    <div className="font-semibold text-[#00000099]">Customer Name</div>
                    <div>{receipt.customerName || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
            <button
              className=" mt-6 py-3 rounded-xl text-lg font-semibold text-black border-none transition-all flex items-center justify-center gap-2"
              onClick={() => window.print()}
            >
              <img src={downloadReceiptIcon} alt="downloadReceiptIcon" /> <span className="text-sm font-bold" >Print Receipt</span>
            </button>
            <button
              className="w-full mt-3 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
              onClick={() => setShowReceipt(false)}
            >
              Back to Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryModal;