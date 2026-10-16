/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useOrderFlowStore } from "@/store/zustandStores";
import { useNavigate, useLocation } from "react-router-dom";
import ItemDetailsModal from "@/components/common/ItemDetailsModal";
import AddonsModal from "@/components/common/AddonsModal";
import personIcon from "@/assets/user_icon.svg";
import floorIcon from "@/assets/floor_icon.svg";
import tableIcon from "@/assets/table_filled_icon.svg";
import TrashIcon from "@/assets/Trash.svg";
import { SuccessModal } from "@/components/common/SuccessModal";
import successIcon from '@/assets/order/success_icon_large.svg';
import { createOrder, updateOrder } from '@/api/orderApi';
import type { OrderStatus } from '@/types/order';
import OrderSummaryModal from "@/components/common/OrderSummaryModal";
import PaymentModal from "@/components/common/PaymentModal";
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useWalkthroughUIStore } from '@/store/zustandStores';
import ReadyToScanModal from "@/components/common/ReadyToScanModal";
import ReadyToPayModal from "@/components/common/ReadyToPayModal";
import PaymentDoneModal from "@/components/common/PaymentDoneModal";
import { tableTrainingSteps } from "@/walkthrough/steps";
import {
  useGetAllItemsQuery,
  useGetAllItemTypesQuery,
  useGetItemTypeByIdQuery,
  useGetAllFloorsQuery,
} from "@/redux/api/quickOrderSlice";

// ---- LOCAL FIGMA IMAGES ----
import image1 from '../../assets/order/DoubleChocolateFrappe.png';
import image2 from '../../assets/order/MCSignature.png';
import image3 from '../../assets/order/MOPBBPilot_BigMac.png';
import image4 from '../../assets/order/MOP_BBPilot_Buttermilk.png';
import image5 from '../../assets/order/MOP_BBPilot_McSpicy.png';
import image6 from '../../assets/order/Nuggets.png';

/* ---------------- FIGMA FALLBACK ---------------- */
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

/* ---------------- BAR TAB TYPES ---------------- */
interface BarTabItem { id: string; quantity: number; name: string; modifiers: string[]; }
interface BarTab { id: string; name: string; table: string; waiter: string; time: string; status: 'Open' | 'Closed'; items: BarTabItem[]; runningTotal: number; }

const initialTabs: BarTab[] = [
  { id: '1', name: 'Ahmed', table: 'Table #7', waiter: 'Waiter - Sara', time: '5 min ago', status: 'Open',
    items: [
      { id: 'i1', quantity: 2, name: 'Whiskey on the rocks', modifiers: [] },
      { id: 'i2', quantity: 1, name: 'Mojito - extra lime', modifiers: [] },
      { id: 'i3', quantity: 1, name: 'Heineken', modifiers: [] },
    ], runningTotal: 52.00 },
  { id: '2', name: 'Sara', table: 'Table #7', waiter: 'Waiter - Ahmed', time: '12 min ago', status: 'Open',
    items: [
      { id: 'i4', quantity: 2, name: 'Glass of wine', modifiers: [] },
      { id: 'i5', quantity: 1, name: 'Cheese platter', modifiers: [] },
    ], runningTotal: 67.50 },
  { id: '3', name: 'Group', table: 'Table #9', waiter: 'Waiter - Yasmine', time: '18 min ago', status: 'Open',
    items: [
      { id: 'i6', quantity: 4, name: 'Draft beer', modifiers: [] },
      { id: 'i7', quantity: 2, name: 'Nachos - no jalapeno', modifiers: [] },
      { id: 'i8', quantity: 1, name: 'Sparkling water', modifiers: [] },
    ], runningTotal: 89.00 },
];

const modifiersList = ['On the rocks','Extra lime','No ice','Double shot','Neat','Extra mint','Salt rim','Virgin'];

const Orders: React.FC = () => {
  const {
    currentOrder, pendingItem, pendingCustomizedItem,
    setPendingCustomizedItem, clearPendingCustomizedItem,
    addItemToOrder, resetOrder, startOrder, updateOrderItem,
    setCurrentOrderId, removeOrderItem, setFloor,
    setPersons: setPersonsGlobal, setInOrderFlow,
  } = useOrderFlowStore();

  const [activeMode, setActiveMode] = useState<'Food' | 'Bar'>('Food');
  const [showBarTabScreen, setShowBarTabScreen] = useState(false);

  const [isHappyHourActive, setIsHappyHourActive] = useState(false);
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const [clientName, setClientName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [drinksModifiers, setDrinksModifiers] = useState('');

  const [feedback, setFeedback] = useState("");
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [modalItem, setModalItem] = useState(null as any);
  const [modalSize, setModalSize] = useState("M");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOrderSentPanel, setShowOrderSentPanel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [persons, setPersons] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState("F-01");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showFloorPersonsPanel, setShowFloorPersonsPanel] = useState(false);
  const [orderSending, setOrderSending] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showReadyToScan, setShowReadyToScan] = useState(false);
  const [showReadyToPay, setShowReadyToPay] = useState(false);

  const selectedCategory = useWalkthroughUIStore((s) => s.selectedCategory);
  const setSelectedCategory = useWalkthroughUIStore((s) => s.setSelectedCategory);

  const { steps, currentStep, isActive, next } = useWalkthroughStore();
  const [orderSummaryClickable, setOrderSummaryClickable] = useState(true);

  // ---------- API ----------
  const { data: itemTypesData, isLoading: itemTypesLoading } = useGetAllItemTypesQuery();
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery();
  const { data: floorsData } = useGetAllFloorsQuery();

  const [selectedItemTypeId, setSelectedItemTypeId] = useState<string | null>(null);
  const { data: selectedItemType, isLoading: selectedItemTypeLoading } =
    useGetItemTypeByIdQuery(selectedItemTypeId as string, { skip: !selectedItemTypeId });

  // ---------- FLOORS ----------
  const floors = useMemo<string[]>(() => {
    const apiFloors = (floorsData?.data || []).map((f: any) => f.Floor_Name);
    return apiFloors.length > 0 ? apiFloors : ["F-01", "F-02", "F-03"];
  }, [floorsData]);

  // ---------- CATEGORIES ----------
  const categories = useMemo(() => {
    const apiCats = itemTypesData?.data?.map((type: any) => ({
      label: type.Name,
      value: type.Items_types_id.toString(),
      icon: type.emozi || null,
    })) || [];
    return [{ label: "All Items", value: "all", icon: null }, ...apiCats];
  }, [itemTypesData]);

  // ---------- ALL ITEMS ----------
  const apiMenuItems = useMemo(() => {
    return (itemsData?.data || []).map((item: any) => {
      const cat = item.Category || {};
      const typeId = cat.Items_types_id?.toString();
      const typeName = cat.Name || "";
      const apiImg = item.image_url || item.image || null;
      const figmaImg = getFigmaImage(item["item-name"]);
      return {
        itemId: item.Items_id?.toString(),
        name: item["item-name"],
        price: item["item-price"],
        image: figmaImg || apiImg,
        itemType: typeId,
        categoryName: typeName,
        preparationStation: isCounterItem(typeName) ? "Counter" : "Kitchen",
      };
    });
  }, [itemsData]);

  // ---------- CATEGORY ITEMS ----------
  const apiCategoryItems = useMemo(() => {
    return (selectedItemType?.data || []).map((item: any) => {
      const cat = item.Category || {};
      const typeId = cat.Items_types_id?.toString();
      const typeName = cat.Name || "";
      const apiImg = item.image_url || item.image || null;
      const figmaImg = getFigmaImage(item["item-name"]);
      return {
        itemId: item.Items_id?.toString(),
        name: item["item-name"],
        price: item["item-price"],
        image: figmaImg || apiImg,
        itemType: typeId,
        categoryName: typeName,
        preparationStation: isCounterItem(typeName) ? "Counter" : "Kitchen",
      };
    });
  }, [selectedItemType]);

  // ---------- FINAL LIST ----------
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all" || !selectedCategory) {
      return apiMenuItems.length > 0 ? apiMenuItems : FIGMA_FALLBACK_ITEMS;
    }
    return apiCategoryItems;
  }, [selectedCategory, apiMenuItems, apiCategoryItems]);

  const isLoading = itemTypesLoading || itemsLoading || selectedItemTypeLoading;

  // ---------- EFFECTS ----------
  useEffect(() => {
    if (isActive && steps[currentStep]?.selector === ".select-payment-btn") setOrderSummaryClickable(true);
  }, [isActive, steps, currentStep]);

  useEffect(() => { setInOrderFlow(true); }, [setInOrderFlow]);

  useEffect(() => {
    if (pendingItem && currentOrder) { setModalItem(pendingItem); setShowItemDetailsModal(true); }
  }, [pendingItem, currentOrder]);

  useEffect(() => {
    if (pendingCustomizedItem && selectedTable && currentOrder) {
      addItemToOrder(pendingCustomizedItem);
      clearPendingCustomizedItem();
    }
  }, [pendingCustomizedItem, selectedTable, currentOrder]);

  useEffect(() => {
    if (pendingCustomizedItem && selectedTable && !currentOrder) {
      startOrder({ tableId: selectedTable, floor: selectedFloor, persons });
    }
  }, [pendingCustomizedItem, selectedTable, currentOrder, selectedFloor, persons]);

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

  // ---------- HANDLERS ----------
  const itemHasSize = () => true;

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
        if (itemHasSize()) setShowItemDetailsModal(true); else setShowAddonsModal(true);
        setShowFloorPersonsPanel(true);
      }, 100);
      return;
    }
    setModalItem(item);
    if (itemHasSize()) setShowItemDetailsModal(true); else setShowAddonsModal(true);
  };

  const handleAddonsSave = ({ addons, note }: { addons: string[]; note: string }) => {
    if (!modalItem) return;
    const dummyAddons = [
      { label: "No Ice", price: 0 }, { label: "Less Sugar", price: 0 }, { label: "No Sugar", price: 0 },
      { label: "Extra Cream", price: 20 }, { label: "Extra Toppings", price: 20 }, { label: "Extra Thick", price: 20 },
    ];
    const customizedItem = {
      ...modalItem, size: modalSize,
      addOns: addons.map((label, idx) => {
        const found = dummyAddons.find(a => a.label === label);
        return { id: String(idx), name: label, price: found ? found.price : 0 };
      }),
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

  const orderItems = currentOrder?.items || [];
  const subtotal = orderItems.reduce((sum: number, item: any) => {
    const addOnsTotal = (item.addOns?.reduce((a: number, addon: any) => a + (addon.price || 0), 0) || 0) * (item.quantity || 1);
    return sum + item.price * (item.quantity || 1) + addOnsTotal;
  }, 0);
  const tax = Math.round(subtotal * 0.06);
  const total = subtotal + tax;
  const hasKitchenItem = orderItems.some((item: any) => item.preparationStation === "Kitchen");
  const allCounter = orderItems.length > 0 && orderItems.every((item: any) => item.preparationStation === "Counter");

  const handleOrderAction = async () => {
    if (hasKitchenItem) setShowConfirmationModal(true);
    else if (allCounter) setTimeout(() => setShowOrderSentPanel(true), 800);
  };

  const handleConfirmationContinue = async () => {
    if (!currentOrder) return;
    setOrderSending(true);
    try {
      
      const mappedItems = currentOrder.items.map((item: any) => ({
        item_id: Number(item.itemId),
        item_Quentry: item.quantity || 1,
        item_Variants_id: item.variantId ? Number(item.variantId) : undefined,
        item_Addons_id: item.addOns && item.addOns.length > 0 ? Number(item.addOns[0].id) : undefined,
        item_size: item.size || "Medium",
        item_note: item.notes || "",
        item_status: "Preparing"
      }));

      const orderPayload = {
        items: mappedItems,
        Tax: tax,
        Customer_id: (currentOrder as any).customerId || 25,
        Dining_Option: "Dine in",
        Table_id: Number(currentOrder.tableId.replace(/\D/g, '')) || 2,
        Kitchen_id: (currentOrder as any).kitchenId || 1,
        Order_Status: "Preparing",
        payment_status: "Pending",
        Status: true
      };

      const result = await createOrder(orderPayload as any);
      if (result && result.order && result.order.orderId) setCurrentOrderId(result.order.orderId);
      setShowConfirmationModal(false);
      setShowOrderSentPanel(true);
    } catch (error) { 
      console.error('Failed to send order', error); 
    }
    finally { setOrderSending(false); }
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

  const handleSelectTable = (isQuickOrder: boolean = false) => {
    if (isQuickOrder) {
      startOrder({ tableId: "Quick-Table", floor: selectedFloor, persons });
      setShowFloorPersonsPanel(false);
    } else {
      navigate("/table", { state: { persons, floor: selectedFloor } });
    }
    
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (step?.selector === ".select-table" && (!step.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui")) {
      walkthrough.next();
    }
  };

  useEffect(() => {
    if (selectedTable && showFloorPersonsPanel) setShowFloorPersonsPanel(false);
  }, [selectedTable, showFloorPersonsPanel]);

  const handleDeleteItem = (itemId: string) => { if (!currentOrder) return; removeOrderItem(itemId); };
  const handleToggleAllergy = (itemId: string) => {
    if (!currentOrder) return;
    const item = currentOrder.items.find((i: any) => i.itemId === itemId);
    if (!item) return;
    updateOrderItem(itemId, { allergy: !item.allergy });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    updateOrderItem(itemId, { quantity: newQty });
  };

  (window as any).handleSelectTable = handleSelectTable;
  (window as any).handleRightPanelClick = handleRightPanelClick;

  useEffect(() => {
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (walkthrough.isActive && step?.selector === ".order-item-first" &&
        filteredItems.length > 0 && document.querySelector(".order-item-first")) { /* No-op */ }
  }, [filteredItems]);

  useEffect(() => {
    const step = steps[currentStep];
    if (isActive && step && step.selector === '.order-summary-panel') setOrderSummaryClickable(false);
    else setOrderSummaryClickable(true);
  }, [steps, currentStep, isActive]);

  useEffect(() => {
    if (showReadyToScan) {
      const t = setTimeout(() => { setShowReadyToScan(false); setShowReadyToPay(true); next(); }, 2000);
      return () => clearTimeout(t);
    }
  }, [showReadyToScan, next]);

  useEffect(() => {
    if (showReadyToPay) {
      const t = setTimeout(() => { setShowReadyToPay(false); next(); }, 2000);
      return () => clearTimeout(t);
    }
  }, [showReadyToPay, next]);

  const handlePaymentDoneClose = () => {
    setShowPaymentOptions(false);
    setShowOrderSentPanel(true);
    next();
    navigate('/orders');
  };

  const { completed, activeTraining, startTraining, reset } = useWalkthroughStore();
  useEffect(() => {
    if (completed && activeTraining === "order") {
      reset();
      setTimeout(() => { startTraining("table", tableTrainingSteps); navigate("/"); }, 50);
    }
  }, [completed, activeTraining, startTraining, reset, navigate]);

  /* ============================================================
     BAR TAB SCREEN
     ============================================================ */
  if (activeMode === 'Bar' && showBarTabScreen) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] p-8 font-sans text-gray-800 relative">
        <style>{`
          .hover-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .hover-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .hover-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; transition: background-color 0.2s ease; }
          .hover-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; }
          .hover-scrollbar:hover::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
          .hover-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
          .hover-scrollbar:hover { scrollbar-color: #cbd5e1 transparent; }
        `}</style>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <button onClick={() => setShowBarTabScreen(false)} className="hover:text-[#8E24AA] transition-colors text-gray-900">
              Bar Management
            </button>
            <span className="text-gray-400 font-light text-xl">{'>'}</span>
            <span className="text-gray-900">Bar tab</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-between px-4 py-2 rounded-full shadow-sm cursor-pointer transition-colors duration-300 w-[175px] ${isHappyHourActive ? 'bg-[#00C853]' : 'bg-[#FF3B30]'}`}
              onClick={() => setIsHappyHourActive(!isHappyHourActive)}>
              <div className="relative w-10 h-5 bg-white rounded-full flex-shrink-0 shadow-inner">
                <div className={`absolute w-4 h-4 rounded-full bg-[#8E24AA] shadow-md transform transition-transform duration-300 top-0.5 ${isHappyHourActive ? 'translate-x-[22px]' : 'translate-x-0.5'}`}></div>
              </div>
              <span className="text-[11px] font-bold text-white leading-none whitespace-nowrap">
                {isHappyHourActive ? 'Happy Hour Active' : 'Happy Hour Inactive'}
              </span>
            </div>

            <button onClick={() => setShowAddTabModal(true)}
              className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-1 whitespace-nowrap">
              + Open New Tab
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8 max-h-[60vh] overflow-y-auto pr-2 hover-scrollbar">
          {initialTabs.map((tab) => (
            <div key={tab.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="p-4 pb-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{tab.name} - {tab.table}</h3>
                  <span className="text-[9px] font-bold text-[#E53935] bg-[#FFEBEE] px-1.5 py-0.5 rounded uppercase tracking-wider">{tab.status}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {tab.waiter} <span className="mx-1">•</span> {tab.time}
                </p>
              </div>
              <div className="px-4 flex-1 min-h-[100px] mb-2">
                <ul className="space-y-1.5">
                  {tab.items.map((item) => (
                    <li key={item.id} className="text-xs text-gray-700">
                      <span className="font-bold">{item.quantity}x</span> {item.name}
                      {item.modifiers.length > 0 && (<span className="text-gray-400"> - {item.modifiers.join(', ')}</span>)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 pt-2 border-t border-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500 font-medium">Running total</span>
                  <span className="text-sm font-bold text-gray-900">${tab.runningTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddItemModal(true)} className="flex-1 bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white py-1.5 rounded-md text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                    + Add Item
                  </button>
                  <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50 transition-all">
                    Close tab
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-300 rounded-xl p-4 bg-white/40">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
            Drinks Modifiers - Quick Entry
          </h4>
          <div className="flex flex-wrap gap-2 mb-3 max-h-[120px] overflow-y-auto pr-2 hover-scrollbar">
            {modifiersList.map((mod, index) => {
              const isHighlighted = index < 3;
              return (
                <button key={mod} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isHighlighted ? 'bg-[#F3E5F5] text-[#8E24AA] border border-[#E1BEE7]' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}>
                  {mod}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 font-medium">
            Active modifiers highlighted in dark color - Happy hour 10% discount auto-applied to drinks until 8:00 PM
          </p>
        </div>

        {showAddTabModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
                <h2 className="text-xl font-bold mb-1">Add New Tab</h2>
                <p className="text-xs text-white/80">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
                <button onClick={() => setShowAddTabModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">✕</button>
              </div>
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Client Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g., Ahmad Aminoff" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Table No <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g., #7" value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Drink's Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" placeholder="e.g., Corona" value={drinkName} onChange={(e) => setDrinkName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] pr-8" />
                      <span className="absolute right-3 top-2 text-[#8E24AA] font-bold text-lg cursor-pointer">+</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Drinks Modifiers</label>
                    <div className="relative">
                      <select value={drinksModifiers} onChange={(e) => setDrinksModifiers(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] appearance-none bg-white">
                        <option value="">Select modifiers</option>
                        <option value="on-the-rocks">On the rocks</option>
                        <option value="extra-lime">Extra lime</option>
                        <option value="no-ice">No ice</option>
                      </select>
                      <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">▼</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <button className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                    + Add Item
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 flex gap-3">
                <button onClick={() => setShowAddTabModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                <button className="flex-1 bg-[#8E24AA] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#7B1FA2] transition-all shadow-md">Add</button>
              </div>
            </div>
          </div>
        )}

        {showAddItemModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
                <h2 className="text-xl font-bold mb-1">Add New Item</h2>
                <p className="text-xs text-white/80">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
                <button onClick={() => setShowAddItemModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">✕</button>
              </div>
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Drink's Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" placeholder="e.g., Corona" value={drinkName} onChange={(e) => setDrinkName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] pr-8" />
                      <span className="absolute right-3 top-2 text-[#8E24AA] font-bold text-lg cursor-pointer">+</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Drinks Modifiers</label>
                    <div className="relative">
                      <select value={drinksModifiers} onChange={(e) => setDrinksModifiers(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] appearance-none bg-white">
                        <option value="">Select modifiers</option>
                        <option value="on-the-rocks">On the rocks</option>
                        <option value="extra-lime">Extra lime</option>
                        <option value="no-ice">No ice</option>
                      </select>
                      <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">▼</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <button className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                    + Add Item
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 flex gap-3">
                <button onClick={() => setShowAddItemModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                <button className="flex-1 bg-[#8E24AA] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#7B1FA2] transition-all shadow-md">Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ============================================================
     MAIN FOOD MENU SCREEN
     ============================================================ */
  return (
    <div className="flex flex-col min-h-screen p-6 bg-[#F8F8F8]">
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
            <button onClick={() => { setActiveMode('Food'); setShowBarTabScreen(false); }}
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
        <div className="flex-1 bg-white rounded-[32px] shadow-sm p-6 flex flex-col overflow-hidden">
          {/* Category Bar */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1 bg-[#F2F2F2] rounded-full p-1.5">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button key={cat.value}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap text-[13px] ${
                      isActive ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-600 hover:text-gray-900"
                    } ${cat.value === "all" ? "all-items-tab" : ""}`}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setSelectedItemTypeId(cat.value !== "all" ? cat.value : null);
                      const walkthrough = useWalkthroughStore.getState();
                      const step = walkthrough.steps[walkthrough.currentStep];
                      if (!step?.advanceOn || step.advanceOn === 'both' || step.advanceOn === 'ui') {
                        setTimeout(() => walkthrough.next(), 100);
                      }
                    }}>
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
              <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                No items found.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map((item: any, idx: number) => (
                  <div key={item.itemId + idx}
                    className={`bg-white rounded-2xl flex flex-col items-center cursor-pointer transition-all duration-200 min-h-[168px] justify-between py-3 px-2 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] ${
                      idx === 0 ? 'order-item-first' : ''
                    }${idx === 1 ? ' order-item-second' : ''}${idx === 2 ? ' order-item-third' : ''}`}
                    onClick={() => {
                      const walkthrough = useWalkthroughStore.getState();
                      const step = walkthrough.steps[walkthrough.currentStep];
                      if (walkthrough.isActive && (step?.selector === ".order-item-first" || step?.selector === ".order-item-second" || step?.selector === ".order-item-third")) {
                        addItemToOrder({ ...item, quantity: 1 });
                        walkthrough.next();
                        return;
                      }
                      handleAddToCart(item);
                    }}>
                    <div className="w-full flex items-center justify-center flex-1 mb-2">
                      <img src={item.image || "https://via.placeholder.com/100x100?text=Item"} alt={item.name} className="w-[92px] h-[92px] object-contain" />
                    </div>
                    <div className="text-[13px] font-bold text-center text-gray-900 leading-tight line-clamp-2 mb-1 px-1">{item.name}</div>
                    <div className="text-[12px] font-normal text-gray-500">{item.price} XOF</div>
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

        {/* Right Panel */}
        <div className="w-full lg:w-[320px] bg-white rounded-[28px] shadow-sm flex flex-col items-center justify-center text-center overflow-hidden relative"
          onClick={handleRightPanelClick}
          style={{ cursor: !currentOrder && !selectedTable && !showFloorPersonsPanel && !showOrderSentPanel && !showConfirmationModal ? "pointer" : "default" }}>

          {showOrderSentPanel && (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden order-sent-panel bg-white">
              <div className="bg-[#F5F5F5] rounded-t-[28px] p-6 w-full text-left">
                <div className="text-xl font-bold text-gray-800">#{currentOrder ? (currentOrder as any).orderId || (Math.random()*1000).toFixed(0) : (Math.random()*1000).toFixed(0)}</div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs font-medium text-gray-500">Order Created</div>
                  <div className="text-xs font-medium text-gray-500 text-right">Table - {currentOrder?.tableId.replace("t-", "")}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <div className="rounded-full p-6 mb-6"><img src={successIcon} alt="success" className="w-24 h-24" /></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Sent!</h2>
                <p className="text-gray-500 text-sm px-8">Your order has been sent to the kitchen successfully.</p>
              </div>
              <button className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all" onClick={handleNextOrder}>
                Next Order
              </button>
            </div>
          )}

          <SuccessModal open={showConfirmationModal} title="Order Sent to Kitchen"
            subtitle="Your Dish has been created and will be updated in the menu in couple of minutes"
            buttonText={orderSending ? "Sending..." : "Continue"} onButtonClick={handleConfirmationContinue} />

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

          {!selectedTable && !currentOrder && !showOrderSentPanel && !showConfirmationModal && !showFloorPersonsPanel && (
            <div className="flex flex-col items-center justify-center h-full w-full select-table-prompt px-8" onClick={handleRightPanelClick}>
              <div className="text-[22px] font-bold text-[#8A8A8A] leading-[1.6] text-center">Tap to Select Table</div>
              <div className="text-[22px] font-bold text-[#8A8A8A] leading-[1.6] text-center">&amp;</div>
              <div className="text-[22px] font-bold text-[#8A8A8A] leading-[1.6] text-center">Start Order</div>
            </div>
          )}

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

          {/* ================= EXACT FIGMA DESIGN ORDER SUMMARY PANEL ================= */}
          {(currentOrder && ((currentOrder.items && currentOrder.items.length > 0) || showSummaryPanel) && !showOrderSentPanel && !showConfirmationModal) && (
            <div className="order-summary-panel w-full h-full flex flex-col justify-between overflow-hidden bg-[#F9F5F9]"
              style={{ pointerEvents: orderSummaryClickable ? 'auto' : 'none', opacity: orderSummaryClickable ? 1 : 0.6 }}>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D8B4E2] to-[#F4A2A2] py-4 px-5 text-left shrink-0">
                <div className="text-xl font-bold text-gray-900">Order Summary</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">Table -{currentOrder.tableId.replace("t-", "")}</div>
              </div>

              {/* Column Headers */}
              <div className="flex text-[11px] font-bold text-gray-500 px-5 py-2 border-b border-gray-200 bg-white shrink-0">
                <div className="w-8">Qty</div>
                <div className="flex-1">Item</div>
                <div className="w-10 text-center">Size</div>
                <div className="w-16 text-right">Total</div>
              </div>

              {/* Scrollable Item List */}
              <div className="flex-1 overflow-y-auto px-5 py-3 bg-white">
                {Object.entries(
                  orderItems.reduce((acc: any, item: any) => {
                    const cat = item.categoryName || "Main Course";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]: [string, any]) => (
                  <div key={category} className="mb-5">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {category.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-blue-500">{category}</span>
                    </div>

                    {/* Items in Category */}
                    {items.map((item: any, idx: number) => (
                      <div key={item.itemId + idx} className="mb-4">
                        {/* Top Row: Name, Allergy, Price */}
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col flex-1 pr-2">
                            <span className="text-sm font-bold text-gray-800 leading-tight">
                              {item.quantity || 1} xL {item.name}
                            </span>
                            {item.addOns && item.addOns.length > 0 && (
                              <span className="text-[10px] text-gray-500 mt-0.5">
                                {item.addOns.map((a: any) => a.name).join(", ")}
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-[10px] text-gray-500 mt-0.5 italic">"{item.notes}"</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${item.allergy ? "bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white shadow-sm" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
                              onClick={() => handleToggleAllergy(item.itemId)}>
                              Allergy
                            </button>
                            <span className="text-sm font-bold text-gray-800 w-16 text-right">{item.price * (item.quantity || 1)} XOF</span>
                          </div>
                        </div>

                        {/* Bottom Row: Controls */}
                        <div className="flex justify-end items-center gap-2 mt-2">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden h-7">
                            <button className="w-7 h-full flex items-center justify-center bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white text-xs font-bold" onClick={() => handleUpdateQuantity(item.itemId, (item.quantity || 1) - 1)}>-</button>
                            <span className="w-9 h-full flex items-center justify-center text-xs font-bold text-gray-800 bg-white">{item.quantity || 1}</span>
                            <button className="w-7 h-full flex items-center justify-center bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white text-xs font-bold" onClick={() => handleUpdateQuantity(item.itemId, (item.quantity || 1) + 1)}>+</button>
                          </div>
                          
                          {/* Delete Button */}
                          <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors" onClick={() => handleDeleteItem(item.itemId)} aria-label="Delete item">
                            <img src={TrashIcon} alt="Delete" className="w-3.5 h-3.5 opacity-60" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer Summary */}
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

              {/* Action Buttons */}
              <div className="flex flex-col shrink-0">
                {orderItems.length > 0 && orderItems.some((item: any) => item.itemType !== "Beverage") && (
                  <button className="w-full py-3.5 text-sm font-bold bg-[#00C853] text-white hover:bg-[#00A844] transition-all" onClick={handleOrderAction}>
                    Send to Kitchen
                  </button>
                )}
                {orderItems.length > 0 && (
                  <button className="select-payment-btn w-full py-4 text-base font-bold bg-white text-[#8E24AA] border-t border-gray-200 hover:bg-gray-50 transition-all"
                    onClick={() => {
                      setShowOrderSummaryModal(true);
                      const walkthrough = useWalkthroughStore.getState();
                      const step = walkthrough.steps[walkthrough.currentStep];
                      if (step?.selector === ".select-payment-btn" && (!step.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui")) walkthrough.next();
                    }}
                    disabled={!orderSummaryClickable}
                    style={{ pointerEvents: orderSummaryClickable ? 'auto' : 'none', opacity: orderSummaryClickable ? 1 : 0.6 }}>
                    Select Payment Option
                  </button>
                )}
              </div>
            </div>
          )}

          {currentOrder && currentOrder.items && currentOrder.items.length === 0 && !showOrderSentPanel && !showConfirmationModal && !showSummaryPanel && (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden">
              <div className="bg-gradient-to-b from-[#8E24AA]/20 to-[#E53935]/20 p-6 text-left">
                <div className="text-2xl font-bold text-gray-800">Start Order</div>
                <div className="text-xs font-medium text-gray-600 mt-1">Floor, Table, Person Display</div>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 gap-6 p-6">
                <div className="flex items-center gap-4 w-full max-w-[200px] text-lg text-gray-700">
                  <img src={personIcon} alt="person icon" className="w-6 h-6" />
                  <span>Persons:</span><span className="font-bold ml-auto">{persons.toString().padStart(2, "0")}</span>
                </div>
                <div className="flex items-center gap-4 w-full max-w-[200px] text-lg text-gray-700">
                  <img src={floorIcon} alt="floor icon" className="w-6 h-6" />
                  <span>Floor:</span><span className="font-bold ml-auto">{(selectedFloor ?? "F-01").replace("F-", "")}</span>
                </div>
                <div className="flex items-center gap-4 w-full max-w-[200px] text-lg text-gray-700">
                  <img src={tableIcon} alt="table icon" className="w-6 h-6" />
                  <span>Table:</span><span className="font-bold ml-auto">{(selectedTable ?? "").replace("t-", "")}</span>
                </div>
              </div>
              <button className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-all" onClick={() => { setShowSummaryPanel(true); }}>
                Start Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
          if (isActive) return;
          const orderId = (currentOrder && (currentOrder as any).orderId) || `${currentOrder?.tableId}-${currentOrder?.floor}-${currentOrder?.persons}`;
          if (currentOrder && orderId) {
            await updateOrder(orderId, { paymentDetails: { method, status: 'Paid' } });
            const subtotal = currentOrder.items.reduce((sum: number, item: any) => {
              const addOnsTotal = (item.addOns?.reduce((a: number, addon: any) => a + (addon.price || 0), 0) || 0) * (item.quantity || 1);
              return sum + item.price * (item.quantity || 1) + addOnsTotal;
            }, 0);
            const tax = Math.round(subtotal * 0.06);
            const total = subtotal + tax;
            const now = new Date().toISOString();
            await createOrder({
              orderId, status: 'Pending', orderType: 'Dine-In',
              tableInfo: { tableId: currentOrder.tableId, floor: currentOrder.floor, status: 'Occupied' },
              waiterName: 'John Doe',
              pricingSummary: { subtotal, tax, discount: 0, serviceCharge: 0, totalAmount: total },
              paymentDetails: { method, status: 'Paid' },
              items: currentOrder.items,
              createdAt: now, updatedAt: now,
              statusHistory: [{ status: 'Pending' as OrderStatus, at: now }],
            });
            setShowPaymentOptions(false);
            setShowSuccessModal(true);
          }
        }} />
      {isActive && steps[currentStep]?.selector === '.ready-to-scan-modal' && (<ReadyToScanModal onClose={() => setTimeout(next, 2000)} />)}
      {isActive && steps[currentStep]?.selector === '.ready-to-pay-modal' && (<ReadyToPayModal onClose={() => setTimeout(next, 2000)} />)}
      {isActive && steps[currentStep]?.selector === '.payment-done-modal' && (<PaymentDoneModal onClose={handlePaymentDoneClose} />)}
      <SuccessModal open={showSuccessModal} title="Payment Received Successful !"
        subtitle="Your payment has been processed and the order has been updated."
        buttonText="Start new Order"
        onButtonClick={() => {
          setShowSuccessModal(false);
          resetOrder();
          const newOrderId = Date.now().toString();
          startOrder({ tableId: '', floor: '', persons: 1, orderId: newOrderId });
          navigate('/orders', { state: { showOrderSentPanel: true } });
        }} />
    </div>
  );
};

export default Orders;