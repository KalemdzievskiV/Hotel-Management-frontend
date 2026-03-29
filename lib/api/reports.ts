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

export interface CancellationReportDto {
    date: string;
    cancellationCount: number;
    lostRevenue: number;
    mostCommonReason: string;
}

export interface NoShowReportDto {
    reservationId: number;
    guestName: string;
    roomNumber: string;
    checkInDate: string;
    totalAmount: number;
}

export interface PaymentReconciliationDto {
    date: string;
    totalTransactions: number;
    cashRevenue: number;
    cardRevenue: number;
    bankTransferRevenue: number;
    otherRevenue: number;
    totalRevenue: number;
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

    getCancellations: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get<CancellationReportDto[]>(`/reports/cancellations?${params.toString()}`);
        return response.data;
    },

    getNoShows: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get<NoShowReportDto[]>(`/reports/noshows?${params.toString()}`);
        return response.data;
    },

    getPaymentReconciliation: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get<PaymentReconciliationDto[]>(`/reports/payments/reconciliation?${params.toString()}`);
        return response.data;
    },

};
