import apiClient from './client';

export interface HousekeepingTaskDto {
    id: number;
    roomId: number;
    roomNumber: string;
    hotelId: number;
    hotelName: string;
    assignedToUserId?: string;
    assignedToName?: string;
    createdByUserId: string;
    createdByName: string;
    type: number;
    typeName: string;
    priority: number;
    priorityName: string;
    status: number;
    statusName: string;
    scheduledFor: string;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
    createdAt: string;
    durationMinutes?: number;
}

export interface CreateHousekeepingTaskDto {
    roomId: number;
    assignedToUserId?: string;
    type: number;
    priority?: number;
    scheduledFor?: string;
    notes?: string;
}

export interface UpdateHousekeepingTaskDto {
    assignedToUserId?: string;
    priority?: number;
    status?: number;
    scheduledFor?: string;
    notes?: string;
}

export interface HousekeepingScheduleDto {
    date: string;
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    tasks: HousekeepingTaskDto[];
}

export interface HousekeeperPerformanceDto {
    userId: string;
    name: string;
    tasksCompleted: number;
    tasksAssigned: number;
    completionRate: number;
    averageDurationMinutes?: number;
}

export const housekeepingApi = {
    getTasks: (hotelId: number, date?: string, status?: string) =>
        apiClient.get<HousekeepingTaskDto[]>(`/housekeeping/hotel/${hotelId}`, { params: { date, status } }).then(r => r.data),

    getById: (id: number) =>
        apiClient.get<HousekeepingTaskDto>(`/housekeeping/${id}`).then(r => r.data),

    create: (dto: CreateHousekeepingTaskDto) =>
        apiClient.post<HousekeepingTaskDto>('/housekeeping', dto).then(r => r.data),

    update: (id: number, dto: UpdateHousekeepingTaskDto) =>
        apiClient.put<HousekeepingTaskDto>(`/housekeeping/${id}`, dto).then(r => r.data),

    delete: (id: number) =>
        apiClient.delete(`/housekeeping/${id}`),

    startTask: (id: number) =>
        apiClient.post<HousekeepingTaskDto>(`/housekeeping/${id}/start`).then(r => r.data),

    completeTask: (id: number) =>
        apiClient.post<HousekeepingTaskDto>(`/housekeeping/${id}/complete`).then(r => r.data),

    getSchedule: (hotelId: number, date?: string) =>
        apiClient.get<HousekeepingScheduleDto>(`/housekeeping/hotel/${hotelId}/schedule`, { params: { date } }).then(r => r.data),

    getPerformance: (hotelId: number, from?: string, to?: string) =>
        apiClient.get<HousekeeperPerformanceDto[]>(`/housekeeping/hotel/${hotelId}/performance`, { params: { from, to } }).then(r => r.data),

    generateDailyTasks: (hotelId: number, date?: string) =>
        apiClient.post(`/housekeeping/hotel/${hotelId}/generate-daily`, null, { params: { date } }).then(r => r.data),
};
