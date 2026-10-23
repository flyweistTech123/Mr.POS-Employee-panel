import type { Order, PreparationStation, OrderItem } from '../types/order';
import api from './axios';

const burgerImages = [
  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=80',
];
const beverageImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1510626176961-4b57d4fbad04?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
];
const crispyImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
];
const nuggetImages = [
  'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=80',
];

const burgerNames = [
  'Spicy Burger', 'Classic Burger', 'Cheese Burger', 'Veggie Burger', 'Chicken Burger', 'Double Patty Burger', 'BBQ Burger', 'Fish Burger', 'Bacon Burger', 'Mushroom Burger'
];
const beverageNames = [
  'Cola', 'Lemonade', 'Iced Tea', 'Orange Juice', 'Milkshake', 'Coffee', 'Green Tea', 'Smoothie', 'Water', 'Energy Drink'
];
const crispyNames = [
  'Crispy Chicken', 'Crispy Wings', 'Crispy Tenders', 'Crispy Fries', 'Crispy Fish', 'Crispy Onion Rings', 'Crispy Nuggets', 'Crispy Shrimps', 'Crispy Calamari', 'Crispy Potato'
];
const nuggetNames = [
  'Chicken Nuggets', 'Fish Nuggets', 'Veggie Nuggets', 'Cheese Nuggets', 'Spicy Nuggets', 'BBQ Nuggets', 'Mini Nuggets', 'Crunchy Nuggets', 'Classic Nuggets', 'Herb Nuggets'
];

const items = [
  ...burgerNames.map((name, i) => ({
    itemId: `burger${i + 1}`,
    name,
    quantity: 1,
    price: 330 + i * 10,
    availability: true,
    itemType: 'Burger',
    image: burgerImages[i % burgerImages.length],
    addOns: [],
    notes: '',
    size: 'Regular',
    preparationStation: 'Kitchen' as PreparationStation,
  })),
  ...beverageNames.map((name, i) => ({
    itemId: `beverage${i + 1}`,
    name,
    quantity: 1,
    price: 120 + i * 5,
    availability: true,
    itemType: 'Beverage',
    image: beverageImages[i % beverageImages.length],
    addOns: [],
    notes: '',
    size: 'Medium',
    preparationStation: 'Counter' as PreparationStation,
  })),
  ...crispyNames.map((name, i) => ({
    itemId: `crispy${i + 1}`,
    name,
    quantity: 1,
    price: 200 + i * 8,
    availability: true,
    itemType: 'Crispy',
    image: crispyImages[i % crispyImages.length],
    addOns: [],
    notes: '',
    size: 'Regular',
    preparationStation: 'Kitchen' as PreparationStation,
  })),
  ...nuggetNames.map((name, i) => ({
    itemId: `nugget${i + 1}`,
    name,
    quantity: 1,
    price: 150 + i * 7,
    availability: true,
    itemType: 'Nugget',
    image: nuggetImages[i % nuggetImages.length],
    addOns: [],
    notes: '',
    size: 'Small',
    preparationStation: 'Kitchen' as PreparationStation,
  })),
];

const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
const nineMinutesAgo = new Date(Date.now() - 9 * 60 * 1000).toISOString();
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

function calcPricingSummary(
  orderItems: { price: number; quantity?: number }[],
  taxPercentage: number = 6,
  discount: number = 0,
  discountType?: string,
  discountCode?: string,
  serviceCharge: number = 0
) {
  const subtotal = orderItems.reduce((sum: number, item: { price: number; quantity?: number }) => sum + (item.price * (item.quantity || 1)), 0);
  const tax = Math.round(subtotal * (taxPercentage / 100));
  const totalAmount = subtotal + tax + serviceCharge - discount;

  return {
    subtotal,
    tax,
    total: totalAmount, // <-- ADDED: Fixes "Property 'total' is missing"
    taxPercentage,
    discount,
    discountType,
    discountCode,
    serviceCharge,
    totalAmount,
  };
}

const dummyOrders: Order[] = [
  {
    id: '1', // <-- ADDED: Missing id
    orderId: '1',
    status: 'Served',
    tableInfo: { tableId: 1, name: 'Table 1' }, // <-- CHANGED: string to number
    waiterName: 'John Doe',
    customerInfo: { name: 'Alice', phone: '1234567890' }, // <-- CHANGED: phoneNumber to phone
    items: items.slice(0, 2),
    pricingSummary: calcPricingSummary(items.slice(0, 2), 6, 0, 'Code', 'DISC5', 0),
    paymentDetails: { method: 'Cash', status: 'Unpaid', transactionId: 'TXN001', kitchenNotes: 'No onions' },
    createdAt: twentyMinutesAgo,
    updatedAt: twentyMinutesAgo,
  },
  {
    id: '2',
    orderId: '2',
    status: 'Preparing',
    tableInfo: { tableId: 2, name: 'Table 2' },
    waiterName: 'Jane Smith',
    customerInfo: { name: 'Bob', phone: '9876543210' },
    items: items.slice(2, 5),
    pricingSummary: calcPricingSummary(items.slice(2, 5), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Credit Card', status: 'Paid', transactionId: 'TXN002', kitchenNotes: 'Extra spicy' },
    createdAt: twentyMinutesAgo,
    updatedAt: nineMinutesAgo,
  },
  {
    id: '3',
    orderId: '3',
    status: 'Completed',
    waiterName: 'Sam Wilson',
    tableInfo: { tableId: 3, name: 'Table 3' },
    customerInfo: { name: 'Charlie', phone: '5551234567' },
    items: items.slice(5, 8),
    pricingSummary: calcPricingSummary(items.slice(5, 8), 6, 0, 'Promo', 'PROMO10', 0),
    paymentDetails: { method: 'Online', status: 'Paid', transactionId: 'TXN003', kitchenNotes: '' },
    createdAt: twentyMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '4',
    orderId: '4',
    status: 'Served',
    tableInfo: { tableId: 4, name: 'Table 4' },
    waiterName: 'Emily Clark',
    customerInfo: { name: 'David', phone: '2223334444' },
    items: items.slice(8, 10),
    pricingSummary: calcPricingSummary(items.slice(8, 10), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Cash', status: 'Unpaid', transactionId: 'TXN004', kitchenNotes: 'No cheese' },
    createdAt: nineMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '5',
    orderId: '5',
    status: 'Preparing',
    tableInfo: { tableId: 5, name: 'Table 5' },
    waiterName: 'Olivia Brown',
    customerInfo: { name: 'Eve', phone: '3334445555' },
    items: items.slice(10, 13),
    pricingSummary: calcPricingSummary(items.slice(10, 13), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Credit Card', status: 'Paid', transactionId: 'TXN005', kitchenNotes: 'Extra sauce' },
    createdAt: fiveMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '6',
    orderId: '6',
    status: 'Ready',
    tableInfo: { tableId: 6, name: 'Table 6' },
    waiterName: 'Liam Green',
    customerInfo: { name: 'Frank', phone: '4445556666' },
    items: items.slice(13, 15),
    pricingSummary: calcPricingSummary(items.slice(13, 15), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Cash', status: 'Unpaid', transactionId: 'TXN006', kitchenNotes: 'No pickles' },
    createdAt: fiveMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '7',
    orderId: '7',
    status: 'Preparing',
    tableInfo: { tableId: 7, name: 'Table 7' },
    waiterName: 'Sophia White',
    customerInfo: { name: 'Grace', phone: '5556667777' },
    items: items.slice(15, 18),
    pricingSummary: calcPricingSummary(items.slice(15, 18), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Credit Card', status: 'Paid', transactionId: 'TXN007', kitchenNotes: 'No salt' },
    createdAt: fiveMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '8',
    orderId: '8',
    status: 'Preparing',
    tableInfo: { tableId: 8, name: 'Table 8' },
    waiterName: 'Noah Black',
    customerInfo: { name: 'Henry', phone: '6667778888' },
    items: items.slice(18, 21),
    pricingSummary: calcPricingSummary(items.slice(18, 21), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Cash', status: 'Unpaid', transactionId: 'TXN008', kitchenNotes: 'No lettuce' },
    createdAt: fiveMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '9',
    orderId: '9',
    status: 'Served',
    tableInfo: { tableId: 9, name: 'Table 9' },
    waiterName: 'Mia Blue',
    customerInfo: { name: 'Ivy', phone: '7778889999' },
    items: items.slice(21, 24),
    pricingSummary: calcPricingSummary(items.slice(21, 24), 6, 0, undefined, undefined, 0),
    paymentDetails: { method: 'Credit Card', status: 'Paid', transactionId: 'TXN009', kitchenNotes: 'No tomato' },
    createdAt: fiveMinutesAgo,
    updatedAt: fiveMinutesAgo,
  },
];

export const fetchOrders = async (params?: { status?: string; dateRange?: string }): Promise<Order[]> => {
  let filtered = dummyOrders;
  if (params?.status && params.status !== 'All Tables') {
    filtered = filtered.filter(o => o.status === params.status);
  }
  if (params?.dateRange) {
    filtered = filterOrdersByDate(filtered, params.dateRange);
  }
  return filtered;
};

export const createOrder = async (order: Order): Promise<{ success: boolean; order: Order }> => {
  return { success: true, order: { ...order, orderId: `ORDER_${Date.now()}` } };
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<{ success: boolean; orderId: string; updates: Partial<Order> }> => {
  return { success: true, orderId, updates };
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  return dummyOrders.find(order => order.orderId === orderId);
};

export const deleteOrder = async (orderId: string): Promise<{ success: boolean; orderId: string }> => {
  return Promise.resolve({ success: true, orderId });
};

export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  return dummyOrders.filter(order => order.status === status);
};

export const getOrdersByTable = async (tableId: string): Promise<Order[]> => {
  // FIXED: Compare string to string safely
  return dummyOrders.filter(order => String(order.tableInfo?.tableId) === tableId);
};

export const getOrdersByWaiter = async (waiterName: string): Promise<Order[]> => {
  return dummyOrders.filter(order => order.waiterName === waiterName);
};

export const getOrderStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<{
  total: number;
  pending: number;
  preparing: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}> => {
  const orders = dummyOrders;
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'Pending').length;
  const preparing = orders.filter(o => o.status === 'Preparing').length;
  const completed = orders.filter(o => o.status === 'Completed').length;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricingSummary?.totalAmount || 0), 0);
  const averageOrderValue = total > 0 ? totalRevenue / total : 0;

  return {
    total,
    pending,
    preparing,
    completed,
    cancelled,
    totalRevenue,
    averageOrderValue,
  };
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean; order: Order }> => {
  const order = dummyOrders.find(o => o.orderId === orderId);
  if (order) {
    order.status = status as 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  }
  return { success: true, order: order! };
};

export const addItemToOrder = async (orderId: string, item: OrderItem): Promise<{ success: boolean; order: Order }> => {
  const order = dummyOrders.find(o => o.orderId === orderId);
  if (order) {
    order.items.push(item);
  }
  return { success: true, order: order! };
};

export const removeItemFromOrder = async (orderId: string, itemId: string): Promise<{ success: boolean; order: Order }> => {
  const order = dummyOrders.find(o => o.orderId === orderId);
  if (order) {
    order.items = order.items.filter(item => item.itemId !== itemId);
  }
  return { success: true, order: order! };
};

const filterOrdersByDate = (orders: Order[], dateRange: string): Order[] => {
  switch (dateRange) {
    case 'Today':
      return orders.slice(0, 3);
    case 'Yesterday':
      return orders.slice(1, 4);
    case 'This week':
      return orders;
    case 'This Month':
      return orders;
    default:
      return orders;
  }
};