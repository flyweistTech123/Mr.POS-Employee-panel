import { useState, useEffect } from 'react';
import { useGetAllOrderHistoryQuery, useGetOrderHistoryByDateRangeQuery, useGetOrderHistoryByStatusQuery } from '@/redux/api/orderHistoryApi';
import PaymentModal from '@/components/common/PaymentModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import Invoice from './Invoice';
import type { OrderItem } from '@/types/order';
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useNavigate } from 'react-router-dom';
import { teamChatTrainingSteps } from '@/walkthrough/steps';
import * as orderApi from '@/api/orderApi';
import Loader from '@/components/Loader';

// Import the separated components
import OrderCard from './OrderCard';
import OrderSummaryModal from './OrderSummaryModal';

// ============================================================
// Helper Functions
// ============================================================

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

  // ============================================================
  // API Hooks
  // ============================================================
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

  // Determine active data source
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

  // The new API returns an array directly in `data.data` 
  let orders = Array.isArray(data?.data) ? data.data : (data?.data?.orders || []);
  let timePeriod = dateFilter ? dateFilter.toLowerCase() : 'all time';

  // Client-side fallback filtering
  if (statusFilter) {
    orders = orders.filter((o: any) => o.order_status === statusFilter || o.Order_Status === statusFilter);
  }

  const handleCardClick = (order: any) => {
    setSelectedOrder({
      orderId: order.POS_Order_id,
      status: order.order_status || order.Order_Status,
      tableInfo: { tableId: order.Table?.table_name || 'Takeaway' },
      items: order.items.map((i: any) => ({
        itemId: i.item_id,
        name: i.Item?.item_name || 'Unknown Item',
        quantity: i.item_Quentry || 1,
        price: i.Item?.prices || 0,
        addOns: i.Addon ? [{ name: i.Addon.Addons, price: i.Addon.prices }] : [],
        variant: i.Variant?.Variants
      })),
      pricingSummary: {
        taxPercentage: order.SubTotal > 0 ? ((order.Tax / order.SubTotal) * 100) : 0,
        tax: order.Tax || 0,
        subtotal: order.SubTotal || 0,
        totalAmount: order.Total || 0,
      },
      customerInfo: { name: order.Customer?.Name || '' },
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
            <div 
              className="bg-white border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 cursor-pointer min-w-[100px] justify-between shadow-sm"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <span className="text-[12px] font-semibold text-gray-700">
                {dateFilter || 'Today'}
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
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 p-1 border border-gray-100">
                {['Today', 'Last Week', 'Last Month', 'Reset'].map((option) => (
                  <button
                    key={option}
                    className="block w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 rounded text-gray-700 font-medium"
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
          <div className="flex items-center bg-[#E8EAED] rounded-full p-1">
            {['All Orders', 'Preparing', 'Served', 'Cancelled'].map((option) => {
              const isActive =
                (option === 'All Orders' && statusFilter === '') ||
                (option !== 'All Orders' && statusFilter === option);
              return (
                <button
                  key={option}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
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
          <div className="flex items-center bg-[#E8EAED] rounded-full p-1 gap-1">
            <button
              className={`px-5 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#6A1B9A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              ORDERS
            </button>
            <button
              className={`px-5 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide transition-all ${
                activeTab === 'invoices'
                  ? 'bg-[#6A1B9A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order: any, idx: number) => (
            <OrderCard
              key={order._id || idx}
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