'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReservationDialog from '@/components/reservations/ReservationDialog';

/** Kept for links to /reservations/new: opens the same booking form as the rest of the app */
export default function NewReservationPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <ReservationDialog
        open
        onOpenChange={(open) => {
          if (!open) router.push('/dashboard/reservations');
        }}
        mode="create"
      />
    </DashboardLayout>
  );
}
