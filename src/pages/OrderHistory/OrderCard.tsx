// src/pages/OrderHistory/OrderCard.tsx
import { MdRestaurantMenu } from 'react-icons/md';
import { FiClock, FiCheck } from 'react-icons/fi';

const getMinutesAgo = (isoString: string | undefined) => {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  return Math.max(1, Math.round(diffMs / 60000));
};

const StatusBadge = ({ order }: { order: any }) => {
  const minutes = getMinutesAgo(order.CreateAt);
  const status = order.order_status || order.Order_Status;

  if (status === 'Preparing' || status === 'In_Kitchen' || status === 'Cooking') {
    return (
      <div className="bg-[#FFF3E0] text-[#FF9800] px-2 py-1 rounded-[6px] text-[10px] font-bold flex flex-col items-center min-w-[75px] leading-tight border border-[#FFE0B2]">
        <div className="flex items-center gap-1">
          <span>{status === 'In_Kitchen' ? 'In Kitchen' : status}</span>
          <FiClock className="w-2.5 h-2.5" />
        </div>
        <span className="text-[#FF9800] text-[8px] font-semibold">
          Started {minutes} min ago
        </span>
      </div>
    );
  }

  if (status === 'Served' || status === 'Ready' || status === 'Completed') {
    return (
      <div className="bg-[#E8F5E9] text-[#4CAF50] px-2 py-1.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1 min-w-[75px] justify-center">
        <span>{status === 'Completed' ? 'Served' : status}</span>
        <FiCheck className="w-3 h-3" strokeWidth={3} />
      </div>
    );
  }

  if (status === 'Cancelled') {
    return (
      <div className="bg-[#FFEBEE] text-[#F44336] px-2 py-1 rounded-[6px] text-[10px] font-bold flex flex-col items-center min-w-[75px] leading-tight border border-[#FFCDD2]">
        <span>Cancelled</span>
        <span className="text-[#F44336] text-[8px] font-semibold">
          Started {minutes} min ago
        </span>
      </div>
    );
  }

  return (
    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-[10px] font-bold">
      {status}
    </span>
  );
};

const OrderCard = ({ order, onClick }: { order: any; onClick?: () => void }) => {
  const items = order.items || [];
  const taxAmount = order.Tax || 0;
  const subTotal = order.SubTotal || 0;
  const total = order.Total || 0;
  const tableType = order.Dining_Option || 'Dine-in';
  
  // Calculate tax percentage for display
  const taxPercentage = subTotal > 0 ? ((taxAmount / subTotal) * 100).toFixed(0) : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white flex flex-col rounded-[16px] border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden w-full"
    >
      {/* ===== Header Section ===== */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2 bg-gradient-to-b from-[#F8F0F5] to-white">
        {/* Left: Order Info */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <MdRestaurantMenu className="w-4 h-4 text-[#3B82F6]" />
            <span className="font-bold text-[15px] text-black">
              # {order.POS_Order_id}
            </span>
          </div>
          <div className="text-[13px] font-bold text-black mt-0.5">
            {order.Table ? `Table - ${order.Table.table_name.replace('Table ', '')}` : 'Takeaway'}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            {items.length} items
          </div>
        </div>

        {/* Right: Status + Table Type */}
        <div className="flex flex-col items-end gap-1">
          <StatusBadge order={order} />
          <div className="bg-white px-2 py-0.5 rounded-[4px] text-[9px] text-gray-600 font-bold border border-gray-200 shadow-sm flex items-center gap-1 mt-1">
            {tableType}
          </div>
        </div>
      </div>

      {/* ===== Items List ===== */}
      <div className="px-4 py-3 flex-grow space-y-3">
        {items.map((item: any, i: number) => (
          <div
            key={item.item_id + i}
            className="flex justify-between items-center text-[12px]"
          >
            <span className="text-gray-800 font-medium">
              {item.item_Quentry || 1} x {item.Item?.item_name || 'Unknown Item'}
            </span>
            <span className="font-bold text-black">
              {((item.Item?.prices || 0) * (item.item_Quentry || 1)).toLocaleString()} XOF
            </span>
          </div>
        ))}
      </div>

      {/* ===== Dotted Separator ===== */}
      <div className="px-4">
        <div className="border-t border-dotted border-gray-400"></div>
      </div>

      {/* ===== Summary (Tax + Subtotal) ===== */}
      <div className="px-4 pt-3 pb-3 bg-[#FAFAFA]">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span>Tax {taxPercentage}%</span>
          <span>{taxAmount.toFixed(2)} XOF</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-gray-900">
              Subtotal
            </span>
            <span className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">
              Incl. tax
            </span>
          </div>
          <span className="text-[13px] font-extrabold text-gray-900">
            {total.toFixed(2)} XOF
          </span>
        </div>
      </div>

      {/* ===== Footer Action Buttons ===== */}
      <div className="px-3 pb-3 pt-1 flex justify-between gap-2 bg-[#FAFAFA]">
        <button className="flex-1 bg-[#C8E6C9] text-[#1B5E20] text-[10px] font-bold py-1.5 rounded-md hover:bg-[#A5D6A7] transition-colors">
          View
        </button>
        <button className="flex-1 bg-[#BBDEFB] text-[#0D47A1] text-[10px] font-bold py-1.5 rounded-md hover:bg-[#90CAF9] transition-colors">
          Reopen
        </button>
        <button className="flex-1 bg-[#F8BBD0] text-[#880E4F] text-[10px] font-bold py-1.5 rounded-md hover:bg-[#F48FB1] transition-colors">
          Print
        </button>
      </div>
    </div>
  );
};

export default OrderCard;