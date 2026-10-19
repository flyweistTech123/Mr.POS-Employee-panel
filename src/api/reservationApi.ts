import axiosInstance from './axios'; 
import type { 
  Reservation, 
  CreateReservationPayload, 
  UpdateReservationPayload, 
  ApiResponse 
} from '../types/reservation';

// 1. Get Reservations by Auth
export const getReservations = async (): Promise<Reservation[]> => {
  const response = await axiosInstance.get<ApiResponse<Reservation[]>>(
    '/api/v1/restaurant/reservations/getbyauth'
  );
  return response.data.data;
};

// 2. Create Reservation
export const createReservation = async (payload: CreateReservationPayload): Promise<Reservation> => {
  const response = await axiosInstance.post<ApiResponse<Reservation>>(
    '/api/v1/restaurant/reservations/create',
    payload
  );
  return response.data.data;
};

// 3. Update Reservation
export const updateReservation = async (payload: UpdateReservationPayload): Promise<Reservation> => {
  const response = await axiosInstance.put<ApiResponse<Reservation>>(
    '/api/v1/restaurant/reservations/update',
    payload
  );
  return response.data.data;
};

// 4. Delete Reservation
export const deleteReservation = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/restaurant/reservations/delete/${id}`);
};