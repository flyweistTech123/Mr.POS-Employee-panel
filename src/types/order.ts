/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========================================
// --- 1. PAYMENT & MODALS ---
// ==========================================

export type PaymentMethod = 
  | 'Cash' 
  | 'Credit Card' 
  | 'Online' 
  | 'Other' 
  | 'GiftCard' 
  | 'GPay' 
  | 'ApplePay' 
  | 'MoMo' 
  | 'OrangeMoney' 
  | 'DebitCard' 
  | 'Split';

export interface PaymentOptionItem {
  Payment_Options_id: number;
  option: string;
  Details?: string;
  payment_category: string;
  requires_provider_confirmation?: boolean;
}

export interface PaymentOptionsResponse {
  success: boolean;
  data: any[];
  methods: PaymentOptionItem[];
  count: number;
  currency: string;
  setup_required: boolean;
}

// ==========================================
// --- 2. CART & UI ITEMS ---
// ==========================================

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  notes?: string;
  addOns?: { id: string; name: string; price: number }[];
  preparationStation?: "Kitchen" | "Counter" | "Bar";
  categoryName?: string;
  image?: string | null;
  serverItemId?: string;
  serverItemStatus?: string;
}

// ==========================================
// --- 3. SERVER ORDERS (API RESPONSES) ---
// ==========================================

export interface ServerOrderItem {
  _id: string;
  item_id: number;
  item_Quentry: number;
  item_Addons_id?: number | null;
  item_Variants_id?: number | null;
  item_status: string;
  item_size?: string | null;
  item_note?: string | null;
  Item?: { item_id: number; item_name: string; prices: number } | null;
  Addon?: { item_Addons_id: number; Addons: string; prices: number } | null;
}

export interface ServerPosOrder {
  _id: string;
  POS_Order_id: number;
  items: ServerOrderItem[];
  Tax: number;
  SubTotal: number;
  Total: number;
  Order_Status: string;
  payment_status: string;
  Customer_id: number | null;
  Dining_Option: string;
  Table_id: number | null;
  Kitchen_id: number | null;
  Restaurant_id: number;
  Status: boolean;
  CreateAt: string;
  UpdatedAt?: string;
  payment_method?: string | null;
  payment_date?: string | null;
  transaction_id?: string | null;
  Customer?: { Customer_id: number; Name: string; phone: string } | null;
  Kitchen?: { kitchen_id: number; kitchen_name: string } | null;
}

// ==========================================
// --- 4. API PAYLOADS (REQUEST BODIES) ---
// ==========================================

export interface PosOrderItemPayload {
  item_id: number;
  item_Quentry: number;
  item_Variants_id?: number;
  item_Addons_id?: number;
  item_size?: string | null;
  item_note?: string;
  item_status?: string;
}

export interface PosOrderCreateBody {
  items: PosOrderItemPayload[];
  Tax: number;
  Customer_id: number;
  Dining_Option: string;
  Table_id: number;
  Kitchen_id: number;
  Order_Status: string;
  payment_status: string;
  Status: boolean;
}

export interface PosOrderUpdateBody {
  id: number | string;
  items?: PosOrderItemPayload[];
  Tax?: number;
  Customer_id?: number;
  Table_id?: number;
  Kitchen_id?: number;
  Order_Status?: string;
  payment_status?: string;
  payment_method?: string;
  payment_date?: string;
  transaction_id?: string;
}

export interface SendToKitchenBody {
  id: number | string;
  items: { item_id: number; item_note?: string }[];
}

export interface UpdateOrderItemStatusBody {
  id: number | string;
  item_id: number;
  item_status: string;
  item_note?: string;
}

export interface UpdateOrderStatusBody {
  id: number | string;
  Order_Status: string;
}

export interface ProcessPaymentBody {
  id: number | string;
  payment_status: 'Success' | 'Failed' | 'Pending';
  Order_Status: string;
  payment_method?: string;
  payment_date?: string;
  transaction_id?: string;
}

// ==========================================
// --- 5. FLOORS & TABLES ---
// ==========================================

export interface Floor {
  Floor_id: number;
  Floor_Name: string;
  Total_Table_Count: number;
  "Seating-Persons_Count": number;
  Details?: string;
  floor_width: string;
  floor_height: string;
  floor_image?: string;
  tables: any[];
  Status: boolean;
}

export interface Table {
  Table_id: number;
  Title: string;
  "Table-name": string;
  Floor_id: number;
  Capacity: number;
  "Seating-Persons_Count": number;
  table_status: string;
  dynamic_status?: string;
  has_active_order?: boolean;
  has_active_reservation?: boolean;
  Floor?: { Floor_id: number; Floor_Name: string } | null;
}

export interface FloorWithTablesResponse {
  success: boolean;
  floor: Floor;
  tables_count: number;
  tables: Table[];
}

// ==========================================
// --- 6. CUSTOMERS ---
// ==========================================

export interface Customer {
  Customer_id: number;
  Name: string;
  phone: string;
  email?: string | null;
  Table_id?: number | null;
  Notes?: string | null;
}

export interface CreateCustomerBody {
  phone: string;
  Name: string;
  DOB?: string;
  Table_id?: number;
  Notes?: string;
  Status?: boolean;
}

// ==========================================
// --- 7. BAR TABS ---
// ==========================================

export interface BarTab {
  _id: string;
  Bar_Tab_id: number;
  client_name: string;
  table_no: string;
  status: 'Open' | 'Closed';
  items: any[];
  subtotal: number;
  total: number;
  currency: string;
}

export interface BarTabCreateBody {
  client_name: string;
  table_no: string;
  items: { drink_item_id: number; quantity: number; modifiers: string[] }[];
}

export interface BarTabAddItemBody {
  tabId: number;
  drink_item_id: number;
  quantity: number;
  modifiers: string[];
}

export interface BarTabClosePaymentBody {
  tabId: number;
  Payment_Options_id: number;
  payment_method: string;
  payment_confirmed: boolean;
  payment_reference?: string;
}

// ==========================================
// --- 8. LEGACY & WRAPPERS ---
// ==========================================

export interface Order {
  orderId: string;
  items: OrderItem[];
  pricingSummary?: any;
  paymentDetails?: any;
  customerInfo?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}
// Add or replace this in @/types/order.ts
export interface FloorWithTablesResponse {
  success: boolean;
  data: {
    floor: any; // Or your specific Floor type
    tables: any[]; // Or your specific Table type
    server_time: string;
  };
}