'use client';

import { useState, useEffect } from 'react';
import { useCreateReservation, useUpdateReservation, useDeleteReservation, useConfirmReservation, useCheckIn, useCheckOut, useCancelReservation } from '@/hooks/useReservations';
import { useHotels } from '@/hooks/useHotels';
import { useRoomsByHotel } from '@/hooks/useRooms';
import { useGuests, useCreateGuest, useMyGuestProfile } from '@/hooks/useGuests';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateReservationDto, UpdateReservationDto, BookingType, PaymentMethod, ReservationStatus, CreateGuestDto, Room } from '@/types';
import { Calendar, Clock, User, Home, DollarSign, AlertCircle, Check, X, LogIn, LogOut, UserPlus, Search } from 'lucide-react';
import { AvailabilityCalendar } from './AvailabilityCalendar';

type DialogMode = 'create' | 'edit' | 'view';

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  reservation?: any; // Existing reservation for edit/view mode
  initialDate?: Date; // Pre-fill date for create mode
  onSuccess?: () => void;
}

export default function ReservationDialog({
  open,
  onOpenChange,
  mode,
  reservation,
  initialDate,
  onSuccess,
}: ReservationDialogProps) {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const confirmReservation = useConfirmReservation();
  const checkInReservation = useCheckIn();
  const checkOutReservation = useCheckOut();
  const cancelReservation = useCancelReservation();
  const createGuest = useCreateGuest();
  
  const { data: hotels } = useHotels();
  const { data: guests } = useGuests();
  
  // Auto-fetch guest profile for guest users only
  const isGuestUser = user?.roles.includes('Guest');
  const { data: myGuestProfile } = useMyGuestProfile(!!isGuestUser);

  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [selectedHotelId, setSelectedHotelId] = useState<number>(0);
  const { data: rooms } = useRoomsByHotel(selectedHotelId || undefined);
  
  // Check if reservation is completed (only notes/admin fields can be edited)
  const isCompletedReservation = reservation && (
    reservation.status === ReservationStatus.CheckedOut ||
    reservation.status === ReservationStatus.Cancelled ||
    reservation.status === ReservationStatus.NoShow
  );
  
  // Walk-in guest state
  const [isWalkInMode, setIsWalkInMode] = useState(false);
  const [walkInGuestData, setWalkInGuestData] = useState<CreateGuestDto>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  
  // Availability search mode
  const [useAvailabilitySearch, setUseAvailabilitySearch] = useState(false);

  const [formData, setFormData] = useState<CreateReservationDto>({
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
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateReservationDto | keyof CreateGuestDto, string>>>({});
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  // Helper to format date for datetime-local input without timezone conversion
  const formatDateTimeLocal = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Initialize form data based on mode
  useEffect(() => {
    // Reset editing state based on mode
    setIsEditing(mode === 'create' || mode === 'edit');
    
    if (mode === 'create') {
      const dateStr = initialDate ? initialDate.toISOString().split('T')[0] : '';
      
      // Pre-fill room and hotel if provided (from timeline click)
      if (reservation?.roomId && reservation?.hotelId) {
        setFormData(prev => ({
          ...prev,
          checkInDate: dateStr,
          hotelId: reservation.hotelId,
          roomId: reservation.roomId,
        }));
        setSelectedHotelId(reservation.hotelId);
      } else if (initialDate) {
        // Just pre-fill date if no room specified
        setFormData(prev => ({
          ...prev,
          checkInDate: dateStr,
        }));
      }
    } else if ((mode === 'edit' || mode === 'view') && reservation) {
      setSelectedHotelId(reservation.hotelId);
      setFormData({
        hotelId: reservation.hotelId,
        roomId: reservation.roomId,
        guestId: reservation.guestId,
        bookingType: reservation.bookingType,
        checkInDate: formatDateTimeLocal(reservation.checkInDate),
        checkOutDate: formatDateTimeLocal(reservation.checkOutDate),
        numberOfGuests: reservation.numberOfGuests,
        depositAmount: reservation.depositAmount || 0,
        paymentMethod: reservation.paymentMethod,
        paymentReference: reservation.paymentReference || '',
        specialRequests: reservation.specialRequests || '',
        notes: reservation.notes || '',
        durationInHours: reservation.durationInHours,
      });
    }
  }, [mode, reservation, initialDate]);

  // Update selected room when roomId changes
  useEffect(() => {
    if (formData.roomId && rooms) {
      const room = rooms.find(r => r.id === formData.roomId);
      setSelectedRoom(room);
    } else {
      setSelectedRoom(null);
    }
  }, [formData.roomId, rooms]);

  // Calculate total amount and auto-fill duration for short stays
  useEffect(() => {
    if (selectedRoom && formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (formData.bookingType === BookingType.Daily) {
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (nights > 0) {
          setCalculatedAmount(nights * selectedRoom.pricePerNight);
        }
      } else if (formData.bookingType === BookingType.ShortStay) {
        const hours = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60));
        if (hours > 0) {
          setFormData(prev => ({ ...prev, durationInHours: hours }));
          setCalculatedAmount(hours * (selectedRoom.shortStayHourlyRate || 0));
        }
      }
    }
  }, [selectedRoom, formData.checkInDate, formData.checkOutDate, formData.bookingType]);

  const handleRoomSelectFromAvailability = (room: Room) => {
    setFormData(prev => ({
      ...prev,
      hotelId: room.hotelId,
      roomId: room.id,
    }));
    setSelectedHotelId(room.hotelId);
    setSelectedRoom(room);
    setUseAvailabilitySearch(false); // Switch back to form view
    showToast(`Room ${room.roomNumber} selected`, 'success');
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateReservationDto | keyof CreateGuestDto, string>> = {};

    if (!formData.hotelId) newErrors.hotelId = 'Hotel is required';
    if (!formData.roomId) newErrors.roomId = 'Room is required';
    
    // Validate guest selection or walk-in guest data
    if (isWalkInMode && mode === 'create') {
      if (!walkInGuestData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!walkInGuestData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!walkInGuestData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(walkInGuestData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!walkInGuestData.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';
    } else if (!isGuestUser && !formData.guestId) {
      // Only require guest selection for staff users (not for guest users who auto-use their profile)
      newErrors.guestId = 'Guest is required';
    }
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'Number of guests must be at least 1';
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);

      if (formData.bookingType === BookingType.ShortStay) {
        // For short stays, allow same-day but check-out time must be after check-in time
        if (checkOut <= checkIn) {
          newErrors.checkOutDate = 'Check-out time must be after check-in time';
        }
      } else {
        // For overnight stays, check-out must be on a later date
        if (checkOut.toDateString() === checkIn.toDateString()) {
          newErrors.checkOutDate = 'Check-out date must be after check-in date for overnight stays';
        } else if (checkOut <= checkIn) {
          newErrors.checkOutDate = 'Check-out must be after check-in';
        }
      }
    }

    // Short-stay specific validations
    if (formData.bookingType === BookingType.ShortStay) {
      if (!formData.durationInHours || formData.durationInHours < 1) {
        newErrors.durationInHours = 'Duration is required for short-stay bookings';
      }
      if (selectedRoom && !selectedRoom.allowsShortStay) {
        newErrors.roomId = 'Selected room does not allow short-stay bookings';
      }
    }

    // Room capacity validation
    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      newErrors.numberOfGuests = `Room capacity is ${selectedRoom.capacity} guests`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    try {
      let guestId = formData.guestId;
      
      // For guest users, automatically use their profile
      if (isGuestUser && myGuestProfile && mode === 'create') {
        guestId = myGuestProfile.id;
      }
      // If walk-in mode (staff creating for guest), create the guest first
      else if (isWalkInMode && mode === 'create') {
        const newGuest = await createGuest.mutateAsync({
          ...walkInGuestData,
          hotelId: formData.hotelId, // Associate with the selected hotel
        });
        guestId = newGuest.id;
        showToast('Walk-in guest created', 'success');
      }
      
      if (mode === 'create') {
        await createReservation.mutateAsync({
          ...formData,
          guestId, // Use guest profile ID, walk-in guest ID, or selected guest ID
        });
        showToast('Reservation created successfully', 'success');
      } else if (mode === 'edit' || (mode === 'view' && isEditing)) {
        // Handle both explicit edit mode and edit from view mode
        await updateReservation.mutateAsync({
          id: reservation.id,
          data: formData as UpdateReservationDto,
        });
        showToast('Reservation updated successfully', 'success');
        setIsEditing(false); // Reset editing state after successful update
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      // Extract error message from axios error response
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.title 
        || error?.response?.data 
        || error?.message 
        || 'An error occurred while creating the reservation';
      
      showToast(errorMessage, 'error');
      console.error('Reservation error:', error);
    }
  };

  const handleDelete = async () => {
    if (!reservation || !confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      await deleteReservation.mutateAsync(reservation.id);
      showToast('Reservation deleted successfully', 'success');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || error?.message || 'Failed to delete reservation';
      showToast(errorMessage, 'error');
    }
  };

  const handleConfirm = async () => {
    if (!reservation) return;
    try {
      await confirmReservation.mutateAsync(reservation.id);
      showToast('Reservation confirmed', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || error?.message || 'Failed to confirm reservation';
      showToast(errorMessage, 'error');
    }
  };

  const handleCheckIn = async () => {
    if (!reservation) return;
    try {
      await checkInReservation.mutateAsync(reservation.id);
      showToast('Guest checked in', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || error?.message || 'Failed to check in';
      showToast(errorMessage, 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!reservation) return;
    try {
      await checkOutReservation.mutateAsync(reservation.id);
      showToast('Guest checked out', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || error?.message || 'Failed to check out';
      showToast(errorMessage, 'error');
    }
  };

  const handleCancel = async () => {
    if (!reservation || !confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await cancelReservation.mutateAsync({ 
        id: reservation.id, 
        data: { reason: 'Cancelled by user' }
      });
      showToast('Reservation cancelled', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || error?.message || 'Failed to cancel reservation';
      showToast(errorMessage, 'error');
    }
  };

  const getStatusBadge = (status: number) => {
    const variants: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      0: { label: 'Pending', variant: 'secondary' },
      1: { label: 'Confirmed', variant: 'default' },
      2: { label: 'Checked In', variant: 'default' },
      3: { label: 'Checked Out', variant: 'outline' },
      4: { label: 'Cancelled', variant: 'destructive' },
      5: { label: 'No Show', variant: 'destructive' },
    };
    const config = variants[status] || variants[0];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const inputType = formData.bookingType === BookingType.ShortStay ? 'datetime-local' : 'date';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === 'create' && 'Create New Reservation'}
              {mode === 'edit' && 'Edit Reservation'}
              {mode === 'view' && 'Reservation Details'}
            </DialogTitle>
            {mode === 'view' && reservation && (
              <div className="flex items-center gap-2">
                {getStatusBadge(reservation.status)}
              </div>
            )}
          </div>
          {mode === 'view' && (
            <DialogDescription>
              Reservation #{reservation?.id} - {reservation?.guestName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Actions - Always visible for existing reservations */}
          {(mode === 'view' || mode === 'edit') && reservation && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 w-full mb-1">Status Actions:</p>
              {reservation.status === ReservationStatus.Pending && (
                <Button variant="outline" size="sm" onClick={handleConfirm} className="bg-white hover:bg-blue-100">
                  <Check className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              )}
              {reservation.status === ReservationStatus.Confirmed && (
                <Button variant="outline" size="sm" onClick={handleCheckIn} className="bg-green-50 hover:bg-green-100 border-green-300">
                  <LogIn className="h-4 w-4 mr-1" />
                  Check In
                </Button>
              )}
              {reservation.status === ReservationStatus.CheckedIn && (
                <Button variant="outline" size="sm" onClick={handleCheckOut} className="bg-orange-50 hover:bg-orange-100 border-orange-300">
                  <LogOut className="h-4 w-4 mr-1" />
                  Check Out
                </Button>
              )}
              {reservation.status !== ReservationStatus.Cancelled && reservation.status !== ReservationStatus.CheckedOut && (
                <Button variant="destructive" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel Reservation
                </Button>
              )}
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-white hover:bg-gray-100 ml-auto">
                  ✏️ Edit Details
                </Button>
              )}
            </div>
          )}

          {/* View Mode - Display Only */}
          {mode === 'view' && !isEditing && reservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Guest</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{reservation.guestName}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Hotel</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{reservation.hotelName}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Room</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">Room {reservation.roomNumber}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Booking Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {reservation.bookingType === BookingType.ShortStay && <Clock className="h-4 w-4 text-purple-600" />}
                    <span className="font-medium">
                      {reservation.bookingType === BookingType.ShortStay ? 'Short Stay' : 'Daily'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Check-in</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(reservation.checkInDate).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Check-out</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(reservation.checkOutDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Total Amount</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-lg">${reservation.totalAmount || 0}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Number of Guests</Label>
                  <div className="mt-1">
                    <span className="font-medium">{reservation.numberOfGuests}</span>
                  </div>
                </div>
              </div>

              {reservation.specialRequests && (
                <div>
                  <Label className="text-xs text-gray-500">Special Requests</Label>
                  <p className="mt-1 text-sm">{reservation.specialRequests}</p>
                </div>
              )}

              {reservation.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Notes</Label>
                  <p className="mt-1 text-sm">{reservation.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Edit/Create Mode - Form */}
          {(mode === 'create' || mode === 'edit' || isEditing) && (
            <div className="space-y-4">
              {/* Warning for completed reservations */}
              {isCompletedReservation && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ℹ️ This reservation is completed. Only notes, special requests, and payment reference can be edited.
                  </p>
                </div>
              )}
              
              {/* Hotel & Room - with Availability Search Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Room Selection</Label>
                  {mode === 'create' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUseAvailabilitySearch(!useAvailabilitySearch);
                        setErrors({});
                      }}
                      className="text-xs h-7"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      {useAvailabilitySearch ? 'Manual Selection' : 'Search Available'}
                    </Button>
                  )}
                </div>
                
                {/* Hotel Selector - Always Visible */}
                <div>
                  <Label htmlFor="hotel">Hotel *</Label>
                  <Select
                    value={formData.hotelId?.toString()}
                    onValueChange={(value) => {
                      const hotelId = parseInt(value);
                      setFormData({ ...formData, hotelId, roomId: 0 });
                      setSelectedHotelId(hotelId);
                    }}
                    disabled={isCompletedReservation}
                  >
                    <SelectTrigger className={errors.hotelId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select hotel" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {hotels?.map(hotel => (
                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hotelId && <p className="text-xs text-red-500 mt-1">{errors.hotelId}</p>}
                </div>

                {/* Room Selection - Toggle between Calendar and Dropdown */}
                {useAvailabilitySearch ? (
                  /* Availability Calendar View */
                  formData.hotelId ? (
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                      <AvailabilityCalendar
                        hotelId={formData.hotelId}
                        defaultCheckIn={formData.checkInDate}
                        defaultCheckOut={formData.checkOutDate}
                        defaultBookingType={formData.bookingType}
                        onRoomSelect={handleRoomSelectFromAvailability}
                        selectedRoomId={formData.roomId || undefined}
                        compact={true}
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 bg-gray-50 text-center">
                      <p className="text-gray-500">Please select a hotel first to search available rooms</p>
                    </div>
                  )
                ) : (
                  /* Manual Room Dropdown */
                  <div>
                    <Label htmlFor="room">Room *</Label>
                    <Select
                      value={formData.roomId?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, roomId: parseInt(value) })}
                      disabled={!selectedHotelId || isCompletedReservation}
                    >
                      <SelectTrigger className={errors.roomId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={5}>
                        {rooms?.map(room => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            Room {room.roomNumber} (${room.pricePerNight}/night, Cap: {room.capacity})
                            {room.allowsShortStay && ' ⏰'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRoom && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        <span>Capacity: {selectedRoom.capacity} guests</span>
                        {selectedRoom.allowsShortStay && (
                          <span className="text-purple-600">• Short-stay available</span>
                        )}
                      </div>
                    )}
                    {errors.roomId && <p className="text-xs text-red-500 mt-1">{errors.roomId}</p>}
                  </div>
                )}
              </div>

              {/* Guest Selection or Walk-in */}
              {!isGuestUser ? (
                // Staff users: Show guest selector or walk-in form
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="guest">Guest *</Label>
                    {mode === 'create' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsWalkInMode(!isWalkInMode);
                          setErrors({});
                        }}
                        className="text-xs h-7"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        {isWalkInMode ? 'Select Existing' : 'Walk-in Guest'}
                      </Button>
                    )}
                  </div>
                  
                  {!isWalkInMode ? (
                    // Existing Guest Selection
                    <>
                      <Select
                        value={formData.guestId?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, guestId: parseInt(value) })}
                        disabled={isCompletedReservation}
                      >
                        <SelectTrigger className={errors.guestId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select guest" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={5}>
                          {guests?.map(guest => (
                            <SelectItem key={guest.id} value={guest.id.toString()}>
                              {guest.firstName} {guest.lastName} - {guest.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.guestId && <p className="text-xs text-red-500 mt-1">{errors.guestId}</p>}
                    </>
                  ) : (
                  // Walk-in Guest Quick Form
                  <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold">Quick Walk-in Guest</p>
                        <p>Enter required info. You can add more details later from the Guests page.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="walkInFirstName" className="text-xs">First Name *</Label>
                        <Input
                          id="walkInFirstName"
                          value={walkInGuestData.firstName}
                          onChange={(e) => setWalkInGuestData({ ...walkInGuestData, firstName: e.target.value })}
                          placeholder="John"
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="walkInLastName" className="text-xs">Last Name *</Label>
                        <Input
                          id="walkInLastName"
                          value={walkInGuestData.lastName}
                          onChange={(e) => setWalkInGuestData({ ...walkInGuestData, lastName: e.target.value })}
                          placeholder="Doe"
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="walkInEmail" className="text-xs">Email *</Label>
                        <Input
                          id="walkInEmail"
                          type="email"
                          value={walkInGuestData.email}
                          onChange={(e) => setWalkInGuestData({ ...walkInGuestData, email: e.target.value })}
                          placeholder="john.doe@email.com"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="walkInPhone" className="text-xs">Phone Number *</Label>
                        <Input
                          id="walkInPhone"
                          type="tel"
                          value={walkInGuestData.phoneNumber}
                          onChange={(e) => setWalkInGuestData({ ...walkInGuestData, phoneNumber: e.target.value })}
                          placeholder="+1234567890"
                          className={errors.phoneNumber ? 'border-red-500' : ''}
                        />
                        {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              ) : (
                // Guest users: Show info that they're booking for themselves
                <div className="space-y-2">
                  <Label>Booking As</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                    <User className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold">
                        {myGuestProfile ? `${myGuestProfile.firstName} ${myGuestProfile.lastName}` : user?.fullName}
                      </p>
                      <p className="text-xs">{myGuestProfile?.email || user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="bookingType">Booking Type *</Label>
                <Select
                  value={formData.bookingType?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, bookingType: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    <SelectItem value={BookingType.Daily.toString()}>Daily (Overnight)</SelectItem>
                    <SelectItem value={BookingType.ShortStay.toString()}>Short-Stay (Hourly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.bookingType === BookingType.ShortStay && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="text-xs text-purple-800">
                    <p className="font-semibold">Short-Stay Booking</p>
                    <p>Select both date and time for check-in and check-out. Same-day bookings are allowed.</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check-in *</Label>
                  <Input
                    id="checkIn"
                    type={inputType}
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className={errors.checkInDate ? 'border-red-500' : ''}
                    disabled={isCompletedReservation}
                  />
                  {errors.checkInDate && <p className="text-xs text-red-500 mt-1">{errors.checkInDate}</p>}
                </div>

                <div>
                  <Label htmlFor="checkOut">Check-out *</Label>
                  <Input
                    id="checkOut"
                    type={inputType}
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className={errors.checkOutDate ? 'border-red-500' : ''}
                    disabled={isCompletedReservation}
                  />
                  {errors.checkOutDate && <p className="text-xs text-red-500 mt-1">{errors.checkOutDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guests">Number of Guests *</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity}
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                    className={errors.numberOfGuests ? 'border-red-500' : ''}
                    disabled={isCompletedReservation}
                  />
                  {selectedRoom && (
                    <p className="text-xs text-gray-500 mt-1">
                      Max capacity: {selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'guest' : 'guests'}
                    </p>
                  )}
                  {errors.numberOfGuests && <p className="text-xs text-red-500 mt-1">{errors.numberOfGuests}</p>}
                </div>

                {formData.bookingType === BookingType.ShortStay && formData.durationInHours && (
                  <div>
                    <Label>Duration</Label>
                    <Input
                      type="text"
                      value={`${formData.durationInHours} hours`}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
                  </div>
                )}
              </div>

              {calculatedAmount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <Label className="text-xs text-green-800">Estimated Total</Label>
                  <p className="text-2xl font-bold text-green-600">${calculatedAmount.toFixed(2)}</p>
                </div>
              )}

              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Any special requirements..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes..."
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          {/* Left side - Danger actions */}
          <div className="flex gap-2">
            {mode === 'view' && !isEditing && reservation && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Delete Permanently
              </Button>
            )}
          </div>

          {/* Right side - Primary actions */}
          <div className="flex gap-2">
            {(mode === 'create' || mode === 'edit' || isEditing) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isEditing && mode === 'view') {
                      setIsEditing(false);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createReservation.isPending || updateReservation.isPending}
                >
                  {(createReservation.isPending || updateReservation.isPending) ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {mode === 'create' ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    mode === 'create' ? 'Create Reservation' : 'Save Changes'
                  )}
                </Button>
              </>
            )}
            {mode === 'view' && !isEditing && (
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
