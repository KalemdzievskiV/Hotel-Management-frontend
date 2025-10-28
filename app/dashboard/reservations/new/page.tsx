'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCreateReservation } from '@/hooks/useReservations';
import { useHotels } from '@/hooks/useHotels';
import { useRoomsByHotel } from '@/hooks/useRooms';
import { useGuests } from '@/hooks/useGuests';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateReservationDto, BookingType, PaymentMethod } from '@/types';

export default function NewReservationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createReservation = useCreateReservation();
  const { data: hotels } = useHotels();
  const { data: guests } = useGuests();

  const [selectedHotelId, setSelectedHotelId] = useState<number>(0);
  const { data: rooms } = useRoomsByHotel(selectedHotelId || undefined);

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

  const [errors, setErrors] = useState<Partial<Record<keyof CreateReservationDto, string>>>({});
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  // Update selected room when roomId changes
  useEffect(() => {
    if (formData.roomId && rooms) {
      const room = rooms.find(r => r.id === formData.roomId);
      setSelectedRoom(room);
    } else {
      setSelectedRoom(null);
    }
  }, [formData.roomId, rooms]);

  // Calculate total amount
  useEffect(() => {
    if (selectedRoom && formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (formData.bookingType === BookingType.Daily && nights > 0) {
        setCalculatedAmount(nights * selectedRoom.pricePerNight);
      } else if (formData.bookingType === BookingType.ShortStay && formData.durationInHours) {
        setCalculatedAmount(formData.durationInHours * (selectedRoom.shortStayHourlyRate || 0));
      }
    }
  }, [selectedRoom, formData.checkInDate, formData.checkOutDate, formData.bookingType, formData.durationInHours]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateReservationDto, string>> = {};

    if (!formData.hotelId) newErrors.hotelId = 'Hotel is required';
    if (!formData.roomId) newErrors.roomId = 'Room is required';
    if (!formData.guestId) newErrors.guestId = 'Guest is required';
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'Number of guests must be at least 1';
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out must be after check-in';
      }
    }

    if (formData.bookingType === BookingType.ShortStay) {
      if (!formData.durationInHours || formData.durationInHours < 1) {
        newErrors.durationInHours = 'Duration is required for short-stay bookings';
      }
      if (selectedRoom && !selectedRoom.allowsShortStay) {
        newErrors.roomId = 'Selected room does not allow short-stay bookings';
      }
    }

    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      newErrors.numberOfGuests = `Room capacity is ${selectedRoom.capacity} guests`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    try {
      // Clean up data
      const cleanedData: any = { ...formData };
      if (!cleanedData.depositAmount) delete cleanedData.depositAmount;
      if (!cleanedData.paymentMethod) delete cleanedData.paymentMethod;
      if (!cleanedData.paymentReference) delete cleanedData.paymentReference;
      if (!cleanedData.specialRequests) delete cleanedData.specialRequests;
      if (!cleanedData.notes) delete cleanedData.notes;
      if (formData.bookingType === BookingType.Daily) {
        delete cleanedData.durationInHours;
      }

      console.log('Creating reservation with data:', cleanedData);
      await createReservation.mutateAsync(cleanedData);
      showToast('Reservation created successfully!', 'success');
      router.push('/dashboard/reservations');
    } catch (error: any) {
      console.error('Reservation creation error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Failed to create reservation';
      showToast(errorMessage, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: any = value;
    
    if (name === 'hotelId' || name === 'roomId' || name === 'guestId' || name === 'bookingType' || name === 'paymentMethod') {
      parsedValue = value ? parseInt(value, 10) : 0;
    } else if (name === 'numberOfGuests' || name === 'depositAmount' || name === 'durationInHours') {
      parsedValue = value ? parseFloat(value) : 0;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Reset room when hotel changes
    if (name === 'hotelId') {
      setSelectedHotelId(parsedValue);
      setFormData(prev => ({ ...prev, roomId: 0 }));
    }
    
    if (errors[name as keyof CreateReservationDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">New Reservation</h1>
          <p className="mt-1 text-gray-600">Create a new booking</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hotelId">Hotel *</Label>
                <Select
                  name="hotelId"
                  value={formData.hotelId.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'hotelId', value } } as any)}
                >
                  <SelectTrigger className={errors.hotelId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels?.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hotelId && <p className="text-sm text-red-600">{errors.hotelId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomId">Room *</Label>
                <Select
                  name="roomId"
                  value={formData.roomId.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'roomId', value } } as any)}
                  disabled={!selectedHotelId}
                >
                  <SelectTrigger className={errors.roomId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms?.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.roomNumber} - {room.type} (${room.pricePerNight}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomId && <p className="text-sm text-red-600">{errors.roomId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestId">Guest *</Label>
                <Select
                  name="guestId"
                  value={formData.guestId.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'guestId', value } } as any)}
                >
                  <SelectTrigger className={errors.guestId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests?.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id.toString()}>
                        {guest.firstName} {guest.lastName} - {guest.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.guestId && <p className="text-sm text-red-600">{errors.guestId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingType">Booking Type *</Label>
                <Select
                  name="bookingType"
                  value={formData.bookingType.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'bookingType', value } } as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BookingType.Daily.toString()}>Daily (Overnight)</SelectItem>
                    <SelectItem value={BookingType.ShortStay.toString()}>Short-Stay (Hourly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Dates & Duration</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.checkInDate ? 'border-red-500' : ''}
                />
                {errors.checkInDate && <p className="text-sm text-red-600">{errors.checkInDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date *</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                  className={errors.checkOutDate ? 'border-red-500' : ''}
                />
                {errors.checkOutDate && <p className="text-sm text-red-600">{errors.checkOutDate}</p>}
              </div>

              {formData.bookingType === BookingType.ShortStay && (
                <div className="space-y-2">
                  <Label htmlFor="durationInHours">Duration (Hours) *</Label>
                  <Input
                    id="durationInHours"
                    type="number"
                    name="durationInHours"
                    value={formData.durationInHours || ''}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    className={errors.durationInHours ? 'border-red-500' : ''}
                  />
                  {errors.durationInHours && <p className="text-sm text-red-600">{errors.durationInHours}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleChange}
                  min="1"
                  max={selectedRoom?.capacity || 10}
                  className={errors.numberOfGuests ? 'border-red-500' : ''}
                />
                {selectedRoom && (
                  <p className="text-xs text-gray-500">Room capacity: {selectedRoom.capacity}</p>
                )}
                {errors.numberOfGuests && <p className="text-sm text-red-600">{errors.numberOfGuests}</p>}
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          {calculatedAmount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Estimated Total</h2>
              <p className="text-3xl font-bold text-blue-900">${calculatedAmount.toFixed(2)}</p>
              {formData.bookingType === BookingType.Daily && formData.checkInDate && formData.checkOutDate && (
                <p className="text-sm text-blue-700 mt-1">
                  {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} night(s) × ${selectedRoom?.pricePerNight}/night
                </p>
              )}
            </div>
          )}

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod?.toString() || ''}
                  onValueChange={(value) => handleChange({ target: { name: 'paymentMethod', value } } as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.Cash.toString()}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.CreditCard.toString()}>Credit Card</SelectItem>
                    <SelectItem value={PaymentMethod.DebitCard.toString()}>Debit Card</SelectItem>
                    <SelectItem value={PaymentMethod.BankTransfer.toString()}>Bank Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.Online.toString()}>Online</SelectItem>
                    <SelectItem value={PaymentMethod.PayOnArrival.toString()}>Pay on Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Transaction ID, check number, etc."
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Guest's special requests..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Staff notes (not visible to guest)..."
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/reservations')}
              disabled={createReservation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReservation.isPending}
            >
              {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
