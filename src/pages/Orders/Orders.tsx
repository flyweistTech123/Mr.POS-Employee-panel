/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrderFlowStore, useWalkthroughUIStore } from "@/store/zustandStores";
import type { OrderItem } from "@/types/order";

import {
  useGetAllItemsQuery,
  useGetAllItemTypesQuery,
  useGetAllFloorsQuery,
  useCreateOrderMutation,
  useSendToKitchenMutation,
  useUpdateOrderStatusMutation,
  useCreatePaymentMutation,
} from "@/redux/api/quickOrderSlice";

import PaymentModal from "@/components/common/PaymentModal";
import ItemDetailsModal from "@/components/common/ItemDetailsModal";
import AddonsModal from "@/components/common/AddonsModal";
import BarTabScreen from "./BarTabScreen";
import { KitchenSuccessModal } from "@/components/common/CustomSuccessModals";
import CancelOrderModal from "@/components/common/CancelOrderModal";

import TrashIcon from "@/assets/Trash.svg";
import successIcon from "@/assets/order/success_icon_large.svg";

// ✅ 1st Modal: Payment Received Success (Green Buttons)
const PaymentReceivedModal = ({ 
  open, 
  onClose, 
  onPrint,
  total, 
  orderId 
}: { 
  open: boolean; 
  onClose: () => void; 
  onPrint: () => void;
  total: number; 
  orderId?: string;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-[460px] shadow-2xl flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Custom Checkmark Icon with floating dots */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#00C853] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00C853] rounded-full opacity-60"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 border-2 border-[#00C853] rounded-full opacity-60"></div>
          <div className="absolute top-1/2 -left-4 w-1.5 h-1.5 bg-[#00C853] rounded-full opacity-80"></div>
          <div className="absolute top-0 -left-1 w-2 h-2 border border-[#00C853] rounded-full opacity-40"></div>
        </div>

        <h2 className="text-[22px] font-bold text-[#00C853] mb-3">Payment Received Successful !</h2>
        
        <p className="text-[13px] text-gray-600 text-center leading-relaxed mb-6 px-4">
          Your Dish ahs been created and will be updated in the menu in couple of minutes
        </p>

        <div className="flex flex-col items-center gap-2 mb-8">
          <p className="text-[15px] font-semibold text-gray-800">
            Amount: {total.toLocaleString()} XOF
          </p>
          <p className="text-[15px] font-semibold text-gray-800">
            Method: Mobile Money
          </p>
          <p className="text-[15px] font-semibold text-gray-800">
            Reference: MOMO-{orderId?.slice(-6) || "889322"}
          </p>
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl text-white font-bold bg-[#00C853] hover:bg-[#00A844] transition-all shadow-md"
          >
            Start new Order
          </button>
          <button 
            onClick={onPrint}
            className="flex-1 py-3.5 rounded-xl font-bold text-[#00C853] bg-white border-2 border-[#00C853] hover:bg-[#E8F5E9] transition-all"
          >
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

// ✅ 2nd Modal: Order Summary / Receipt (Purple Gradient Button)
const ReceiptModal = ({
  open,
  onClose,
  total,
  orderId,
  onPrint
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  orderId?: string;
  onPrint: () => void;
}) => {
  if (!open) return null;

  const currentDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace(',', ' ');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-[420px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col items-center bg-[#FAFAFA]">
          {/* Receipt Card Container */}
          <div className="w-full bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative mb-6">
            <div className="p-6 flex flex-col items-center pb-8">
              {/* Green Check Icon */}
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#00C853] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Success!</h3>
              <p className="text-xs text-gray-500 mb-6 text-center">Your payment has been successfully done.</p>

              <div className="text-center mb-6">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Payment</p>
                <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()} XOF</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 w-full px-2">
                <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-0.5">Order Number</p>
                  <p className="text-xs font-bold text-gray-800">{orderId || "000085752257"}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-0.5">Date & Time</p>
                  <p className="text-xs font-bold text-gray-800">{currentDate}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-0.5">Payment Type</p>
                  <p className="text-xs font-bold text-gray-800">Credit Card</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-0.5">Customer Name</p>
                  <p className="text-xs font-bold text-gray-800">Jimmy Jonson</p>
                </div>
              </div>
            </div>

            {/* Scalloped Edge Effect */}
            <div className="absolute bottom-0 left-0 w-full h-3 flex overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex-1 aspect-square bg-[#FAFAFA] rounded-full -mb-1.5" />
              ))}
            </div>
          </div>

          {/* Print Receipt Button */}
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Receipt
          </button>

          {/* Start New Order Button */}
          <button 
            onClick={onClose}
            className="w-full py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all shadow-md"
          >
            Start New Order
          </button>
        </div>
      </div>
    </div>
  );
};


const Orders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMode, setActiveMode] = useState<"Food" | "Bar">("Food");
  const [showBarTabScreen, setShowBarTabScreen] = useState(false);

  const {
    currentOrder,
    pendingCustomizedItem,
    clearPendingCustomizedItem,
    addItemToOrder,
    resetOrder,
    startOrder,
    updateOrderItem,
    setCurrentOrderId,
    removeOrderItem,
    setPersons: setPersonsGlobal,
    setServerTotals,
    floor: globalFloor,
  } = useOrderFlowStore();

  const selectedCategory = useWalkthroughUIStore((s) => s.selectedCategory);
  const setSelectedCategory = useWalkthroughUIStore((s) => s.setSelectedCategory);

  const [persons, setPersons] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState(globalFloor || "F-01");
  const [panelMode, setPanelMode] = useState<"idle" | "floor" | "order">("idle");

  const [showItemModal, setShowItemModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReadyToPayModal, setShowReadyToPayModal] = useState(false);
  
  // ✅ States for the two different success modals
  const [showPaymentReceivedModal, setShowPaymentReceivedModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [showKitchenSuccess, setShowKitchenSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [modalItem, setModalItem] = useState<any>(null);
  
  const [isSendingKitchen, setIsSendingKitchen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // ✅ Enhanced Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ✅ API Hooks (with loading states)
  const { data: itemTypesData, isLoading: isLoadingTypes } = useGetAllItemTypesQuery({ type: activeMode });
  const { data: itemsData, isLoading: isLoadingItems } = useGetAllItemsQuery({ type: activeMode });
  const { data: floorsData } = useGetAllFloorsQuery();

  const [createOrder] = useCreateOrderMutation();
  const [sendToKitchen] = useSendToKitchenMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [createPayment] = useCreatePaymentMutation();

  const floorsWithIds = useMemo(() => {
    return (floorsData?.data || []).map((f: any) => ({ id: f.Floor_id, name: f.Floor_Name }));
  }, [floorsData]);

  const categories = useMemo(() => {
    const apiCats = itemTypesData?.data?.map((t: any) => ({
      label: t.Name, value: t.Items_types_id.toString(), icon: t.emozi,
    })) || [];
    return [{ label: "All Items", value: "all", icon: null }, ...apiCats];
  }, [itemTypesData]);

  const menuItems = useMemo(() => {
    return (itemsData?.data || []).map((item: any) => ({
      itemId: item.Items_id?.toString(),
      name: item["item-name"],
      price: item["item-price"],
      image: item.image_url || item.image,
      itemType: item.Category?.Items_types_id?.toString(),
    }));
  }, [itemsData]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return menuItems;
    return menuItems.filter((i: any) => i.itemType === selectedCategory);
  }, [selectedCategory, menuItems]);

  const items = currentOrder?.items || [];
  const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subTotal * 0.06);
  const total = currentOrder?.serverTotal ?? subTotal + tax;

  const isOrderPaid = currentOrder?.orderStatus === "Completed" || currentOrder?.paymentStatus === "Success";
  const isOrderSentToKitchen = currentOrder?.orderStatus === "In_Kitchen" || currentOrder?.orderStatus === "Cooking" || currentOrder?.orderStatus === "Ready";

  const showSuccessPanel = isOrderPaid;
  const showOrderSummary = !isOrderPaid && !isOrderSentToKitchen && panelMode === "order" && currentOrder && items.length > 0;

  // ✅ Effect: Sync Cart with Toast
  useEffect(() => {
    if (pendingCustomizedItem && currentOrder) {
      addItemToOrder(pendingCustomizedItem);
      clearPendingCustomizedItem();
      showToast(`Added ${pendingCustomizedItem.name} to order!`, "success");
    }
  }, [pendingCustomizedItem, currentOrder, addItemToOrder, clearPendingCustomizedItem]);

  // ✅ Navigation / State sync
  useEffect(() => {
    const navState = location.state as { tableId?: number; floor?: string; persons?: number };
    if (navState?.tableId) {
      if (currentOrder?.tableId !== String(navState.tableId)) {
        startOrder({
          tableId: String(navState.tableId),
          floor: navState.floor || selectedFloor,
          persons: navState.persons || persons,
        });
      }
      setPanelMode("order");
      window.history.replaceState({}, document.title);
    } else if (currentOrder) {
      setPanelMode("order");
    } else {
      setPanelMode("idle");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleAddToCart = (item: any) => {
    if (panelMode !== "order") {
      setPanelMode("floor");
      return;
    }
    setModalItem(item);
    setShowItemModal(true);
  };

  const handleAddonsSave = ({ addons, note }: { addons: string[]; note: string }) => {
    if (!modalItem) return;
    const customizedItem = {
      ...modalItem,
      size: "M",
      addOns: addons.map((a, i) => ({ id: String(i), name: a, price: 0 })),
      notes: note,
    };
    
    addItemToOrder(customizedItem);
    setShowAddonModal(false);
    showToast(`${modalItem.name} added to order!`, "success");
  };

  const handleBack = () => setShowCancelModal(true);

  const confirmCancelOrder = () => {
    resetOrder();
    setShowKitchenSuccess(false);
    setPanelMode("idle");
    setShowCancelModal(false);
    showToast("Order reset successfully", "info");
  };

  const saveOrderToServer = async (): Promise<string | null> => {
    if (currentOrder?.orderId) return currentOrder.orderId;

    try {
      const tableIdNum = Number(String(currentOrder?.tableId).replace(/\D/g, "")) || 2;
      const payload = {
        items: items.map((i: OrderItem) => ({
          item_id: Number(i.itemId),
          item_Quentry: i.quantity,
          item_size: i.size || "M",
          item_note: i.notes || "",
          item_status: "Preparing",
        })),
        Tax: tax,
        Customer_id: 25,
        Dining_Option: "Dine in",
        Table_id: tableIdNum,
        Kitchen_id: 1,
        Order_Status: "Preparing",
        payment_status: "Pending",
        Status: true,
      };

      const res = await createOrder(payload).unwrap();
      const orderId = String(res.data?.POS_Order_id || "");
      setCurrentOrderId(orderId, res.data?._id);
      if (res.data) {
        setServerTotals({
          subTotal: res.data.SubTotal,
          tax: res.data.Tax,
          total: res.data.Total,
        });
      }
      showToast("Order created successfully!", "success");
      return orderId;
    } catch (err: any) {
      console.error("Create Order Error:", err);
      const errorMsg = err?.data?.message || err?.message || "Failed to create order on server.";
      showToast(errorMsg, "error");
      return null;
    }
  };

  const handleSendToKitchen = async () => {
    setIsSendingKitchen(true); 
    try {
      let orderId = await saveOrderToServer();
      if (!orderId) return;

      await sendToKitchen({
        id: orderId,
        items: items.map((i: OrderItem) => ({
          item_id: Number(i.itemId),
          item_note: i.notes || "",
        })),
      }).unwrap();
      
      await updateOrderStatus({ id: orderId, Order_Status: "In_Kitchen" }).unwrap();
      
      setShowKitchenSuccess(true);
      showToast("Order sent to kitchen successfully!", "success");
    } catch (err: any) {
      console.error("Send to Kitchen Error:", err);
      const errorMsg = err?.data?.message || err?.message || "Failed to send order to kitchen.";
      showToast(errorMsg, "error");
    } finally {
      setIsSendingKitchen(false); 
    }
  };

  const handlePaymentInitiation = async () => {
    setIsProcessingPayment(true); 
    try {
      let id = await saveOrderToServer();
      if (!id) return;
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error("Payment Initiation Error:", err);
      showToast("Failed to open payment options", "error");
    } finally {
      setIsProcessingPayment(false); 
    }
  };

  const handlePaymentConfirm = async (result: { option: string; paymentOptionId: number }) => {
    setShowPaymentModal(false);
    setShowReadyToPayModal(true);

    setTimeout(async () => {
      const orderId = useOrderFlowStore.getState().currentOrder?.orderId;
      if (!orderId) return;

      try {
        await createPayment({
          Payment_Options_id: result.paymentOptionId,
          Order_id: orderId,
          payment_method: result.option,
          paymentStatus: "Success",
        }).unwrap();
        
        useOrderFlowStore.getState().setServerTotals({
          subTotal: currentOrder?.serverSubTotal || subTotal,
          tax: currentOrder?.serverTax || tax,
          total: currentOrder?.serverTotal || total,
          orderStatus: "Completed",
          paymentStatus: "Success"
        });

        await updateOrderStatus({ id: orderId, Order_Status: "Completed" }).unwrap();

        setShowReadyToPayModal(false);
        
        // ✅ Show the first success modal
        setShowPaymentReceivedModal(true);
        
      } catch (err: any) {
        console.error("Payment Processing Error:", err);
        setShowReadyToPayModal(false); 
        const errorMsg = err?.data?.message || err?.message || "Payment update failed. Please try again.";
        showToast(errorMsg, "error");
      }
    }, 2000);
  };

  // ✅ Handlers for the modals
  const handlePrintClick = () => {
    // Hide the first modal, show the second receipt modal
    setShowPaymentReceivedModal(false);
    setShowReceiptModal(true);
    showToast("Generating receipt...", "info");
  };

  const handleActualPrint = () => {
    showToast("Sending receipt to printer...", "info");
    setTimeout(() => {
      showToast("Receipt printed successfully!", "success");
    }, 1500);
  };

  const handleNextOrder = () => {
    resetOrder();
    setShowKitchenSuccess(false);
    setShowPaymentReceivedModal(false);
    setShowReceiptModal(false);
    setPanelMode("idle");
    setPersons(1);
  };

  if (activeMode === "Bar" && showBarTabScreen) {
    return <BarTabScreen onBack={() => setShowBarTabScreen(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen p-6 bg-[#F8F8F8]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{activeMode === "Food" ? "Quick Orders" : "Bar Management"}</h1>
        <div className="flex items-center gap-4">
          {activeMode === "Bar" && (
            <button onClick={() => setShowBarTabScreen(true)} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all">
              <span className="text-lg leading-none">+</span> Open Bar Tab
            </button>
          )}
          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button onClick={() => setActiveMode("Food")} className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${activeMode === "Food" ? "bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>Food</button>
            <button onClick={() => setActiveMode("Bar")} className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${activeMode === "Bar" ? "bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>Bar</button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* LEFT PANEL */}
        <div className="flex-1 bg-white rounded-[32px] p-6 flex flex-col overflow-hidden">
          
          {/* CATEGORY FILTER UI */}
          <div className="bg-[#F2F2F2] rounded-full px-2 py-1.5 flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar w-fit max-w-full">
            {categories.map(c => {
              const isActive = selectedCategory === c.value;
              return (
                <button 
                  key={c.value} 
                  onClick={() => setSelectedCategory(c.value)} 
                  className={`flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-100/50' 
                      : 'text-gray-500 hover:bg-gray-200/50'
                  }`}
                >
                  {c.icon && <span className="text-base leading-none">{c.icon}</span>}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* SKELETON LOADER FOR ITEMS */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingItems ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white border rounded-2xl p-3 flex flex-col items-center animate-pulse">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map((item: any) => (
                  <div key={item.itemId} onClick={() => handleAddToCart(item)} className="bg-white border rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain mb-2" />
                    <div className="text-sm font-bold text-center line-clamp-1">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.price} XOF</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[340px] bg-white rounded-[28px] shadow-sm overflow-hidden relative">
          
          {/* SUCCESS PANEL */}
          {showSuccessPanel && (
            <div className="w-full h-full flex flex-col justify-between bg-white rounded-[28px]">
              <div className="bg-[#F5F5F5] rounded-t-[28px] p-6 w-full text-left">
                <div className="text-2xl font-bold text-gray-800">
                  # {currentOrder?.orderId || "108"}
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs font-medium text-gray-500">Order Created</div>
                  <div className="text-xs font-medium text-gray-500 text-right">
                    Table - {currentOrder?.tableId?.replace("t-", "") || "04"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <div className="rounded-full p-6 mb-6">
                  <img src={successIcon} alt="success" className="w-24 h-24" />
                </div>
              </div>
              <button
                className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all rounded-b-[28px]"
                onClick={handleNextOrder}
              >
                Next Order
              </button>
            </div>
          )}

          {/* FLOOR MAP */}
          {!showSuccessPanel && panelMode === "floor" && (
            <div className="w-full h-full flex flex-col bg-white rounded-[28px] overflow-hidden">
              <div className="bg-gradient-to-b from-[#8E24AA]/20 to-[#E53935]/20 p-6">
                <div className="text-xl font-bold">Floor Map</div>
              </div>
              <div className="flex-1 p-6">
                <div className="mb-8 text-center">
                  <div className="font-semibold mb-3 text-left">Select Persons:</div>
                  <div className="flex justify-center items-center gap-4">
                    <button onClick={() => { setPersons(p => Math.max(1, p - 1)); setPersonsGlobal(persons - 1); }} className="w-10 h-10 bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white rounded-lg text-xl">-</button>
                    <div className="w-16 h-10 border rounded-lg flex items-center justify-center font-bold">{persons}</div>
                    <button onClick={() => { setPersons(p => p + 1); setPersonsGlobal(persons + 1); }} className="w-10 h-10 bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white rounded-lg text-xl">+</button>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-semibold mb-3">Select Floor:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {floorsWithIds.map(f => (
                      <button key={f.id} onClick={() => setSelectedFloor(f.name)} className={`py-2 rounded-lg text-sm font-medium ${selectedFloor === f.name ? 'bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white' : 'bg-gray-50'}`}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex">
                <button onClick={() => { navigate("/table", { state: { persons, floor: selectedFloor, floorId: floorsWithIds.find(f => f.name === selectedFloor)?.id } }); }} className="flex-1 py-4 text-white font-bold bg-gradient-to-r from-[#8E24AA] to-[#E53935] rounded-bl-[28px]">Select Table</button>
                <button onClick={() => { startOrder({ tableId: "Quick-Table", floor: selectedFloor, persons }); setPanelMode("order"); }} className="flex-1 py-4 text-[#8E24AA] font-bold bg-white border-l rounded-br-[28px]">Quick Order</button>
              </div>
            </div>
          )}

          {/* ORDER SUMMARY */}
          {showOrderSummary && (
            <div className="w-full h-full flex flex-col bg-[#F9F5F9] rounded-[28px] overflow-hidden">
              <div className="bg-gradient-to-r from-[#D8B4E2] to-[#F4A2A2] p-5 flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold text-gray-900">Order Summary</div>
                  <div className="text-xs font-semibold text-gray-700">Table - {currentOrder.tableId?.replace("t-", "")}</div>
                </div>
                <button onClick={handleBack} className="text-xs font-bold text-gray-700 bg-white/50 hover:bg-white px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                {items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1"><div className="text-sm font-bold">{item.quantity} x {item.name}</div></div>
                      <div className="text-sm font-bold">{item.price * item.quantity} XOF</div>
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-2">
                      <div className="flex items-center border rounded-md">
                        <button onClick={() => updateOrderItem(item.itemId, { quantity: Math.max(1, item.quantity - 1) })} className="px-2 py-1 bg-gray-100 text-xs">-</button>
                        <span className="px-3 text-xs">{item.quantity}</span>
                        <button onClick={() => updateOrderItem(item.itemId, { quantity: item.quantity + 1 })} className="px-2 py-1 bg-gray-100 text-xs">+</button>
                      </div>
                      <button onClick={() => removeOrderItem(item.itemId)} className="p-1 border rounded-md"><img src={TrashIcon} className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#FDF0F4] border-t">
                <div className="flex justify-between font-bold"><span>Subtotal</span><span>{total} XOF</span></div>
              </div>
              
              <div className="flex flex-col">
                <button 
                  onClick={handleSendToKitchen} 
                  disabled={isSendingKitchen} 
                  className="w-full py-4 text-white font-bold bg-[#00C853] hover:bg-[#00A844] disabled:opacity-70"
                >
                  {isSendingKitchen ? "Sending..." : "Send to Kitchen"}
                </button>
                
                <button 
                  onClick={handlePaymentInitiation} 
                  disabled={isProcessingPayment} 
                  className="w-full py-4 text-white font-bold bg-gradient-to-r from-[#8E24AA] to-[#E53935] disabled:opacity-70"
                >
                  {isProcessingPayment ? "Processing..." : "Select Payment Option"}
                </button>
              </div>
            </div>
          )}

          {/* EMPTY ORDER */}
          {!showSuccessPanel && !showOrderSummary && panelMode === "order" && currentOrder && items.length === 0 && (
            <div className="w-full h-full flex flex-col justify-between bg-white rounded-[28px]">
              <div className="bg-gradient-to-b from-[#8E24AA]/20 to-[#E53935]/20 p-6">
                <div className="text-xl font-bold text-gray-800">Start Order</div>
                <div className="text-sm text-gray-600">Table - {currentOrder.tableId?.replace("t-", "")}</div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <p className="text-lg">Tap items on the left to add them.</p>
              </div>
            </div>
          )}

          {/* IDLE */}
          {!showSuccessPanel && panelMode === "idle" && (
            <div onClick={() => setPanelMode("floor")} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer bg-white z-50 hover:bg-gray-50 transition-colors">
              <div className="text-2xl font-bold text-gray-400 text-center leading-relaxed pointer-events-none">
                Tap to Select Table<br/>&<br/>Start Order
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* MODALS */}
      <ItemDetailsModal 
        open={showItemModal} 
        item={modalItem} 
        onClose={() => setShowItemModal(false)} 
        onSelect={(size: string) => { setShowItemModal(false); setShowAddonModal(true); }} 
      />
      <AddonsModal 
        open={showAddonModal} 
        item={modalItem} 
        selectedSize="M" 
        tableId={currentOrder?.tableId || undefined} 
        onClose={() => setShowAddonModal(false)} 
        onSave={handleAddonsSave} 
      />
      <PaymentModal 
        open={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        total={total} 
        onConfirm={handlePaymentConfirm} 
      />
      
      {showReadyToPayModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 w-[400px] text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Ready to Pay</h2>
            <p className="text-sm text-gray-500 mb-6">Place the card at the payment terminal</p>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#8E24AA] flex items-center justify-center text-3xl">💳</div>
            <button onClick={() => setShowReadyToPayModal(false)} className="w-full py-3 rounded-xl bg-gray-100 font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* ✅ Modal 1: Payment Received Successful (Green Buttons) */}
      <PaymentReceivedModal
        open={showPaymentReceivedModal}
        onClose={handleNextOrder}
        onPrint={handlePrintClick}
        total={total}
        orderId={currentOrder?.orderId}
      />

      {/* ✅ Modal 2: Order Summary / Receipt (Triggered by Print) */}
      <ReceiptModal
        open={showReceiptModal}
        onClose={handleNextOrder}
        onPrint={handleActualPrint}
        total={total}
        orderId={currentOrder?.orderId}
      />

      <KitchenSuccessModal 
        open={showKitchenSuccess} 
        onClose={() => setShowKitchenSuccess(false)} 
        itemCount={items.length} 
      />

      <CancelOrderModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelOrder}
      />

      {/* ✅ Enhanced Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            toast.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {toast.type === 'success' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>}
            {toast.type === 'error' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
            {toast.type === 'info' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;