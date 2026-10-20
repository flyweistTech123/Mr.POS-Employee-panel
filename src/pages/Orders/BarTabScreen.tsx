/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
  useGetAllBarTabsQuery,
  useCreateBarTabMutation,
  useAddBarTabItemMutation,
  useCloseBarTabWithPaymentMutation,
  useGetAllItemsQuery,
  useGetMyPaymentOptionsQuery,
  type BarTab,
} from '@/redux/api/quickOrderSlice';

interface Props {
  onBack?: () => void;
}

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

const formatMoney = (amount: number, currency = 'XOF') =>
  `${Number(amount || 0).toLocaleString()} ${currency}`;

const formatRelative = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} day ago`;
};

const BarTabScreen: React.FC<Props> = ({ onBack }) => {
  // ---------- API ----------
  const { data: tabsRes, isLoading: tabsLoading, refetch: refetchTabs } =
    useGetAllBarTabsQuery({ status: 'Open' });
  const { data: drinksRes } = useGetAllItemsQuery({ type: 'Drink', category_id: 'all' });
  const { data: paymentsRes } = useGetMyPaymentOptionsQuery();

  const [createBarTab, { isLoading: creating }] = useCreateBarTabMutation();
  const [addBarTabItem] = useAddBarTabItemMutation();
  const [closeBarTab, { isLoading: closing }] = useCloseBarTabWithPaymentMutation();

  const tabs: BarTab[] = tabsRes?.data || [];
  const drinkItems = useMemo(
    () =>
      (drinksRes?.data || []).map((it: any) => ({
        id: Number(it.Items_id),
        name: it['item-name'] || it.Title,
        price: Number(it['item-price'] || it.Price || 0),
        categoryName: it.Category?.Name || '',
      })),
    [drinksRes]
  );

  // ---------- UI state ----------
  const [isHappyHourActive, setIsHappyHourActive] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState<{ tabId: number; tabName: string } | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<BarTab | null>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [drinkQty, setDrinkQty] = useState(1);
  const [drinksModifiers, setDrinksModifiers] = useState('');

  // ---------- Derived ----------
  const filteredTabs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter(
      (t) =>
        t.client_name?.toLowerCase().includes(q) ||
        t.table_no?.toLowerCase().includes(q)
    );
  }, [tabs, search]);

  const happyHourTotal = (tab: BarTab) =>
    isHappyHourActive ? Math.round(tab.total * 0.9) : tab.total;

  // ---------- Handlers ----------
  const resolveDrink = () => {
    const q = drinkName.trim().toLowerCase();
    if (!q) return null;
    return (
      drinkItems.find((d:any) => d.name.toLowerCase() === q) ||
      drinkItems.find((d:any) => d.name.toLowerCase().includes(q)) ||
      null
    );
  };

  const handleCreateTab = async () => {
    if (!clientName.trim() || !tableNo.trim()) {
      alert('Client name and table number are required.');
      return;
    }
    const drink = resolveDrink();
    const items = drink
      ? [{
          drink_item_id: drink.id,
          quantity: Math.max(1, drinkQty),
          modifiers: drinksModifiers ? [drinksModifiers] : [],
        }]
      : [];

    try {
      await createBarTab({
        client_name: clientName.trim(),
        table_no: tableNo.trim(),
        items,
      }).unwrap();
      setShowAddTabModal(false);
      setClientName(''); setTableNo(''); setDrinkName(''); setDrinkQty(1); setDrinksModifiers('');
      refetchTabs();
    } catch (e: any) {
      console.error(e);
      alert(e?.data?.message || 'Failed to create bar tab.');
    }
  };

  const handleAddItem = async () => {
    if (!showAddItemModal) return;
    const drink = resolveDrink();
    if (!drink) {
      alert('Pick a drink (type a name matching the menu).');
      return;
    }
    try {
      await addBarTabItem({
        tabId: showAddItemModal.tabId,
        drink_item_id: drink.id,
        quantity: Math.max(1, drinkQty),
        modifiers: drinksModifiers ? [drinksModifiers] : [],
      }).unwrap();
      setShowAddItemModal(null);
      setDrinkName(''); setDrinkQty(1); setDrinksModifiers('');
      refetchTabs();
    } catch (e: any) {
      console.error(e);
      alert(e?.data?.message || 'Failed to add item.');
    }
  };

  const handleCloseTab = async (tab: BarTab, method: 'Cash' | 'Credit Card') => {
    const optionId = method === 'Cash' ? 1 : 3;
    try {
      await closeBarTab({
        tabId: tab.Bar_Tab_id,
        Payment_Options_id: optionId,
        payment_method: method,
        payment_confirmed: true,
        ...(method === 'Credit Card' ? { payment_reference: `CARD-${Date.now()}` } : {}),
      }).unwrap();
      setPaymentTarget(null);
      refetchTabs();
    } catch (e: any) {
      console.error(e);
      alert(e?.data?.message || 'Failed to close tab.');
    }
  };

  const paymentOptions: any[] = paymentsRes?.data || paymentsRes || [];

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-[#F8F8F8] p-8 font-sans text-gray-800 relative">
      <style>{`
        .hover-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .hover-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hover-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; transition: background-color .2s ease; }
        .hover-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; }
        .hover-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .hover-scrollbar:hover { scrollbar-color: #cbd5e1 transparent; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <button
            onClick={onBack}
            className="hover:text-[#8E24AA] transition-colors text-gray-900"
          >
            Bar Management
          </button>
          <span className="text-gray-400 font-light text-xl">{'>'}</span>
          <span className="text-gray-900">Bar tab</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Happy Hour toggle */}
          <div
            className={`flex items-center justify-between px-4 py-2 rounded-full shadow-sm cursor-pointer transition-colors duration-300 w-[175px] ${
              isHappyHourActive ? 'bg-[#00C853]' : 'bg-[#FF3B30]'
            }`}
            onClick={() => setIsHappyHourActive((v) => !v)}
          >
            <div className="relative w-10 h-5 bg-white rounded-full flex-shrink-0 shadow-inner">
              <div
                className={`absolute w-4 h-4 rounded-full bg-[#8E24AA] shadow-md transform transition-transform duration-300 top-0.5 ${
                  isHappyHourActive ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-[11px] font-bold text-white leading-none whitespace-nowrap">
              {isHappyHourActive ? 'Happy Hour Active' : 'Happy Hour Inactive'}
            </span>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client / table"
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs w-44 focus:outline-none focus:border-[#8E24AA]"
          />

          <button
            onClick={() => setShowAddTabModal(true)}
            className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-1 whitespace-nowrap"
          >
            + Open New Tab
          </button>
        </div>
      </div>

      {/* Tabs grid */}
      {tabsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-[#6A1B9A] rounded-full animate-spin" />
        </div>
      ) : filteredTabs.length === 0 ? (
        <div className="text-center text-gray-400 py-16 text-sm">
          No open bar tabs.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8 max-h-[60vh] overflow-y-auto pr-2 hover-scrollbar">
          {filteredTabs.map((tab) => {
            const currency = tab.currency || tab.payment?.currency || 'XOF';
            return (
              <div
                key={tab._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
              >
                <div className="p-4 pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {tab.client_name} - {tab.table_no}
                    </h3>
                    <span className="text-[9px] font-bold text-[#E53935] bg-[#FFEBEE] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {tab.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Tab #{tab.Bar_Tab_id} <span className="mx-1">•</span>{' '}
                    {formatRelative(tab.CreateAt)}
                  </p>
                </div>

                <div className="px-4 flex-1 min-h-[100px] mb-2">
                  <ul className="space-y-1.5">
                    {tab.items.map((item) => (
                      <li key={item._id} className="text-xs text-gray-700">
                        <span className="font-bold">{item.quantity}x</span> {item.drink_name}
                        {item.modifiers?.length > 0 && (
                          <span className="text-gray-400"> - {item.modifiers.join(', ')}</span>
                        )}
                        <span className="float-right text-gray-600 font-semibold">
                          {formatMoney(item.line_total, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 pt-2 border-t border-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500 font-medium">Running total</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatMoney(happyHourTotal(tab), currency)}
                      {isHappyHourActive && (
                        <span className="text-[10px] text-[#00C853] ml-1">-10%</span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setShowAddItemModal({ tabId: tab.Bar_Tab_id, tabName: tab.client_name })
                      }
                      className="flex-1 bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white py-1.5 rounded-md text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                    >
                      + Add Item
                    </button>
                    <button
                      onClick={() => setPaymentTarget(tab)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50 transition-all"
                    >
                      Close tab
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modifiers quick entry */}
      <div className="border border-gray-300 rounded-xl p-4 bg-white/40">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Drinks Modifiers - Quick Entry
        </h4>
        <div className="flex flex-wrap gap-2 mb-3 max-h-[120px] overflow-y-auto pr-2 hover-scrollbar">
          {modifiersList.map((mod, index) => {
            const highlighted = index < 3;
            return (
              <button
                key={mod}
                onClick={() => setDrinksModifiers(mod)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  drinksModifiers === mod
                    ? 'bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white shadow-sm'
                    : highlighted
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
          Happy hour 10% discount auto-applied to drinks until 8:00 PM
        </p>
      </div>

      {/* ==== Modal: Add New Tab ==== */}
      {showAddTabModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
              <h2 className="text-xl font-bold mb-1">Add New Tab</h2>
              <p className="text-xs text-white/80">Open a new bar tab and optionally add the first drink.</p>
              <button
                onClick={() => setShowAddTabModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Client Name *</label>
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Ahmad Aminoff"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Table No *</label>
                  <input
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    placeholder="e.g., #7"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Drink's Name</label>
                  <input
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    placeholder="e.g., Mojito"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA]"
                  />
                  {drinkName && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {resolveDrink() ? `→ ${resolveDrink()!.name}` : 'No matching drink — will open empty tab.'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Modifier</label>
                  <select
                    value={drinksModifiers}
                    onChange={(e) => setDrinksModifiers(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA] bg-white"
                  >
                    <option value="">Select modifier</option>
                    {modifiersList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 mb-1">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrinkQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-md bg-gray-100 font-bold"
                  >-</button>
                  <span className="w-10 text-center font-bold">{drinkQty}</span>
                  <button
                    onClick={() => setDrinkQty((q) => q + 1)}
                    className="w-8 h-8 rounded-md bg-gray-100 font-bold"
                  >+</button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setShowAddTabModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTab}
                disabled={creating}
                className="flex-1 bg-[#8E24AA] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#7B1FA2] disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== Modal: Add Item to Tab ==== */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
              <h2 className="text-xl font-bold mb-1">Add Item</h2>
              <p className="text-xs text-white/80">
                Tab: {showAddItemModal.tabName} (#{showAddItemModal.tabId})
              </p>
              <button
                onClick={() => setShowAddItemModal(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Drink's Name *</label>
                  <input
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    placeholder="e.g., House Lager"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E24AA]"
                  />
                  {drinkName && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {resolveDrink() ? `→ ${resolveDrink()!.name} (${resolveDrink()!.price} XOF)` : 'No matching drink.'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Modifier</label>
                  <select
                    value={drinksModifiers}
                    onChange={(e) => setDrinksModifiers(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select modifier</option>
                    {modifiersList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Quantity</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDrinkQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-md bg-gray-100 font-bold">-</button>
                  <span className="w-10 text-center font-bold">{drinkQty}</span>
                  <button onClick={() => setDrinkQty((q) => q + 1)} className="w-8 h-8 rounded-md bg-gray-100 font-bold">+</button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setShowAddItemModal(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 bg-[#8E24AA] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#7B1FA2]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== Modal: Close Tab / Payment ==== */}
      {paymentTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#8E24AA] to-[#E53935] p-5 text-white relative">
              <h2 className="text-xl font-bold mb-1">Close Tab</h2>
              <p className="text-xs text-white/80">
                {paymentTarget.client_name} - {paymentTarget.table_no}
              </p>
              <button
                onClick={() => setPaymentTarget(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">
                  {formatMoney(paymentTarget.subtotal, paymentTarget.currency)}
                </span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-500">Total due</span>
                <span className="font-bold text-gray-900">
                  {formatMoney(happyHourTotal(paymentTarget), paymentTarget.currency)}
                </span>
              </div>

              <p className="text-xs font-bold text-gray-600 mb-2">Payment method</p>
              <div className="space-y-2 mb-4">
                {paymentOptions.length > 0 ? (
                  paymentOptions.map((po: any) => (
                    <button
                      key={po.Payment_Options_id ?? po.id ?? po.title}
                      onClick={() => handleCloseTab(paymentTarget, po.title?.toLowerCase().includes('cash') ? 'Cash' : 'Credit Card')}
                      disabled={closing}
                      className="w-full text-left border border-gray-200 rounded-lg px-4 py-2 text-sm hover:border-[#8E24AA] hover:bg-[#F3E5F5] transition-colors disabled:opacity-50"
                    >
                      <span className="font-semibold">{po.title ?? po.Name ?? po.name}</span>
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => handleCloseTab(paymentTarget, 'Cash')}
                      disabled={closing}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm hover:border-[#8E24AA] disabled:opacity-50"
                    >
                      Cash
                    </button>
                    <button
                      onClick={() => handleCloseTab(paymentTarget, 'Credit Card')}
                      disabled={closing}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm hover:border-[#8E24AA] disabled:opacity-50"
                    >
                      Credit Card
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarTabScreen;