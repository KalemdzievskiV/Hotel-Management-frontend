import { useRef, useState } from 'react';
import {
  useCancelReservation, useCheckIn, useCheckOut, useConfirmReservation, useDeleteReservation,
} from '@/hooks/useReservations';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/errors';

/**
 * Status changes for an existing reservation, each with its own success/error toast. One runs at
 * a time (`busy`), so a second tap on a phone can't send it twice; on success the dialog closes,
 * so the toast and the updated list are visible.
 */
export function useReservationActions(reservationId: number | undefined, onDone: (closeDialog: boolean) => void) {
  const { showToast } = useToast();
  const confirmReservation = useConfirmReservation();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelReservation = useCancelReservation();
  const deleteReservation = useDeleteReservation();

  // The ref blocks taps that land before React re-renders with busy=true
  const running = useRef(false);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    if (!reservationId || running.current) return;
    running.current = true;
    setBusy(true);
    try {
      await action();
      showToast(success, 'success');
      onDone(true);
    } catch (error) {
      showToast(getApiErrorMessage(error, failure), 'error');
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  return {
    busy,
    confirm: () => run(() => confirmReservation.mutateAsync(reservationId!), 'Reservation confirmed', 'Failed to confirm reservation'),
    checkIn: () => run(() => checkIn.mutateAsync(reservationId!), 'Guest checked in', 'Failed to check in'),
    checkOut: () => run(() => checkOut.mutateAsync(reservationId!), 'Guest checked out', 'Failed to check out'),
    cancel: () => {
      if (!confirm('Are you sure you want to cancel this reservation?')) return;
      return run(
        () => cancelReservation.mutateAsync({ id: reservationId!, data: { reason: 'Cancelled by user' } }),
        'Reservation cancelled',
        'Failed to cancel reservation'
      );
    },
    remove: () => {
      if (!confirm('Are you sure you want to delete this reservation?')) return;
      return run(() => deleteReservation.mutateAsync(reservationId!), 'Reservation deleted successfully', 'Failed to delete reservation');
    },
  };
}
