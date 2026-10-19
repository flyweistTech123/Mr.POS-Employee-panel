import { useState } from "react";
import { useOrderStore } from "@/store/zustandStores";
import printIcon from "@/assets/order/Print.svg";
import type { Order } from "@/types/order";
import PrintBillModal from "@/components/common/PrintBillModal";

const Invoice = ({ onBack }: { onBack?: () => void }) => {
  const { orders, fetchOrders } = useOrderStore();
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState("Today");
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  return (
    <div className="p-8 min-h-screen bg-[#F8F9FB] font-sans">
      <div className="flex items-center justify-between gap-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-700 whitespace-nowrap">
          <span className="cursor-pointer" onClick={onBack}>
            Order History's{" "}
          </span>
          <span className="font-bold text-black">&gt; Invoices</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div 
              className="bg-white border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 cursor-pointer min-w-[100px] justify-between shadow-sm"
              onClick={() => setShowDateDropdown((v) => !v)}
            >
              <span className="text-[12px] font-semibold text-gray-700">
                {dateFilter}
              </span>
              <svg
                className="w-3.5 h-3.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 p-1 border border-gray-100">
                {["Today", "Yesterday", "This week", "This Month"].map(
                  (option) => (
                    <button
                      key={option}
                      className="block w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 rounded text-gray-700 font-medium"
                      onClick={() => {
                        setDateFilter(option);
                        setShowDateDropdown(false);
                        fetchOrders({ dateRange: option });
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{
          background: "#ffffff",
          borderColor: "#E5E7EB",
        }}
      >
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr
              className="text-[#6B7280] text-[12px] uppercase tracking-wider bg-[#F9FAFB]"
            >
              <th className="py-4 px-6 font-semibold">S no</th>
              <th className="py-4 px-6 font-semibold">Invoice id</th>
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Order Type</th>
              <th className="py-4 px-6 font-semibold">Total amount</th>
              <th className="py-4 px-6 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr
                key={order.orderId || idx}
                className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 text-[13px] font-medium text-gray-900">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">
                  {order.orderId}
                </td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">
                  {order?.createdAt
                    ? new Date(order?.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">
                  {order.orderType || "Dine in"}
                </td>
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">
                  {order.pricingSummary?.totalAmount?.toLocaleString() || ""}{" "}
                  XOF
                </td>
                <td className="py-4 px-6 text-[13px] font-medium">
                  <button 
                    className="flex items-center gap-2 text-gray-600 hover:text-[#6A1B9A] font-semibold transition-colors" 
                    onClick={() => setPrintOrder(order)}
                  >
                    <img
                      src={printIcon}
                      alt="print"
                      className="w-4 h-4 opacity-70"
                    />{" "}
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PrintBillModal open={!!printOrder} onClose={() => setPrintOrder(null)} order={printOrder} />
    </div>
  );
};

export default Invoice;