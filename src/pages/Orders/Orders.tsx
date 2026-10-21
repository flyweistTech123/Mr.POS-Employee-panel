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
  
  const [showKitchenSuccess, setShowKitchenSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [modalItem, setModalItem] = useState<any>(null);
  
  const [isSendingKitchen, setIsSendingKitchen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [feedback, setFeedback] = useState("");

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
      // Show Toast
      setFeedback(`Added ${pendingCustomizedItem.name} to order!`);
      setTimeout(() => setFeedback(""), 2000);
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
    
    // ✅ Show Toast
    setFeedback(`${modalItem.name} added to order!`);
    setTimeout(() => setFeedback(""), 2000);
  };

  const handleBack = () => setShowCancelModal(true);

  const confirmCancelOrder = () => {
    resetOrder();
    setShowKitchenSuccess(false);
    setPanelMode("idle");
    setShowCancelModal(false);
    setFeedback("Order reset");
    setTimeout(() => setFeedback(""), 1500);
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
      return orderId;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleSendToKitchen = async () => {
    setIsSendingKitchen(true); 
    try {
      let orderId = await saveOrderToServer();
      if (!orderId) {
        setFeedback("Failed to save order");
        return;
      }

      await sendToKitchen({
        id: orderId,
        items: items.map((i: OrderItem) => ({
          item_id: Number(i.itemId),
          item_note: i.notes || "",
        })),
      }).unwrap();
      
      await updateOrderStatus({ id: orderId, Order_Status: "In_Kitchen" }).unwrap();
      
      setShowKitchenSuccess(true);
    } catch (err) {
      console.error(err);
      setFeedback("Failed to send to kitchen");
    } finally {
      setIsSendingKitchen(false); 
    }
  };

  const handlePaymentInitiation = async () => {
    setIsProcessingPayment(true); 
    try {
      let id = await saveOrderToServer();
      if (!id) {
        setFeedback("Failed to save order");
        return;
      }
      setShowPaymentModal(true);
    } catch (err) {
      console.error(err);
      setFeedback("Failed to open payment");
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
      } catch (err: any) {
        setFeedback(err?.data?.message || "Payment update failed");
        console.error(err);
      }
    }, 2000);
  };

  const handleNextOrder = () => {
    resetOrder();
    setShowKitchenSuccess(false);
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
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {categories.map(c => (
              <button key={c.value} onClick={() => setSelectedCategory(c.value)} className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === c.value ? 'bg-gray-100 text-gray-900 shadow-sm border' : 'text-gray-500'}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          
          {/* ✅ SKELETON LOADER FOR ITEMS */}
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

      {/* ✅ TOAST NOTIFICATION */}
      {feedback && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full z-[60] shadow-lg transition-all animate-bounce">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default Orders;