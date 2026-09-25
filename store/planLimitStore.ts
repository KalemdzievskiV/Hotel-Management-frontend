import { create } from 'zustand';
import { PlanLimitDetails } from '@/types';

interface PlanLimitStore {
  /** The latest refusal because of the plan, shown by PlanLimitDialog */
  refusal: (PlanLimitDetails & { message: string }) | null;
  show: (refusal: PlanLimitDetails & { message: string }) => void;
  dismiss: () => void;
}

export const usePlanLimitStore = create<PlanLimitStore>(set => ({
  refusal: null,
  show: refusal => set({ refusal }),
  dismiss: () => set({ refusal: null }),
}));
