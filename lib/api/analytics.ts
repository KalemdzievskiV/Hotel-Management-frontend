import apiClient from './client';

export interface RevenueByCategory {
  roomType?: number;
  roomTypeName?: string;
  paymentMethod?: number;
  paymentMethodName?: string;
  bookingType?: number;
  bookingTypeName?: string;
  revenue: number;
  count: number;
  percentage?: number;
  averagePrice?: number;
}

export interface RevenueBreakdown {
  totalRevenue: number;
  roomRevenue: number;
  depositRevenue: number;
  completedReservations: number;
  cancellationCount: number;
  revenueByRoomType: RevenueByCategory[];
  revenueByPaymentMethod: RevenueByCategory[];
  revenueByBookingType: RevenueByCategory[];
  averageDailyRate: number;
  revPAR: number;
  totalRoomNights: number;
  periodStart: string;
  periodEnd: string;
}

export const analyticsApi = {
  // GET /api/Reservations/analytics/revenue-breakdown
  getRevenueBreakdown: async (startDate?: Date, endDate?: Date): Promise<RevenueBreakdown> => {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const response = await apiClient.get<RevenueBreakdown>('/Reservations/analytics/revenue-breakdown', {
      params
    });
    return response.data;
  },
};
