import React, { useState } from 'react';

// --- Types ---
interface BarTabItem {
  id: string;
  quantity: number;
  name: string;
  modifiers: string[];
}

interface BarTab {
  id: string;
  name: string;
  table: string;
  waiter: string;
  time: string;
  status: 'Open' | 'Closed';
  items: BarTabItem[];
  runningTotal: number;
}

// --- Dummy Data ---
const initialTabs: BarTab[] = [
  {
    id: '1',
    name: 'Ahmed',
    table: 'Table #7',
    waiter: 'Waiter - Sara',
    time: '5 min ago',
    status: 'Open',
    items: [
      { id: 'i1', quantity: 2, name: 'Whiskey on the rocks', modifiers: [] },
      { id: 'i2', quantity: 1, name: 'Mojito - extra lime', modifiers: [] },
      { id: 'i3', quantity: 1, name: 'Heineken', modifiers: [] },
    ],
    runningTotal: 52.00,
  },
  {
    id: '2',
    name: 'Sara',
    table: 'Table #7',
    waiter: 'Waiter - Ahmed',
    time: '12 min ago',
    status: 'Open',
    items: [
      { id: 'i4', quantity: 2, name: 'Glass of wine', modifiers: [] },
      { id: 'i5', quantity: 1, name: 'Cheese platter', modifiers: [] },
    ],
    runningTotal: 67.50,
  },
  {
    id: '3',
    name: 'Group',
    table: 'Table #9',
    waiter: 'Waiter - Yasmine',
    time: '18 min ago',
    status: 'Open',
    items: [
      { id: 'i6', quantity: 4, name: 'Draft beer', modifiers: [] },
      { id: 'i7', quantity: 2, name: 'Nachos - no jalapeno', modifiers: [] },
      { id: 'i8', quantity: 1, name: 'Sparkling water', modifiers: [] },
    ],
    runningTotal: 89.00,
  },
];

const modifiersList = [
  'On the rocks',
  'Extra lime',
  'No ice',
  'Double shot',
  'Neat',
  'Extra mint',
  'Salt rim',
  'Virgin',
];

const BarTabScreen: React.FC = () => {
  const [tabs] = useState<BarTab[]>(initialTabs);
  
  // --- State ---
  const [isHappyHourActive, setIsHappyHourActive] = useState(false);
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [drinksModifiers, setDrinksModifiers] = useState('');

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-8 font-sans text-gray-800 relative">
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .hover-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .hover-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hover-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; transition: background-color 0.2s ease; }
        .hover-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; }
        .hover-scrollbar:hover::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .hover-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .hover-scrollbar:hover { scrollbar-color: #cbd5e1 transparent; }
      `}</style>

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        
        {/* Breadcrumb Title */}
        <div className="flex items-center gap-2 text-2xl font-bold">
          <span className="text-gray-900">Bar Management</span>
          <span className="text-gray-400 font-light text-xl">{'>'}</span>
          <span className="text-gray-900">Bar tab</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Happy Hour Switch */}
          <div 
            className={`flex items-center gap-3 px-4 py-1.5 rounded-full shadow-sm cursor-pointer transition-colors duration-300 ${isHappyHourActive ? 'bg-[#00C853]' : 'bg-[#FF3B30]'}`}
            onClick={() => setIsHappyHourActive(!isHappyHourActive)}
          >
            <div className="relative w-9 h-5 bg-white rounded-full flex items-center transition-all duration-300 shadow-inner">
              <div 
                className={`absolute w-4 h-4 rounded-full bg-[#8E24AA] shadow-md transform transition-transform duration-300 ${
                  isHappyHourActive ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              ></div>
            </div>
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {isHappyHourActive ? 'Happy Hour Active' : 'Happy Hour Inactive'}
            </span>
          </div>

          {/* Open New Tab Button -> Opens Add New Tab Modal */}
          <button 
            onClick={() => setShowAddTabModal(true)}
            className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-1 whitespace-nowrap"
          >
            + Open New Tab
          </button>
        </div>
      </div>

      {/* --- Bar Tabs Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8 max-h-[60vh] overflow-y-auto pr-2 hover-scrollbar">
        {tabs.map((tab) => (
          <div key={tab.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            
            {/* Card Header */}
            <div className="p-4 pb-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {tab.name} - {tab.table}
                </h3>
                <span className="text-[9px] font-bold text-[#E53935] bg-[#FFEBEE] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {tab.status}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                {tab.waiter} <span className="mx-1">•</span> {tab.time}
              </p>
            </div>

            {/* Card Items List */}
            <div className="px-4 flex-1 min-h-[100px] mb-2">
              <ul className="space-y-1.5">
                {tab.items.map((item) => (
                  <li key={item.id} className="text-xs text-gray-700">
                    <span className="font-bold">{item.quantity}x</span> {item.name}
                    {item.modifiers.length > 0 && (
                      <span className="text-gray-400"> - {item.modifiers.join(', ')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card Footer */}
            <div className="p-4 pt-2 border-t border-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500 font-medium">Running total</span>
                <span className="text-sm font-bold text-gray-900">
                  ${tab.runningTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddItemModal(true)}
                  className="flex-1 bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white py-1.5 rounded-md text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                >
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

      {/* --- Quick Entry Modifiers Section --- */}
      <div className="border border-gray-300 rounded-xl p-4 bg-white/40">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Drinks Modifiers - Quick Entry
        </h4>
        
        <div className="flex flex-wrap gap-2 mb-3 max-h-[120px] overflow-y-auto pr-2 hover-scrollbar">
          {modifiersList.map((mod, index) => {
            const isHighlighted = index < 3;
            return (
              <button
                key={mod}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isHighlighted
                    ? 'bg-[#F3E5F5] text-[#8E24AA] border border-[#E1BEE7]'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {mod}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-400 font-medium">
          Active modifiers highlighted in dark color - Happy hour 10% discount auto-applied to drinks until 8:00 PM
        </p>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW TAB (Exact Figma Design)                 */}
      {/* ========================================================= */}
      {showAddTabModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
              <h2 className="text-xl font-bold mb-1">Add New Tab</h2>
              <p className="text-xs text-white/80">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
              <button 
                onClick={() => setShowAddTabModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Basic Information</h3>
              
              {/* Row 1: Client Name & Table No */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Client Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Ahmad Aminoff" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Table No <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., #7" 
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]"
                  />
                </div>
              </div>

              {/* Row 2: Drink's Name & Drinks Modifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Drink's Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g., Corona" 
                      value={drinkName}
                      onChange={(e) => setDrinkName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] pr-8"
                    />
                    {/* The purple + icon inside the input */}
                    <span className="absolute right-3 top-2 text-[#8E24AA] font-bold text-lg cursor-pointer">+</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Drinks Modifiers</label>
                  <div className="relative">
                    <select 
                      value={drinksModifiers}
                      onChange={(e) => setDrinksModifiers(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] appearance-none bg-white"
                    >
                      <option value="">Select modifiers</option>
                      <option value="on-the-rocks">On the rocks</option>
                      <option value="extra-lime">Extra lime</option>
                      <option value="no-ice">No ice</option>
                    </select>
                    <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">▼</span>
                  </div>
                </div>
              </div>

              {/* Centered Add Item Button */}
              <div className="flex justify-center mb-2">
                <button className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                  + Add Item
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button 
                onClick={() => setShowAddTabModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button className="flex-1 bg-[#8E24AA] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#7B1FA2] transition-all shadow-md">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD NEW ITEM                                      */}
      {/* ========================================================= */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
              <h2 className="text-xl font-bold mb-1">Add New Item</h2>
              <p className="text-xs text-white/80">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
              <button 
                onClick={() => setShowAddItemModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Drinks Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Drink's Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g., Corona" 
                      value={drinkName}
                      onChange={(e) => setDrinkName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] pr-8"
                    />
                    <span className="absolute right-3 top-2 text-[#8E24AA] font-bold text-lg cursor-pointer">+</span>
                  </div>
                </div>
                {/* Drinks Modifiers */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Drinks Modifiers</label>
                  <div className="relative">
                    <select 
                      value={drinksModifiers}
                      onChange={(e) => setDrinksModifiers(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA] appearance-none bg-white"
                    >
                      <option value="">Select modifiers</option>
                      <option value="on-the-rocks">On the rocks</option>
                      <option value="extra-lime">Extra lime</option>
                      <option value="no-ice">No ice</option>
                    </select>
                    <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">▼</span>
                  </div>
                </div>
              </div>

              {/* Centered Add Item Button */}
              <div className="flex justify-center mb-2">
                <button className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                  + Add Item
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button 
                onClick={() => setShowAddItemModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button className="flex-1 bg-[#8E24AA] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#7B1FA2] transition-all shadow-md">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BarTabScreen;