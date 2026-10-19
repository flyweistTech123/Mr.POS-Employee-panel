export interface Reservation {
  _id: string;
  Reservations_online: boolean;
  Customer_id: number;
  slots: string;
  slots_time: string;
  title: string;
  Floor: number;
  Capacity_count: number;
  people_count: number;
  PaymentStatus: string;
  Table_id: number;
  Addone_Table_id?: number;
  Date_time: string;
  Notes: string;
  Status: boolean;
  Reservations_id: number;
  customer_name?: string;
  customer_mobile?: string;
  CreateAt: string;
  UpdatedAt: string;
}

export interface CreateReservationPayload {
  Reservations_online: boolean;
  Customer_id: number;
  slots: string;
  slots_time: string;
  title: string;
  Floor: number;
  Capacity_count: number;
  people_count: number;
  PaymentStatus: string;
  Table_id: number;
  Date_time: string;
  Notes: string;
  Status: boolean;
}

export interface UpdateReservationPayload {
  id: number;
  people_count?: number;
  Table_id?: number;
  PaymentStatus?: string;
  Notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}