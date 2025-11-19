import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';

const analyticsKeys = {
  all: ['analytics'] as const,
  revenue: () => [...analyticsKeys.all, 'revenue'] as const,
  revenueBreakdown: (startDate?: Date, endDate?: Date) => 
    [...analyticsKeys.revenue(), 'breakdown', startDate?.toISOString(), endDate?.toISOString()] as const,
};

// Get revenue breakdown
export function useRevenueBreakdown(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: analyticsKeys.revenueBreakdown(startDate, endDate),
    queryFn: () => analyticsApi.getRevenueBreakdown(startDate, endDate),
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}
