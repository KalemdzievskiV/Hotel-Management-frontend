import {
  useCancelReservation, useCheckIn, useCheckOut, useConfirmReservation, useDeleteReservation,
} from '@/hooks/useReservations';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/errors';

/**
 * Status changes for an existing reservation, each with its own success/error toast
 */
export function useReservationActions(reservationId: number | undefined, onDone: (closeDialog: boolean) => void) {
  const { showToast } = useToast();
  const confirmReservation = useConfirmReservation();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelReservation = useCancelReservation();
  const deleteReservation = useDeleteReservation();

  const run = async (action: () => Promise<unknown>, success: string, failure: string, closeDialog = false) => {
    if (!reservationId) return;
    try {
      await action();
      showToast(success, 'success');
      onDone(closeDialog);
    } catch (error) {
      showToast(getApiErrorMessage(error, failure), 'error');
    }
  };

  return {
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
      return run(() => deleteReservation.mutateAsync(reservationId!), 'Reservation deleted successfully', 'Failed to delete reservation', true);
    },
  };
}
