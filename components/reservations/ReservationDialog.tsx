'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useCreateReservation, useUpdateReservation } from '@/hooks/useReservations';
import { useHotels } from '@/hooks/useHotels';
import { useRoomsByHotel } from '@/hooks/useRooms';
import { useGuests, useCreateGuest, useMyGuestProfile } from '@/hooks/useGuests';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/calendar/calendarUtils';
import { getApiErrorMessage } from '@/lib/api/errors';
import { BookingType, CreateGuestDto, CreateReservationDto, Reservation, ReservationStatus, UpdateReservationDto } from '@/types';
import ReservationStatusActions from './dialog/ReservationStatusActions';
import ReservationSummary from './dialog/ReservationSummary';
import RoomSelectionFields from './dialog/RoomSelectionFields';
import GuestFields from './dialog/GuestFields';
import StayFields from './dialog/StayFields';
import { useReservationActions } from './dialog/useReservationActions';
import { estimateTotal, getStayLength, validateReservationForm } from './dialog/validation';
import { ReservationDialogMode, ReservationFormErrors } from './dialog/types';

/** Room to preselect when creating a reservation (e.g. from a calendar row) */
export type ReservationPrefill = { roomId: number; hotelId: number };

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ReservationDialogMode;
  /** The existing reservation in edit/view mode; an optional room prefill in create mode */
  reservation?: Reservation | ReservationPrefill | null;
  initialDate?: Date; // Pre-fill check-in date for create mode
  onSuccess?: () => void;
}

const EMPTY_FORM: CreateReservationDto = {
  hotelId: 0,
  roomId: 0,
  guestId: 0,
  bookingType: BookingType.Daily,
  checkInDate: '',
  checkOutDate: '',
  numberOfGuests: 1,
  depositAmount: 0,
  paymentMethod: undefined,
  paymentReference: '',
  specialRequests: '',
  notes: '',
};

const EMPTY_WALK_IN: CreateGuestDto = { firstName: '', lastName: '', email: '', phoneNumber: '' };

// Stay dates are hotel wall-clock values, so read them straight from the ISO string instead of
// converting to the browser's time zone. Overnight stays use a date input, short stays datetime-local.
function toStayInputValue(value: string | Date, bookingType: BookingType) {
  const iso = typeof value === 'string' ? value : value.toISOString();
  return bookingType === BookingType.ShortStay ? iso.slice(0, 16) : iso.slice(0, 10);
}

function isFinished(status: ReservationStatus) {
  return status === ReservationStatus.CheckedOut || status === ReservationStatus.Cancelled || status === ReservationStatus.NoShow;
}

/**
 * Radix unmounts dialog content while closed, so the body's state starts fresh on every open;
 * the key covers props changing while the dialog stays open.
 */
export default function ReservationDialog(props: ReservationDialogProps) {
  const { open, onOpenChange, mode, reservation, initialDate } = props;
  const existingId = mode !== 'create' && reservation && 'id' in reservation ? reservation.id : undefined;
  const bodyKey = `${mode}-${existingId ?? reservation?.roomId ?? 'new'}-${initialDate?.getTime() ?? ''}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto">
        <ReservationDialogBody key={bodyKey} {...props} />
      </DialogContent>
    </Dialog>
  );
}

function initialFormData(mode: ReservationDialogMode, reservation: ReservationDialogProps['reservation'], initialDate?: Date): CreateReservationDto {
  if (mode !== 'create' && reservation && 'id' in reservation) {
    return {
      hotelId: reservation.hotelId,
      roomId: reservation.roomId,
      guestId: reservation.guestId,
      bookingType: reservation.bookingType,
      checkInDate: toStayInputValue(reservation.checkInDate, reservation.bookingType),
      checkOutDate: toStayInputValue(reservation.checkOutDate, reservation.bookingType),
      numberOfGuests: reservation.numberOfGuests,
      depositAmount: 0,
      paymentMethod: reservation.paymentMethod,
      paymentReference: reservation.paymentReference || '',
      specialRequests: reservation.specialRequests || '',
      notes: reservation.notes || '',
      durationInHours: reservation.durationInHours,
    };
  }

  return {
    ...EMPTY_FORM,
    // Format the local calendar date; toISOString() would shift it to the previous day east of UTC
    checkInDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    hotelId: reservation?.hotelId ?? 0,
    roomId: reservation?.roomId ?? 0,
  };
}

function ReservationDialogBody({
  onOpenChange, mode, reservation, initialDate, onSuccess,
}: ReservationDialogProps) {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { isGuest, canDeleteReservations } = usePermissions();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const createGuest = useCreateGuest();

  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [formData, setFormData] = useState<CreateReservationDto>(() => initialFormData(mode, reservation, initialDate));
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInGuest, setWalkInGuest] = useState<CreateGuestDto>(EMPTY_WALK_IN);
  const [errors, setErrors] = useState<ReservationFormErrors>({});

  const { data: hotels = [] } = useHotels();
  const { data: guests = [] } = useGuests();
  const { data: myGuestProfile } = useMyGuestProfile(isGuest);
  const { data: rooms = [] } = useRoomsByHotel(formData.hotelId || undefined);

  const existing = mode !== 'create' && reservation && 'id' in reservation ? reservation : undefined;
  const finished = !!existing && isFinished(existing.status);
  const selectedRoom = useMemo(() => rooms.find(r => r.id === formData.roomId) ?? null, [rooms, formData.roomId]);
  const estimatedTotal = estimateTotal(formData, selectedRoom);

  const updateForm = (changes: Partial<CreateReservationDto>) => setFormData(prev => ({ ...prev, ...changes }));

  const actions = useReservationActions(existing?.id, (closeDialog) => {
    onSuccess?.();
    if (closeDialog) onOpenChange(false);
  });

  const handleSubmit = async () => {
    const walkIn = isWalkIn && mode === 'create';
    const validationErrors = validateReservationForm({
      formData,
      room: selectedRoom,
      requireGuest: !isGuest,
      walkInGuest: walkIn ? walkInGuest : null,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    const durationInHours = formData.bookingType === BookingType.ShortStay ? getStayLength(formData) : undefined;

    try {
      if (mode === 'create') {
        let guestId = formData.guestId;
        if (isGuest && myGuestProfile) {
          guestId = myGuestProfile.id;
        } else if (walkIn) {
          const newGuest = await createGuest.mutateAsync({ ...walkInGuest, hotelId: formData.hotelId });
          guestId = newGuest.id;
          showToast('Walk-in guest created', 'success');
        }

        await createReservation.mutateAsync({ ...formData, guestId, durationInHours });
        showToast('Reservation created successfully', 'success');
      } else {
        await updateReservation.mutateAsync({
          id: existing!.id,
          data: { ...formData, durationInHours } as UpdateReservationDto,
        });
        showToast('Reservation updated successfully', 'success');
        setIsEditing(false);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'An error occurred while saving the reservation'), 'error');
    }
  };

  const saving = createReservation.isPending || updateReservation.isPending;
  const showForm = mode === 'create' || mode === 'edit' || isEditing;
  const selfName = myGuestProfile ? `${myGuestProfile.firstName} ${myGuestProfile.lastName}` : user?.fullName ?? '';

  return (
    <>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === 'create' && 'Create New Reservation'}
              {mode === 'edit' && 'Edit Reservation'}
              {mode === 'view' && 'Reservation Details'}
            </DialogTitle>
            {mode === 'view' && existing && <StatusBadge status={existing.status} />}
          </div>
          {mode === 'view' && existing && (
            <DialogDescription>Reservation #{existing.id} - {existing.guestName}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {existing && (
            <ReservationStatusActions
              status={existing.status}
              canManage={!isGuest}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onConfirm={actions.confirm}
              onCheckIn={actions.checkIn}
              onCheckOut={actions.checkOut}
              onCancel={actions.cancel}
            />
          )}

          {mode === 'view' && !isEditing && existing && <ReservationSummary reservation={existing} />}

          {showForm && (
            <div className="space-y-4">
              {finished && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ℹ️ This reservation is completed. Only notes, special requests, and payment reference can be edited.
                  </p>
                </div>
              )}

              <RoomSelectionFields
                formData={formData}
                hotels={hotels}
                rooms={rooms}
                selectedRoom={selectedRoom}
                errors={errors}
                allowAvailabilitySearch={mode === 'create'}
                disabled={finished}
                onHotelChange={(hotelId) => updateForm({ hotelId, roomId: 0 })}
                onRoomChange={(room) => {
                  updateForm({ hotelId: room.hotelId, roomId: room.id });
                  showToast(`Room ${room.roomNumber} selected`, 'success');
                }}
                onClearErrors={() => setErrors({})}
              />

              <GuestFields
                bookingForSelf={isGuest}
                selfName={selfName}
                selfEmail={myGuestProfile?.email || user?.email || ''}
                guests={guests}
                guestId={formData.guestId}
                onGuestChange={(guestId) => updateForm({ guestId })}
                walkIn={isWalkIn}
                allowWalkIn={mode === 'create'}
                onWalkInChange={(walkIn) => {
                  setIsWalkIn(walkIn);
                  setErrors({});
                }}
                walkInGuest={walkInGuest}
                onWalkInGuestChange={setWalkInGuest}
                errors={errors}
                disabled={finished}
              />

              <StayFields
                formData={{
                  ...formData,
                  durationInHours: formData.bookingType === BookingType.ShortStay ? getStayLength(formData) || undefined : undefined,
                }}
                onChange={updateForm}
                selectedRoom={selectedRoom}
                estimatedTotal={estimatedTotal}
                errors={errors}
                stayLocked={finished}
                bookingTypeLocked={mode !== 'create'}
                showInternalNotes={!isGuest}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {mode === 'view' && !isEditing && existing && canDeleteReservations && existing.status === ReservationStatus.Pending && (
              <Button variant="ghost" size="sm" onClick={actions.remove} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Delete Permanently
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {showForm ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => (isEditing && mode === 'view' ? setIsEditing(false) : onOpenChange(false))}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {mode === 'create' ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    mode === 'create' ? 'Create Reservation' : 'Save Changes'
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            )}
          </div>
        </DialogFooter>
    </>
  );
}
