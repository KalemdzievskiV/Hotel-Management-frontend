import { Check, LogIn, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReservationStatus } from '@/types';

interface ReservationStatusActionsProps {
  status: ReservationStatus;
  /** Staff can move a reservation through its lifecycle; guests can only cancel */
  canManage: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onCancel: () => void;
}

export default function ReservationStatusActions({
  status, canManage, isEditing, onEdit, onConfirm, onCheckIn, onCheckOut, onCancel,
}: ReservationStatusActionsProps) {
  const canCancel = status === ReservationStatus.Pending || status === ReservationStatus.Confirmed;

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-xs font-semibold text-blue-900 w-full mb-1">Status Actions:</p>
      {canManage && status === ReservationStatus.Pending && (
        <Button variant="outline" size="sm" onClick={onConfirm} className="bg-white hover:bg-blue-100">
          <Check className="h-4 w-4 mr-1" />
          Confirm
        </Button>
      )}
      {canManage && status === ReservationStatus.Confirmed && (
        <Button variant="outline" size="sm" onClick={onCheckIn} className="bg-green-50 hover:bg-green-100 border-green-300">
          <LogIn className="h-4 w-4 mr-1" />
          Check In
        </Button>
      )}
      {canManage && status === ReservationStatus.CheckedIn && (
        <Button variant="outline" size="sm" onClick={onCheckOut} className="bg-orange-50 hover:bg-orange-100 border-orange-300">
          <LogOut className="h-4 w-4 mr-1" />
          Check Out
        </Button>
      )}
      {canCancel && (
        <Button variant="destructive" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel Reservation
        </Button>
      )}
      {!isEditing && (
        <Button variant="outline" size="sm" onClick={onEdit} className="bg-white hover:bg-gray-100 ml-auto">
          ✏️ Edit Details
        </Button>
      )}
    </div>
  );
}
