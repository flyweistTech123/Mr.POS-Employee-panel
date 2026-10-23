import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useReactToPrint, type UseReactToPrintOptions } from "react-to-print";
import type { Order } from "@/types/order";
import successReceiptIcon from '@/assets/payment/success_tick_receipt.svg';
import downloadReceiptIcon from '@/assets/payment/receipt_download.svg';

interface PrintBillModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const BillContent: React.FC<{ order: Order | null; forPrint?: boolean }> = ({ order, forPrint }) => {
  if (!order) return null;
  
  const receipt = {
    orderNumber: order.orderId,
    date: new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    
    // Safely extract the payment method string
    paymentType: typeof order.paymentDetails?.method === 'object' 
      ? order.paymentDetails?.method?.option 
      : order.paymentDetails?.method || '',
      
    customerName: order.customerInfo?.name || order.customerInfo?.Name || '',
    total: order.pricingSummary?.totalAmount || 0,
  };

  return (
    <div className={forPrint ? "p-6 w-full max-w-xs mx-auto" : "bg-white rounded-2xl shadow p-6 w-full max-w-xs mx-auto flex flex-col items-center print:shadow-none print:rounded-none print:max-w-full print:p-2"} style={forPrint ? { background: 'white', color: 'black' } : {}}>
      <img src={successReceiptIcon} alt="success" className="mb-3" />
      <div className="text-xl font-semibold text-center mb-1">Bill Summary</div>
      <div className="text-center text-sm text-[#00000099] font-bold mb-1">Total Payment</div>
      <div className="text-center text-2xl font-bold mb-4">{receipt.total.toLocaleString()} XOF</div>
      <div className="grid grid-cols-2 gap-2 w-full mb-2">
        <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left print:bg-white print:p-1">
          <div className="font-semibold text-[#00000099]">Order Number</div>
          <div>{receipt.orderNumber}</div>
        </div>
        <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left print:bg-white print:p-1">
          <div className="font-semibold text-[#00000099]">Date & Time</div>
          <div>{receipt.date}, {receipt.time}</div>
        </div>
        <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left print:bg-white print:p-1">
          <div className="font-semibold text-[#00000099]">Payment Type</div>
          <div>{receipt.paymentType || '-'}</div>
        </div>
        <div className="bg-[#F6F6F6] rounded-lg p-2 text-xs text-left print:bg-white print:p-1">
          <div className="font-semibold text-[#00000099]">Customer Name</div>
          <div>{receipt.customerName || '-'}</div>
        </div>
      </div>
      <div className="w-full mt-4">
        <div className="font-bold mb-2 text-left">Items</div>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.itemId} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * (item.quantity || 1)).toLocaleString()} XOF</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full mt-4">
        <div className="flex justify-between border-b border-[#D32F2F] pb-1 mb-1">
          <span className="text-base">Items Net Total</span>
          <span className="text-base font-semibold">{(order.pricingSummary?.subtotal || 0).toLocaleString()} XOF</span>
        </div>
        <div className="flex justify-between border-b border-[#D32F2F] pb-1 mb-1">
          <span className="text-base">Taxes</span>
          <span className="text-base font-semibold">{(order.pricingSummary?.tax || 0).toLocaleString()} XOF</span>
        </div>
        {(order.pricingSummary?.discount || 0) > 0 && (
          <div className="flex justify-between border-b border-[#D32F2F] pb-1 mb-1">
            <span className="text-base">Discount</span>
            <span className="text-base font-semibold">-{(order.pricingSummary?.discount || 0).toLocaleString()} XOF</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">{(order.pricingSummary?.totalAmount || 0).toLocaleString()} XOF</span>
        </div>
      </div>
    </div>
  );
};

const PrintBillModal: React.FC<PrintBillModalProps> = ({ open, onClose, order }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [printRootReady, setPrintRootReady] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: order?.orderId ? `Bill_${order.orderId}` : 'Bill',
    removeAfterPrint: true,
  } as UseReactToPrintOptions);

  // Always render the hidden print node at the end of the body
  useEffect(() => {
    let ready = false;
    if (!document.getElementById('hidden-print-root')) {
      const div = document.createElement('div');
      div.id = 'hidden-print-root';
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.top = '0';
      document.body.appendChild(div);
      ready = true;
    } else {
      ready = true;
    }
    if (ready) setPrintRootReady(true);
  }, []);

  return (
    <>
      {/* Modal Preview */}
      {open && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100 pointer-events-auto print:static print:bg-white">
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-sm print:hidden"
            onClick={onClose}
          />
          <div className="bg-white rounded-2xl w-[420px] max-w-full shadow-xl overflow-hidden relative z-10 flex flex-col print:rounded-none print:shadow-none print:w-full print:max-w-full">
            <div className="flex flex-col items-center justify-center flex-1 px-6 pb-6 pt-2">
              <div className="flex flex-col items-center justify-center w-full">
                <BillContent order={order} />
              </div>
              <button
                className="mt-6 py-3 rounded-xl text-lg font-semibold text-black border-none transition-all flex items-center justify-center gap-2 print:hidden"
                onClick={handlePrint}
              >
                <img src={downloadReceiptIcon} alt="downloadReceiptIcon" /> <span className="text-sm font-bold">Print Bill</span>
              </button>
              <button
                className="w-full mt-3 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all print:hidden"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden Print Node (always mounted) */}
      {printRootReady && document.getElementById('hidden-print-root') && createPortal(
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <BillContent order={order} forPrint />
          </div>
        </div>,
        document.getElementById('hidden-print-root') as HTMLElement
      )}
    </>
  );
};

export default PrintBillModal;