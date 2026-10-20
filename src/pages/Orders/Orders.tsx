/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useOrderFlowStore, useWalkthroughUIStore } from "@/store/zustandStores";
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useNavigate, useLocation } from "react-router-dom";

// API Hooks
import {
  useGetAllItemsQuery,
  useGetAllItemTypesQuery,
  useGetAllFloorsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useSendToKitchenMutation,
} from "@/redux/api/quickOrderSlice";

// Components & Modals
import ItemDetailsModal from "@/components/common/ItemDetailsModal";
import AddonsModal from "@/components/common/AddonsModal";
import OrderSummaryModal from "@/components/common/OrderSummaryModal";
import PaymentModal from "@/components/common/PaymentModal";
import { SuccessModal } from "@/components/common/SuccessModal";
import ReadyToScanModal from "@/components/common/ReadyToScanModal";
import ReadyToPayModal from "@/components/common/ReadyToPayModal";
import PaymentDoneModal from "@/components/common/PaymentDoneModal";
import BarTabScreen from "./BarTabScreen"; 

// Assets
import personIcon from "@/assets/user_icon.svg";
import floorIcon from "@/assets/floor_icon.svg";
import tableIcon from "@/assets/table_filled_icon.svg";
import TrashIcon from "@/assets/Trash.svg";
import successIcon from '@/assets/order/success_icon_large.svg';

// Figma Fallbacks (Food only)
import image1 from '../../assets/order/DoubleChocolateFrappe.png';
import image2 from '../../assets/order/MCSignature.png';
import image3 from '../../assets/order/MOPBBPilot_BigMac.png';
import image4 from '../../assets/order/MOP_BBPilot_Buttermilk.png';
import image5 from '../../assets/order/MOP_BBPilot_McSpicy.png';
import image6 from '../../assets/order/Nuggets.png';

const FIGMA_FALLBACK_ITEMS = [
  { itemId: 'f1',  name: 'Crispy Chicken', price: 330, image: image2, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f2',  name: 'Filet-O-Fish',   price: 330, image: image4, itemType: 'crispy',   preparationStation: 'Kitchen' },
  { itemId: 'f3',  name: 'Spicy burger',   price: 330, image: image5, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f4',  name: 'Spicy burger',   price: 330, image: image5, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f5',  name: 'Spicy burger',   price: 330, image: image5, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f6',  name: 'Frappe',         price: 199, image: image1, itemType: 'beverage', preparationStation: 'Counter' },
  { itemId: 'f7',  name: 'Filet-O-Fish',   price: 330, image: image4, itemType: 'crispy',   preparationStation: 'Kitchen' },
  { itemId: 'f8',  name: 'Filet-O-Fish',   price: 330, image: image4, itemType: 'crispy',   preparationStation: 'Kitchen' },
  { itemId: 'f9',  name: 'Big Mac',        price: 330, image: image3, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f10', name: 'Spicy burger',   price: 330, image: image5, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f11', name: 'Frappe',         price: 199, image: image1, itemType: 'beverage', preparationStation: 'Counter' },
  { itemId: 'f12', name: 'Frappe',         price: 199, image: image1, itemType: 'beverage', preparationStation: 'Counter' },
  { itemId: 'f13', name: 'Spicy burger',   price: 330, image: image5, itemType: 'burger',   preparationStation: 'Kitchen' },
  { itemId: 'f14', name: 'Frappe',         price: 199, image: image1, itemType: 'beverage', preparationStation: 'Counter' },
  { itemId: 'f15', name: 'Frappe',         price: 199, image: image1, itemType: 'beverage', preparationStation: 'Counter' },
];

const getFigmaImage = (name: string): string | null => {
  const n = (name || "").toLowerCase();
  if (n.includes("frappe") || n.includes("chocolate")) return image1;
  if (n.includes("signature") || n.includes("mcchicken") || n.includes("crispy chicken")) return image2;
  if (n.includes("big mac") || n.includes("bigmac")) return image3;
  if (n.includes("filet") || n.includes("buttermilk")) return image4;
  if (n.includes("spicy") || n.includes("mcspicy")) return image5;
  if (n.includes("nugget")) return image6;
  return null;
};

const isCounterItem = (categoryName: string) => {
  const n = (categoryName || "").toLowerCase();
  return n.includes("beverage") || n.includes("drink") || n.includes("beer") || n.includes("wine") || n.includes("cocktail");
};

const Orders: React.FC = () => {
  // --- Zustand Store ---
  const {
    currentOrder, pendingItem, pendingCustomizedItem,
    setPendingCustomizedItem, clearPendingCustomizedItem,
    addItemToOrder, resetOrder, startOrder, updateOrderItem,
    setCurrentOrderId, removeOrderItem, setFloor,
    setPersons: setPersonsGlobal, setInOrderFlow,
  } = useOrderFlowStore();

  const selectedCategory = useWalkthroughUIStore((s) => s.selectedCategory);
  const setSelectedCategory = useWalkthroughUIStore((s) => s.setSelectedCategory);
  const { steps, currentStep, isActive, next } = useWalkthroughStore();

  // --- UI State ---
  const [activeMode, setActiveMode] = useState<'Food' | 'Bar'>('Food');
  const [showBarTabScreen, setShowBarTabScreen] = useState(false);
  
  const [isHappyHourActive, setIsHappyHourActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // --- Selection State ---
  const [persons, setPersons] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState("F-01");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedItemTypeId, setSelectedItemTypeId] = useState<string | null>(null);

  // --- Flow State ---
  const [showFloorPersonsPanel, setShowFloorPersonsPanel] = useState(false);
  const [showOrderSentPanel, setShowOrderSentPanel] = useState(false);
  const [orderSending, setOrderSending] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // --- Modals State ---
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [modalItem, setModalItem] = useState<any>(null);
  const [modalSize, setModalSize] = useState("M");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // --- API Mutations & Queries ---
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [sendToKitchen, { isLoading: isSendingToKitchen }] = useSendToKitchenMutation();

  const { data: itemTypesData, isLoading: itemTypesLoading } = useGetAllItemTypesQuery({ type: activeMode });
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery({ type: activeMode });
  const { data: floorsData } = useGetAllFloorsQuery();

  // --- Memos & Effects ---
  const floors = useMemo<string[]>(() => {
    const apiFloors = (floorsData?.data || []).map((f: any) => f.Floor_Name);
    return apiFloors.length > 0 ? apiFloors : ["F-01", "F-02", "F-03"];
  }, [floorsData]);

  const categories = useMemo(() => {
    const apiCats = itemTypesData?.data?.map((type: any) => ({
      label: type.Name,
      value: type.Items_types_id.toString(),
      icon: type.emozi || null,
    })) || [];
    return [{ label: "All Items", value: "all", icon: null }, ...apiCats];
  }, [itemTypesData]);

  const apiMenuItems = useMemo(() => {
    return (itemsData?.data || []).map((item: any) => {
      const cat = item.Category || {};
      const typeId = cat.Items_types_id?.toString();
      const typeName = cat.Name || "";
      const apiImg = item.image_url || item.image || null;
      const figmaImg = activeMode === 'Food' ? getFigmaImage(item["item-name"]) : null;
      
      return {
        itemId: item.Items_id?.toString(),
        name: item["item-name"] || item.Title,
        price: item["item-price"] || item.Price,
        image: figmaImg || apiImg,
        itemType: typeId,
        categoryName: typeName,
        preparationStation: isCounterItem(typeName) ? "Counter" : "Kitchen",
      };
    });
  }, [itemsData, activeMode]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all" || !selectedCategory) {
      if (apiMenuItems.length === 0 && activeMode === 'Food') return FIGMA_FALLBACK_ITEMS;
      return apiMenuItems;
    }
    return apiMenuItems.filter(item => item.itemType === selectedCategory);
  }, [selectedCategory, apiMenuItems, activeMode]);

  const isLoading = itemTypesLoading || itemsLoading;

  useEffect(() => { setInOrderFlow(true); }, [setInOrderFlow]);

  useEffect(() => {
    setSelectedCategory("all");
    setSelectedItemTypeId(null);
  }, [activeMode, setSelectedCategory]);

  useEffect(() => {
    if (pendingItem && currentOrder) { setModalItem(pendingItem); setShowItemDetailsModal(true); }
  }, [pendingItem, currentOrder]);

  useEffect(() => {
    if (pendingCustomizedItem && selectedTable && currentOrder) {
      addItemToOrder(pendingCustomizedItem);
      clearPendingCustomizedItem();
    }
  }, [pendingCustomizedItem, selectedTable, currentOrder, addItemToOrder, clearPendingCustomizedItem]);

  useEffect(() => {
    if (currentOrder && currentOrder.tableId) {
      setSelectedTable(currentOrder.tableId);
      setSelectedFloor(currentOrder.floor);
      setPersons(currentOrder.persons);
    }
  }, [currentOrder]);

  useEffect(() => {
    if (location.state && location.state.showOrderSentPanel) {
      setShowOrderSentPanel(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // --- Handlers ---
  const handleRightPanelClick = () => {
    setShowFloorPersonsPanel(true);
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (step?.selector === ".select-table-prompt" && (!step.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui")) {
      walkthrough.next();
    }
  };

  const handleAddToCart = (item: any) => {
    if (!currentOrder && !selectedTable && !showFloorPersonsPanel) {
      setTimeout(() => {
        setModalItem(item);
        setShowItemDetailsModal(true);
        setShowFloorPersonsPanel(true);
      }, 100);
      return;
    }
    setModalItem(item);
    setShowItemDetailsModal(true);
  };

  const handleAddonsSave = ({ addons, note }: { addons: string[]; note: string }) => {
    if (!modalItem) return;
    const customizedItem = {
      ...modalItem, 
      size: modalSize,
      addOns: addons.map((label, idx) => ({ id: String(idx), name: label, price: 0 })),
      notes: note,
    };
    
    if (!currentOrder && !selectedTable) {
      setPendingCustomizedItem(customizedItem);
      setShowAddonsModal(false); setModalItem(null); setModalSize("M");
      return;
    }
    
    addItemToOrder(customizedItem);
    setFeedback(`${modalItem.name} added to order!`);
    setTimeout(() => setFeedback(""), 1200);
    setShowAddonsModal(false); setModalItem(null); setModalSize("M");
  };

  const handleSelectTable = (isQuickOrder: boolean = false) => {
    if (isQuickOrder) {
      startOrder({ tableId: "Quick-Table", floor: selectedFloor, persons });
      setShowFloorPersonsPanel(false);
    } else {
      navigate("/table", { state: { persons, floor: selectedFloor } });
    }
  };

  const handleNextOrder = () => {
    resetOrder();
    setShowOrderSentPanel(false);
    setSelectedTable(null);
    setPersons(1);
    setSelectedFloor(floors[0] || "F-01");
    setSelectedCategory("all");
    setSelectedItemTypeId(null);
    setShowFloorPersonsPanel(false);
    const walkthrough = useWalkthroughStore.getState();
    walkthrough.complete();
  };

  const handleDeleteItem = (itemId: string) => { if (!currentOrder) return; removeOrderItem(itemId); };
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    updateOrderItem(itemId, { quantity: newQty });
  };

  const orderItems = currentOrder?.items || [];
  const subtotal = orderItems.reduce((sum: number, item: any) => {
    const addOnsTotal = (item.addOns?.reduce((a: number, addon: any) => a + (addon.price || 0), 0) || 0) * (item.quantity || 1);
    return sum + item.price * (item.quantity || 1) + addOnsTotal;
  }, 0);
  const tax = Math.round(subtotal * 0.06);
  const total = subtotal + tax;
  const hasKitchenItem = orderItems.some((item: any) => item.preparationStation === "Kitchen");
  const allCounter = orderItems.length > 0 && orderItems.every((item: any) => item.preparationStation === "Counter");

  // --- Order Submissions ---
  const handleOrderAction = async () => {
    if (hasKitchenItem) {
      setShowConfirmationModal(true);
    } else if (allCounter && currentOrder) {
      setOrderSending(true);
      try {
        const tableId = Number(String(currentOrder.tableId || '').replace(/\D/g, ''));
        const mappedItems = currentOrder.items.map((item: any) => ({
          item_id: Number(item.itemId),
          item_Quentry: item.quantity || 1,
          item_size: item.size || "Medium",
          item_note: item.notes || "",
          item_status: "Preparing"
        }));
        
        const result = await createOrder({
          items: mappedItems,
          Tax: tax,
          Customer_id: (currentOrder as any).customerId || 25,
          Dining_Option: "Dine in",
          Table_id: tableId || 2,
          Kitchen_id: (currentOrder as any).kitchenId || 1,
          Order_Status: "Preparing",
          payment_status: "Pending",
          Status: true
        }).unwrap();

        const newOrderId = result?.order?.orderId ?? result?.order?._id ?? result?.data?.orderId ?? result?.data?._id;
        if (newOrderId) setCurrentOrderId(String(newOrderId));
        setShowOrderSentPanel(true);
      } catch (error) { 
        console.error('Failed to send order', error); 
        setFeedback('Failed to create order');
      } finally { 
        setOrderSending(false); 
      }
    }
  };

  const handleConfirmationContinue = async () => {
    if (!currentOrder) return;
    setOrderSending(true);
    try {
      const tableId = Number(String(currentOrder.tableId || '').replace(/\D/g, ''));
      const mappedItems = currentOrder.items.map((item: any) => ({
        item_id: Number(item.itemId),
        item_Quentry: item.quantity || 1,
        item_size: item.size || "Medium",
        item_note: item.notes || "",
        item_status: "Preparing"
      }));

      const result = await createOrder({
        items: mappedItems,
        Tax: tax,
        Customer_id: (currentOrder as any).customerId || 25,
        Dining_Option: "Dine in",
        Table_id: tableId || 2,
        Kitchen_id: (currentOrder as any).kitchenId || 1,
        Order_Status: "Preparing",
        payment_status: "Pending",
        Status: true
      }).unwrap();

      const newOrderId = result?.order?.orderId ?? result?.order?._id ?? result?.data?.orderId ?? result?.data?._id;
      if (newOrderId) {
        setCurrentOrderId(String(newOrderId));
        if (hasKitchenItem) {
          await sendToKitchen({ id: newOrderId }).unwrap().catch(console.warn);
        }
      }
      setShowConfirmationModal(false);
      setShowOrderSentPanel(true);
    } catch (error) { 
      console.error('Failed to send order', error); 
      setFeedback('Failed to create order');
    } finally { 
      setOrderSending(false); 
    }
  };

  /* ============================================================
     RENDER: BAR TAB SCREEN (Isolated)
     ============================================================ */
  if (activeMode === 'Bar' && showBarTabScreen) {
    return <BarTabScreen onBack={() => setShowBarTabScreen(false)} />;
  }

  /* ============================================================
     RENDER: MAIN SCREEN
     ============================================================ */
  return (
    <div className="flex flex-col min-h-screen p-6 bg-[#F8F8F8]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">
          {activeMode === 'Food' ? 'Quick Orders' : 'Bar Management'}
        </h1>

        <div className="flex items-center gap-4">
          {activeMode === 'Bar' && (
            <button onClick={() => setShowBarTabScreen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all">
              <span className="text-lg leading-none">+</span> Open Bar Tab
            </button>
          )}
          
          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button onClick={() => setActiveMode('Food')}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${activeMode === 'Food' ? "bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
              Food
            </button>
            <button onClick={() => setActiveMode('Bar')}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${activeMode === 'Bar' ? "bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
              Bar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* LEFT PANEL - CATEGORIES & ITEMS */}
        <div className="flex-1 bg-white rounded-[32px] shadow-sm p-6 flex flex-col overflow-hidden">
          
          {/* Category Bar */}
          <div className="mb-6 w-full overflow-x-auto">
            <div className="flex gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all text-[13px] whitespace-nowrap ${
                      isActive ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200" : "bg-transparent text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setSelectedItemTypeId(cat.value !== "all" ? cat.value : null);
                      const walkthrough = useWalkthroughStore.getState();
                      const step = walkthrough.steps[walkthrough.currentStep];
                      if (!step?.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui") {
                        setTimeout(() => walkthrough.next(), 100);
                      }
                    }}
                  >
                    {cat.icon && <span className="text-[15px] leading-none flex items-center">{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-[#6A1B9A] rounded-full animate-spin"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400 text-sm">No items found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map((item: any, idx: number) => (
                  <div key={item.itemId + idx}
                    className={`bg-white shadow-sm border border-gray-100 rounded-2xl flex flex-col items-center cursor-pointer transition-all duration-200 min-h-[168px] justify-between py-3 px-2 hover:shadow-md ${
                      idx === 0 ? 'order-item-first' : ''
                    }${idx === 1 ? ' order-item-second' : ''}${idx === 2 ? ' order-item-third' : ''}`}
                    onClick={() => handleAddToCart(item)}>
                    <div className="w-full flex items-center justify-center flex-1 mb-2">
                      <img src={item.image || "https://via.placeholder.com/100x100?text=Item"} alt={item.name} className="w-[92px] h-[92px] object-contain rounded-md" />
                    </div>
                    <div className="text-[13px] font-bold text-center text-gray-900 leading-tight line-clamp-2 mb-1 px-1">{item.name}</div>
                    <div className="text-[12px] font-medium text-gray-500">{item.price} XOF</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {feedback && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full shadow-lg z-50 transition-all animate-bounce">
              {feedback}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div 
          className="w-full lg:w-[320px] bg-white rounded-[28px] shadow-sm flex flex-col items-center justify-center text-center overflow-hidden relative"
          onClick={handleRightPanelClick}
          style={{ cursor: !currentOrder && !selectedTable && !showFloorPersonsPanel && !showOrderSentPanel && !showConfirmationModal ? "pointer" : "default" }}
        >
          {/* 1. Order Sent Panel */}
          {showOrderSentPanel && (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-white">
              <div className="bg-[#F5F5F5] rounded-t-[28px] p-6 w-full text-left">
                <div className="text-xl font-bold text-gray-800">
                  #{currentOrder ? (currentOrder as any).orderId || (Math.random()*1000).toFixed(0) : (Math.random()*1000).toFixed(0)}
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs font-medium text-gray-500">Order Created</div>
                  <div className="text-xs font-medium text-gray-500 text-right">Table - {currentOrder?.tableId?.replace("t-", "")}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <div className="rounded-full p-6 mb-6"><img src={successIcon} alt="success" className="w-24 h-24" /></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Sent!</h2>
                <p className="text-gray-500 text-sm px-8">Your order has been sent successfully.</p>
              </div>
              <button className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all" onClick={handleNextOrder}>
                Next Order
              </button>
            </div>
          )}

          <SuccessModal open={showConfirmationModal} title="Order Sent to Kitchen"
            subtitle="Your Dish has been created and will be updated in the menu in couple of minutes"
            buttonText={orderSending ? "Sending..." : "Continue"} onButtonClick={handleConfirmationContinue} />

          {/* 2. Floor & Persons Panel */}
          {!selectedTable && !currentOrder && showFloorPersonsPanel && !showOrderSentPanel && !showConfirmationModal && (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden person-floor-panel bg-white">
              <div className="bg-gradient-to-b from-[#8E24AA]/20 to-[#E53935]/20 p-6 text-left">
                <div className="text-xl font-bold text-gray-800">Floor Map</div>
                <div className="text-xs font-medium text-gray-600 mt-1">Select Floor and Persons</div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8">
                  <div className="font-semibold text-gray-700 mb-4 text-start">Select Persons:</div>
                  <div className="flex items-center justify-center gap-4">
                    <button className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#8E24AA] to-[#E53935] text-white text-xl flex items-center justify-center shadow-md"
                      onClick={() => { setPersons((p) => { const nv = Math.max(1, p - 1); setPersonsGlobal(nv); return nv; }); }}>–</button>
                    <div className="w-16 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-lg font-bold text-gray-800">{persons}</div>
                    <button className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#8E24AA] to-[#E53935] text-white text-xl flex items-center justify-center shadow-md"
                      onClick={() => { setPersons((p) => { const nv = Math.min(20, p + 1); setPersonsGlobal(nv); return nv; }); }}>+</button>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="font-semibold text-gray-700 mb-4 text-start">Select Floor:</div>
                  <div className="grid grid-cols-3 gap-3">
                    {floors.map((floor) => (
                      <button key={floor}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedFloor === floor ? "bg-gradient-to-b from-[#8E24AA] to-[#E53935] text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                        onClick={() => { setSelectedFloor(floor); setFloor(floor); }}>
                        {floor}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <button className="select-table-panel flex-1 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all"
                  onClick={() => {
                    const walkthrough = useWalkthroughStore.getState();
                    const step = walkthrough.steps[walkthrough.currentStep];
                    if (step?.selector === ".person-floor-panel" && (!step.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui")) {
                      walkthrough.next();
                    }
                    handleSelectTable(false);
                  }}>
                  Select Table
                </button>
                <button className="quick-order-panel flex-1 py-4 text-base font-semibold text-[#8E24AA] bg-white border-l border-gray-200 hover:bg-gray-50 transition-all"
                  onClick={() => handleSelectTable(true)}>
                  Quick Order
                </button>
              </div>
            </div>
          )}

          {/* 3. Initial Prompt */}
          {!selectedTable && !currentOrder && !showOrderSentPanel && !showConfirmationModal && !showFloorPersonsPanel && (
            <div className="flex flex-col items-center justify-center h-full w-full select-table-prompt px-8">
              <div className="text-[22px] font-bold text-[#8A8A8A] leading-[1.6] text-center">Tap to Select Table</div>
              <div className="text-[22px] font-bold text-[#8A8A8A] leading-[1.6] text-center">&amp;</div>
              <div className="text-[22px] font-bold text-[#8A8A8A] leading-[1.6] text-center">Start Order</div>
            </div>
          )}

          {/* 4. Display Selected Table / Start Order */}
          {selectedTable && !currentOrder && !pendingCustomizedItem && !showOrderSentPanel && !showConfirmationModal && (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden">
              <div className="bg-gradient-to-b from-[#8E24AA]/20 to-[#E53935]/20 p-6 text-left">
                <div className="text-2xl font-bold text-gray-800">Start Order</div>
                <div className="text-xs font-medium text-gray-600 mt-1">Floor, Table, Person Display</div>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 gap-6 p-6">
                <div className="flex items-center gap-4 w-full max-w-[200px] text-lg text-gray-700">
                  <img src={personIcon} alt="person icon" className="w-6 h-6" />
                  <span>Persons:</span>
                  <span className="font-bold ml-auto">{persons.toString().padStart(2, "0")}</span>
                </div>
                <div className="flex items-center gap-4 w-full max-w-[200px] text-lg text-gray-700">
                  <img src={floorIcon} alt="floor icon" className="w-6 h-6" />
                  <span>Floor:</span>
                  <span className="font-bold ml-auto">{(selectedFloor ?? "F-01").replace("F-", "")}</span>
                </div>
                <div className="flex items-center gap-4 w-full max-w-[200px] text-lg text-gray-700">
                  <img src={tableIcon} alt="table icon" className="w-6 h-6" />
                  <span>Table:</span>
                  <span className="font-bold ml-auto">{(selectedTable ?? "").replace("t-", "")}</span>
                </div>
              </div>
              <button className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all"
                onClick={() => { startOrder({ tableId: selectedTable, floor: selectedFloor, persons }); }}>
                Start Order
              </button>
            </div>
          )}

          {/* 5. Active Order Summary */}
          {currentOrder && ((currentOrder.items && currentOrder.items.length > 0) || showSummaryPanel) && !showOrderSentPanel && !showConfirmationModal && (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#F9F5F9]">
              <div className="bg-gradient-to-r from-[#D8B4E2] to-[#F4A2A2] py-4 px-5 text-left shrink-0">
                <div className="text-xl font-bold text-gray-900">Order Summary</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">Table -{currentOrder.tableId?.replace("t-", "")}</div>
              </div>

              <div className="flex text-[11px] font-bold text-gray-500 px-5 py-2 border-b border-gray-200 bg-white shrink-0">
                <div className="w-8">Qty</div>
                <div className="flex-1">Item</div>
                <div className="w-10 text-center">Size</div>
                <div className="w-16 text-right">Total</div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 bg-white">
                {orderItems.map((item: any, idx: number) => (
                  <div key={item.itemId + idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col flex-1 pr-2">
                        <span className="text-sm font-bold text-gray-800 leading-tight">
                          {item.quantity || 1} xL {item.name}
                        </span>
                        {item.addOns && item.addOns.length > 0 && (
                          <span className="text-[10px] text-gray-500 mt-0.5">{item.addOns.map((a: any) => a.name).join(", ")}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-gray-800 w-16 text-right">{item.price * (item.quantity || 1)} XOF</span>
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden h-7">
                        <button className="w-7 h-full flex items-center justify-center bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white text-xs font-bold" onClick={() => handleUpdateQuantity(item.itemId, (item.quantity || 1) - 1)}>-</button>
                        <span className="w-9 h-full flex items-center justify-center text-xs font-bold text-gray-800 bg-white">{item.quantity || 1}</span>
                        <button className="w-7 h-full flex items-center justify-center bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white text-xs font-bold" onClick={() => handleUpdateQuantity(item.itemId, (item.quantity || 1) + 1)}>+</button>
                      </div>
                      <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors" onClick={() => handleDeleteItem(item.itemId)} aria-label="Delete item">
                        <img src={TrashIcon} alt="Delete" className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#FDF0F4] p-5 border-t border-gray-200 shrink-0">
                <div className="flex text-xs justify-between text-gray-500 mb-1">
                  <span>Tax 6%</span>
                  <span>{tax.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between items-center font-bold text-sm text-gray-800 mt-2">
                  <span>Subtotal (incl. tax)</span>
                  <span className="text-gray-900">{total.toLocaleString()} XOF</span>
                </div>
              </div>

              <div className="flex flex-col shrink-0">
                {hasKitchenItem && (
                  <button className="w-full py-3.5 text-sm font-bold bg-[#00C853] text-white hover:bg-[#00A844] transition-all disabled:opacity-50" onClick={handleOrderAction} disabled={orderSending || isCreatingOrder || isSendingToKitchen}>
                    {orderSending ? 'Sending...' : 'Send to Kitchen'}
                  </button>
                )}
                {orderItems.length > 0 && (
                  <button className="select-payment-btn w-full py-4 text-base font-bold bg-white text-[#8E24AA] border-t border-gray-200 hover:bg-gray-50 transition-all"
                    onClick={() => { setShowOrderSummaryModal(true); }}
                  >
                    Select Payment Option
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ALL MODALS */}
      <ItemDetailsModal open={showItemDetailsModal} item={modalItem}
        onClose={() => setShowItemDetailsModal(false)}
        onSelect={(size) => { setModalSize(size); setShowItemDetailsModal(false); setTimeout(() => setShowAddonsModal(true), 100); }} />
      
      <AddonsModal open={showAddonsModal} item={modalItem} selectedSize={modalSize} tableId={currentOrder?.tableId}
        onClose={() => setShowAddonsModal(false)} onSave={handleAddonsSave} />
      
      <OrderSummaryModal open={showOrderSummaryModal} onClose={() => setShowOrderSummaryModal(false)}
        order={{ items: orderItems, subtotal, tax, total, orderId: (currentOrder as any)?.orderId, paymentType: '', customerName: '' }}
        onUpdateItemQuantity={(itemId, newQty) => { updateOrderItem(itemId, { quantity: newQty }); }}
        onChoosePaymentOption={() => { setShowOrderSummaryModal(false); setTimeout(() => setShowPaymentOptions(true), 200); }} />
      
      <PaymentModal open={showPaymentOptions} onClose={() => setShowPaymentOptions(false)} total={total}
        onConfirm={async (method) => {
          const orderId = (currentOrder as any)?.orderId;
          if (!orderId) {
            setFeedback('Order has not been saved to the server yet.');
            setTimeout(() => setFeedback(""), 2500);
            return;
          }
          try {
            await updateOrder({
              id: orderId,
              paymentDetails: { method, status: 'Paid', paidAt: new Date().toISOString() },
              Order_Status: 'Completed',
            }).unwrap();
            setShowPaymentOptions(false);
            setShowSuccessModal(true);
          } catch (err: any) {
            console.error('Payment update failed', err);
            setFeedback(err?.data?.message || 'Payment update failed');
            setTimeout(() => setFeedback(""), 2500);
          }
        }} />
      
      <SuccessModal open={showSuccessModal} title="Payment Received Successful !"
        subtitle="Your payment has been processed and the order has been updated."
        buttonText="Start new Order"
        onButtonClick={() => {
          setShowSuccessModal(false);
          resetOrder();
          startOrder({ tableId: '', floor: '', persons: 1 });
          setSelectedTable(null);
          setSelectedFloor(floors[0] || "F-01");
          setSelectedCategory("all");
          setSelectedItemTypeId(null);
        }} />
    </div>
  );
};

export default Orders;