import apiClient from './client';
import { 
  Reservation, 
  CreateReservationDto, 
  UpdateReservationDto,
  RecordPaymentDto,
  CancelReservationDto,
  ReservationStatus 
} from '@/types';

export const reservationsApi = {
  // GET /api/Reservations
  getAll: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/Reservations');
    return response.data;
  },

  // GET /api/Reservations/{id}
  getById: async (id: number): Promise<Reservation> => {
    const response = await apiClient.get<Reservation>(`/Reservations/${id}`);
    return response.data;
  },

  // POST /api/Reservations
  create: async (data: CreateReservationDto): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/Reservations', data);
    return response.data;
  },

  // PUT /api/Reservations/{id}
  update: async (id: number, data: UpdateReservationDto): Promise<Reservation> => {
    const response = await apiClient.put<Reservation>(`/Reservations/${id}`, data);
    return response.data;
  },

  // DELETE /api/Reservations/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Reservations/${id}`);
  },

  // GET /api/Reservations/hotel/{hotelId}
  getByHotel: async (hotelId: number): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/Reservations/hotel/${hotelId}`);
    return response.data;
  },

  // GET /api/Reservations/room/{roomId}
  getByRoom: async (roomId: number): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/Reservations/room/${roomId}`);
    return response.data;
  },

  // GET /api/Reservations/guest/{guestId}
  getByGuest: async (guestId: number): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/Reservations/guest/${guestId}`);
    return response.data;
  },

  // GET /api/Reservations/status/{status}
  getByStatus: async (status: ReservationStatus): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/Reservations/status/${status}`);
    return response.data;
  },

  // GET /api/Reservations/daterange?startDate=&endDate=
  getByDateRange: async (startDate: string, endDate: string): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/Reservations/daterange', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // GET /api/Reservations/my-reservations
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/Reservations/my-reservations');
    return response.data;
  },

  // GET /api/Reservations/room/{roomId}/availability
  checkAvailability: async (
    roomId: number,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/Reservations/room/${roomId}/availability`, {
      params: { checkIn, checkOut },
    });
    return response.data;
  },

  // GET /api/Reservations/room/{roomId}/conflicts
  getConflicts: async (
    roomId: number,
    checkIn: string,
    checkOut: string
  ): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/Reservations/room/${roomId}/conflicts`, {
      params: { checkIn, checkOut },
    });
    return response.data;
  },

  // POST /api/Reservations/{id}/confirm
  confirm: async (id: number): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/confirm`);
    return response.data;
  },

  // POST /api/Reservations/{id}/checkin
  checkIn: async (id: number): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/checkin`);
    return response.data;
  },

  // POST /api/Reservations/{id}/checkout
  checkOut: async (id: number): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/checkout`);
    return response.data;
  },

  // POST /api/Reservations/{id}/cancel
  cancel: async (id: number, data: CancelReservationDto): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/cancel`, data);
    return response.data;
  },

  // POST /api/Reservations/{id}/noshow
  markNoShow: async (id: number): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/noshow`);
    return response.data;
  },

  // POST /api/Reservations/{id}/payment
  recordPayment: async (id: number, data: RecordPaymentDto): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/payment`, data);
    return response.data;
  },

  // POST /api/Reservations/{id}/refund
  recordRefund: async (id: number, amount: number): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>(`/Reservations/${id}/refund`, { amount });
    return response.data;
  },

  // GET /api/Reservations/stats/count
  getCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Reservations/stats/count');
    return response.data;
  },

  // GET /api/Reservations/stats/revenue
  getRevenue: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Reservations/stats/revenue');
    return response.data;
  },

  // GET /api/Reservations/stats/by-status
  getByStatusStats: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>('/Reservations/stats/by-status');
    return response.data;
  },

  // GET /api/Reservations/stats/by-month/{year}
  getMonthlyStats: async (year: number): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>(`/Reservations/stats/by-month/${year}`);
    return response.data;
  },
};
