import { useState, useEffect } from 'react';
import { useGetAllOrderHistoryQuery, useGetOrderHistoryByDateRangeQuery, useGetOrderHistoryByStatusQuery } from '@/redux/api/orderHistoryApi';
import OrderSummaryModal from '@/components/common/OrderSummaryModal';
import PaymentModal from '@/components/common/PaymentModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import Invoice from './Invoice';
import type { OrderItem } from '@/types/order';
import cutleryIcon from '@/assets/order/cutlery.svg';
import preparingIcon from '@/assets/order/preparing.svg';
import checkIcon from '@/assets/payment/success_tick_receipt.svg';
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useNavigate } from 'react-router-dom';
import { teamChatTrainingSteps } from '@/walkthrough/steps';
import * as orderApi from '@/api/orderApi';
import Loader from '@/components/Loader';

// ============================================================
// Helper Functions
// ============================================================

function getMinutesAgo(isoString: string | undefined) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  return Math.max(1, Math.round(diffMs / 60000));
}

const getDateRange = (filter: string) => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (filter === 'Today') {
    const td = formatDate(today);
    return { start_date: td, end_date: td };
  } else if (filter === 'Last Week') {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    return { start_date: formatDate(start), end_date: formatDate(today) };
  } else if (filter === 'Last Month') {
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return { start_date: formatDate(start), end_date: formatDate(today) };
  }
  return null;
};

// ============================================================
// Status Badge Component (matches Figma)
// ============================================================

const StatusBadge = ({ order }: { order: any }) => {
  const lastStatus = order.statusHistory?.[order.statusHistory.length - 1];
  const minutes = getMinutesAgo(lastStatus?.at);

  if (order.status === 'Preparing') {
    return (
      <div className="bg-[#FFF4E5] text-[#FF9800] px-2 py-1 rounded-md text-[10px] font-bold flex flex-col items-center min-w-[75px] leading-tight">
        <div className="flex items-center gap-1">
          <span>Preparing</span>
          <img src={preparingIcon} alt="Clock" className="w-3 h-3" />
        </div>
        <span className="text-[#FF9800] text-[9px] font-medium">
          Started {minutes} min ago
        </span>
      </div>
    );
  }

  if (order.status === 'Served') {
    return (
      <div className="bg-[#E8F5E9] text-[#4CAF50] px-2 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 min-w-[75px] justify-center">
        <span>Served</span>
        <img src={checkIcon} alt="Check" className="w-3 h-3" />
      </div>
    );
  }

  if (order.status === 'Cancelled') {
    return (
      <div className="bg-[#FFEBEE] text-[#F44336] px-2 py-1 rounded-md text-[10px] font-bold flex flex-col items-center min-w-[75px] leading-tight">
        <span>Cancelled</span>
        <span className="text-[#F44336] text-[9px] font-medium">
          Started {minutes} min ago
        </span>
      </div>
    );
  }

  return (
    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-[10px] font-bold">
      {order.status}
    </span>
  );
};

// ============================================================
// Order Card Component (matches Figma exactly)
// ============================================================

const OrderCard = ({ order, onClick }: { order: any; onClick?: () => void }) => {
  const orderData = order.order;
  const items = order.products?.items || [];
  const tax = order.tax || { tax_percentage: 0, tax_amount: 0 };
  const tableType = order.table?.table_type || 'Dine-in';

  return (
    <div
      onClick={onClick}
      className="bg-white flex flex-col rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* ===== Header with Gradient ===== */}
      <div
        className="flex items-start justify-between px-4 pt-4 pb-3"
        style={{
          background:
            'linear-gradient(180deg, rgba(106, 27, 154, 0.08) 0%, rgba(211, 47, 47, 0.04) 100%)',
        }}
      >
        {/* Left: Order Info */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <img src={cutleryIcon} alt="Order" className="w-5 h-5 opacity-80" />
            <span className="font-extrabold text-[16px] text-black">
              # {orderData.order_id}
            </span>
          </div>
          <div className="text-[13px] font-bold text-gray-800">
            Table - {order.table?.table_id}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            {items.length} items
          </div>
        </div>

        {/* Right: Status + Table Type */}
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge
            order={{
              status: orderData.order_status,
              statusHistory: [{ at: orderData.created_at }],
            }}
          />
          <div className="bg-white/80 px-2 py-0.5 rounded text-[10px] text-gray-700 font-bold border border-gray-200/60 shadow-sm">
            {tableType}
          </div>
        </div>
      </div>

      {/* ===== Items List ===== */}
      <div className="px-4 py-3 flex-grow space-y-2.5">
        {items.map((item: any, i: number) => (
          <div
            key={item.item_id + i}
            className="flex justify-between items-center text-[12px]"
          >
            <span className="text-gray-700 font-medium">
              {item.quantity || 1} x {item.name}
            </span>
            <span className="font-bold text-gray-900">
              {item.price.toLocaleString()} XOF
            </span>
          </div>
        ))}
      </div>

      {/* ===== Dashed Separator ===== */}
      <div className="px-4">
        <div className="border-t border-dashed border-gray-300"></div>
      </div>

      {/* ===== Summary (Tax + Subtotal) ===== */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span>Tax {tax.tax_percentage}%</span>
          <span>{(tax.tax_amount || 0).toFixed(2)} XOF</span>
        </div>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-gray-900">
              Subtotal
            </span>
            <span className="text-[9px] text-gray-400 font-medium leading-none">
              (Incl. tax)
            </span>
          </div>
          <span className="text-[13px] font-extrabold text-gray-900">
            {(order.total || 0).toFixed(2)} XOF
          </span>
        </div>
      </div>

      {/* ===== Footer Action Buttons ===== */}
      <div className="px-4 py-3 flex justify-between gap-2">
        <button className="flex-1 bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold py-1.5 rounded-md hover:bg-[#A7F3D0] transition-colors shadow-sm">
          View
        </button>
        <button className="flex-1 bg-[#E0E7FF] text-[#3730A3] text-[10px] font-bold py-1.5 rounded-md hover:bg-[#C7D2FE] transition-colors shadow-sm">
          Reopen
        </button>
        <button className="flex-1 bg-[#FCE7F3] text-[#9D174D] text-[10px] font-bold py-1.5 rounded-md hover:bg-[#FBCFE8] transition-colors shadow-sm">
          Print
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Main OrderHistory Component
// ============================================================

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Filter and tab logic
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState('Today');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const {
    completed,
    activeTraining,
    completedTrainings,
    startTraining,
  } = useWalkthroughStore();

  const dateRange = getDateRange(dateFilter);
  const page = 1;
  const limit = 100;

  const skipDate = !dateRange;
  const skipStatus = statusFilter === '' || !!dateRange;
  const skipAll = !!dateRange || statusFilter !== '';

  const {
    data: rangeData,
    isLoading: rangeLoading,
    isError: rangeError,
    refetch: rangeRefetch,
  } = useGetOrderHistoryByDateRangeQuery(
    { start_date: dateRange?.start_date, end_date: dateRange?.end_date, page, limit },
    { skip: skipDate }
  );

  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusError,
    refetch: statusRefetch,
  } = useGetOrderHistoryByStatusQuery(
    { status: statusFilter, page, limit },
    { skip: skipStatus }
  );

  const {
    data: allData,
    isLoading: allLoading,
    isError: allError,
    refetch: allRefetch,
  } = useGetAllOrderHistoryQuery(
    {
      page,
      limit,
      search: '',
      order_status: '',
      client_mobile_no: '',
      table_id: '',
      floor_id: '',
    },
    { skip: skipAll }
  );

  let data;
  let isLoading;
  let isError;
  let activeRefetch;

  isLoading = allLoading || rangeLoading || statusLoading;
  if (!skipDate) {
    data = rangeData;
    isLoading = rangeLoading;
    isError = rangeError;
    activeRefetch = rangeRefetch;
  } else if (!skipStatus) {
    data = statusData;
    isLoading = statusLoading;
    isError = statusError;
    activeRefetch = statusRefetch;
  } else {
    data = allData;
    isLoading = allLoading;
    isError = allError;
    activeRefetch = allRefetch;
  }

  // Chain to teamchat training after orderHistory training completes
  useEffect(() => {
    if (
      completed &&
      activeTraining === 'orderHistory' &&
      !completedTrainings.teamchat
    ) {
      startTraining('teamchat', teamChatTrainingSteps);
      navigate('/');
    }
  }, [completed, activeTraining, completedTrainings, startTraining, navigate]);

  if (activeTab === 'invoices') {
    return <Invoice onBack={() => setActiveTab('orders')} />;
  }

  let orders = data?.data?.orders || [];
  let timePeriod = dateFilter ? dateFilter.toLowerCase() : 'all time';

  if (!skipDate && statusFilter) {
    orders = orders.filter((o: any) => o.order.order_status === statusFilter);
  }

  const handleCardClick = (order: any) => {
    setSelectedOrder({
      orderId: order.order.order_id,
      status: order.order.order_status,
      statusHistory: [{ at: order.order.created_at }],
      tableInfo: { tableId: `t-${order.table.table_id}` },
      items: order.products.items,
      pricingSummary: {
        taxPercentage: order.tax.tax_percentage,
        tax: order.tax.tax_amount,
        subtotal: order.subtotal,
        totalAmount: order.total,
      },
      customerInfo: { name: '' },
      paymentDetails: { method: 'Cash' },
    });
    setShowSummaryModal(true);
  };

  return (
    <div className="p-6 min-h-screen bg-[#F8F9FB] font-sans">
      {/* ============== Top Header Toolbar ============== */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-[24px] font-extrabold text-black tracking-tight">
          Order History
        </h1>

        <div className="flex gap-3 items-center">
          {/* Date Filter Dropdown */}
          <div className="relative">
            <div className="bg-[#F1F1F1] rounded-full px-4 py-1.5 flex items-center gap-2 cursor-pointer min-w-[90px] justify-between">
              <span className="text-[13px] font-semibold text-gray-800">
                {dateFilter || 'Today'}
              </span>
              <svg
                className="w-3.5 h-3.5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg z-20 p-1">
                {['Today', 'Last Week', 'Last Month', 'Reset'].map((option) => (
                  <button
                    key={option}
                    className="block w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100 rounded"
                    onClick={() => {
                      if (option === 'Reset') setDateFilter('');
                      else setDateFilter(option);
                      setShowDateDropdown(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filters Pill */}
          <div className="flex items-center bg-[#F1F1F1] rounded-full p-1">
            {['All Orders', 'Preparing', 'Served', 'Cancelled'].map((option) => {
              const isActive =
                (option === 'All Orders' && statusFilter === '') ||
                (option !== 'All Orders' && statusFilter === option);
              return (
                <button
                  key={option}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => {
                    if (option === 'All Orders') setStatusFilter('');
                    else setStatusFilter(option);
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Toggle Switch: Orders / Bar */}
          <div className="flex items-center bg-[#F1F1F1] rounded-full p-1 gap-1">
            <button
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#6A1B9A] text-white'
                  : 'bg-[#00C853] text-white'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              ORDERS
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                activeTab === 'invoices'
                  ? 'bg-[#6A1B9A] text-white'
                  : 'bg-[#00C853] text-white'
              }`}
              onClick={() => setActiveTab('invoices')}
            >
              BAR
            </button>
          </div>
        </div>
      </div>

      {/* ============== Orders Grid ============== */}
      {isLoading ? (
        <Loader />
      ) : isError || orders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400 mb-1">
              No orders found
            </div>
            <div className="text-sm text-gray-500">
              {statusFilter
                ? `No ${statusFilter.toLowerCase()} orders for ${timePeriod}`
                : 'Try adjusting your filters'}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {orders.map((order: any, idx: number) => (
            <OrderCard
              key={order.order.order_id || idx}
              order={order}
              onClick={() => handleCardClick(order)}
            />
          ))}
        </div>
      )}

      {/* ============== Modals ============== */}
      {selectedOrder && (
        <OrderSummaryModal
          open={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          order={{
            items: selectedOrder.items,
            subtotal: selectedOrder.pricingSummary?.subtotal || 0,
            tax: selectedOrder.pricingSummary?.tax || 0,
            total: selectedOrder.pricingSummary?.totalAmount || 0,
            orderId: selectedOrder.orderId,
            paymentType: selectedOrder.paymentDetails?.method || 'Cash',
            customerName: selectedOrder.customerInfo?.name || '',
          }}
          onUpdateItemQuantity={async (itemId, newQty) => {
            if (selectedOrder?.orderId) {
              const updatedItems = selectedOrder.items.map((item: OrderItem) =>
                item.itemId === itemId ? { ...item, quantity: newQty } : item
              );

              const subtotal = updatedItems.reduce(
                (sum: number, item: OrderItem) => {
                  const addOnsTotal =
                    (item.addOns?.reduce(
                      (a: number, addon) => a + (addon.price || 0),
                      0
                    ) || 0) * (item.quantity || 1);
                  return sum + item.price * (item.quantity || 1) + addOnsTotal;
                },
                0
              );
              const tax = Math.round(subtotal * 0.06);
              const total = subtotal + tax;

              await orderApi.updateOrder(selectedOrder.orderId, {
                items: updatedItems,
                pricingSummary: {
                  subtotal,
                  tax,
                  taxPercentage: 6,
                  discount: 0,
                  serviceCharge: 0,
                  totalAmount: total,
                },
              });

              setSelectedOrder({
                ...selectedOrder,
                items: updatedItems,
                pricingSummary: {
                  ...selectedOrder.pricingSummary,
                  subtotal,
                  tax,
                  totalAmount: total,
                },
              });
            }
          }}
          onChoosePaymentOption={() => {
            setShowSummaryModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={selectedOrder?.pricingSummary?.totalAmount || 0}
        onConfirm={async (method) => {
          if (selectedOrder?.orderId) {
            await orderApi.updateOrder(selectedOrder.orderId, {
              paymentDetails: {
                method,
                status: 'Paid',
                transactionId: `TXN-${Date.now()}`,
              },
            });
            setShowPaymentModal(false);
            setShowSuccessModal(true);
          }
        }}
      />

      <SuccessModal
        open={showSuccessModal}
        title="Payment Received Successfully!"
        subtitle="Your payment has been processed and the order has been updated."
        buttonText="Back to Order History"
        onButtonClick={() => {
          setShowSuccessModal(false);
          setShowSummaryModal(false);
          activeRefetch();
        }}
      />
    </div>
  );
};

export default OrderHistory;