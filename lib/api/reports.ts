import apiClient from './client';

export interface DailyRevenueDto {
    date: string;
    totalRevenue: number;
    reservationCount: number;
}

export interface WeeklyRevenueDto {
    weekStart: string;
    weekEnd: string;
    totalRevenue: number;
}

export interface MonthlyRevenueDto {
    month: string;
    year: number;
    totalRevenue: number;
    reservationCount: number;
}

export interface OccupancyReportDto {
    date: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
}

export interface GuestVisitHistoryDto {
    guestId: number;
    guestName: string;
    visitCount: number;
    totalSpent: number;
    lastVisit: string;
}

export interface OutstandingPaymentDto {
    reservationId: number;
    guestName: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
}

export const reportsApi = {
    getDailyRevenue: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get<DailyRevenueDto[]>(`/reports/revenue/daily?${params.toString()}`);
        return response.data;
    },

    getWeeklyRevenue: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get<WeeklyRevenueDto[]>(`/reports/revenue/weekly?${params.toString()}`);
        return response.data;
    },

    getMonthlyRevenue: async (year?: number) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());
        const response = await apiClient.get<MonthlyRevenueDto[]>(`/reports/revenue/monthly?${params.toString()}`);
        return response.data;
    },

    getOccupancyHistory: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get<OccupancyReportDto[]>(`/reports/occupancy/history?${params.toString()}`);
        return response.data;
    },

    getGuestVisitHistory: async () => {
        const response = await apiClient.get<GuestVisitHistoryDto[]>('/reports/guests/history');
        return response.data;
    },

    getOutstandingPayments: async () => {
        const response = await apiClient.get<OutstandingPaymentDto[]>('/reports/payments/outstanding');
        return response.data;
    },
};
