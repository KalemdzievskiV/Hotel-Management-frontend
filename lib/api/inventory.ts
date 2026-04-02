import apiClient from './client';

export interface InventoryItemDto {
    id: number;
    hotelId: number;
    hotelName: string;
    name: string;
    description?: string;
    category: number;
    categoryName: string;
    quantity: number;
    minimumThreshold: number;
    unitCost: number;
    supplier?: string;
    unit?: string;
    lastRestocked?: string;
    isActive: boolean;
    isLowStock: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateInventoryItemDto {
    hotelId: number;
    name: string;
    description?: string;
    category: number;
    quantity: number;
    minimumThreshold: number;
    unitCost: number;
    supplier?: string;
    unit?: string;
}

export interface UpdateInventoryItemDto {
    name?: string;
    description?: string;
    category?: number;
    minimumThreshold?: number;
    unitCost?: number;
    supplier?: string;
    unit?: string;
    isActive?: boolean;
}

export interface InventoryTransactionDto {
    id: number;
    inventoryItemId: number;
    itemName: string;
    roomId?: number;
    roomNumber?: string;
    type: number;
    typeName: string;
    quantity: number;
    notes?: string;
    date: string;
    createdByUserId: string;
    createdByName: string;
}

export interface CreateInventoryTransactionDto {
    inventoryItemId: number;
    roomId?: number;
    type: number;
    quantity: number;
    notes?: string;
}

export interface InventoryCostAnalysisDto {
    category: number;
    categoryName: string;
    itemCount: number;
    totalQuantity: number;
    totalValue: number;
    lowStockCount: number;
}

export interface LowStockAlertDto {
    itemId: number;
    itemName: string;
    category: number;
    categoryName: string;
    currentQuantity: number;
    minimumThreshold: number;
    shortageAmount: number;
    supplier?: string;
}

export const inventoryApi = {
    getByHotel: (hotelId: number, includeInactive = false) =>
        apiClient.get<InventoryItemDto[]>(`/inventory/hotel/${hotelId}`, { params: { includeInactive } }).then(r => r.data),

    getById: (id: number) =>
        apiClient.get<InventoryItemDto>(`/inventory/${id}`).then(r => r.data),

    create: (dto: CreateInventoryItemDto) =>
        apiClient.post<InventoryItemDto>('/inventory', dto).then(r => r.data),

    update: (id: number, dto: UpdateInventoryItemDto) =>
        apiClient.put<InventoryItemDto>(`/inventory/${id}`, dto).then(r => r.data),

    delete: (id: number) =>
        apiClient.delete(`/inventory/${id}`),

    getLowStock: (hotelId: number) =>
        apiClient.get<LowStockAlertDto[]>(`/inventory/hotel/${hotelId}/low-stock`).then(r => r.data),

    getTransactions: (hotelId: number, from?: string, to?: string) =>
        apiClient.get<InventoryTransactionDto[]>(`/inventory/hotel/${hotelId}/transactions`, { params: { from, to } }).then(r => r.data),

    recordTransaction: (dto: CreateInventoryTransactionDto) =>
        apiClient.post<InventoryTransactionDto>('/inventory/transactions', dto).then(r => r.data),

    getCostAnalysis: (hotelId: number) =>
        apiClient.get<InventoryCostAnalysisDto[]>(`/inventory/hotel/${hotelId}/cost-analysis`).then(r => r.data),
};
