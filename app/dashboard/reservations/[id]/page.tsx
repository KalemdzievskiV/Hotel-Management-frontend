'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useReservation, useConfirmReservation, useCheckIn, useCheckOut, useCancelReservation, useRecordPayment } from '@/hooks/useReservations';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ReservationStatus, PaymentStatus, PaymentMethod, BookingType, RecordPaymentDto } from '@/types';
import { formatDate } from '@/lib/utils/date';

export default function ViewReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = parseInt(params.id as string);
  const { showToast } = useToast();
  
  const { data: reservation, isLoading, error } = useReservation(reservationId);
  const confirmReservation = useConfirmReservation();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelReservation = useCancelReservation();
  const recordPayment = useRecordPayment();

  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<RecordPaymentDto>({
    amount: 0,
    paymentMethod: PaymentMethod.Cash,
    paymentReference: '',
  });

  const handleConfirm = async () => {
    try {
      await confirmReservation.mutateAsync(reservationId);
      showToast('Reservation confirmed successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to confirm reservation', 'error');
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync(reservationId);
      showToast('Guest checked in successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to check in', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut.mutateAsync(reservationId);
      showToast('Guest checked out successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to check out', 'error');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showToast('Please provide a cancellation reason', 'error');
      return;
    }

    try {
      await cancelReservation.mutateAsync({ 
        id: reservationId, 
        data: { reason: cancelReason } 
      });
      showToast('Reservation cancelled successfully', 'success');
      setCancelDialog(false);
      setCancelReason('');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to cancel reservation', 'error');
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      await recordPayment.mutateAsync({ id: reservationId, data: paymentData });
      showToast('Payment recorded successfully', 'success');
      setPaymentDialog(false);
      setPaymentData({ amount: 0, paymentMethod: PaymentMethod.Cash, paymentReference: '' });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to record payment', 'error');
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const statusMap = {
      [ReservationStatus.Pending]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      [ReservationStatus.Confirmed]: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      [ReservationStatus.CheckedIn]: 'bg-green-100 text-green-800 hover:bg-green-100',
      [ReservationStatus.CheckedOut]: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      [ReservationStatus.Cancelled]: 'bg-red-100 text-red-800 hover:bg-red-100',
      [ReservationStatus.NoShow]: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    const statusMap = {
      [PaymentStatus.Unpaid]: 'bg-red-100 text-red-800 hover:bg-red-100',
      [PaymentStatus.PartiallyPaid]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      [PaymentStatus.Paid]: 'bg-green-100 text-green-800 hover:bg-green-100',
      [PaymentStatus.Refunding]: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      [PaymentStatus.Refunded]: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading reservation. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !reservation) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reservation...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reservation #{reservation.id}</h1>
            <p className="mt-1 text-gray-600">{reservation.guestName}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/reservations')}
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Status Badges & Actions */}
        <Card>
          <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(reservation.status)}`}>
                {ReservationStatus[reservation.status]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadge(reservation.paymentStatus)}`}>
                {PaymentStatus[reservation.paymentStatus]}
              </span>
              {reservation.bookingType === BookingType.ShortStay && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Short-Stay
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {reservation.status === ReservationStatus.Pending && (
                <Button
                  onClick={handleConfirm}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={confirmReservation.isPending}
                >
                  Confirm
                </Button>
              )}
              
              {reservation.status === ReservationStatus.Confirmed && reservation.canCheckIn && (
                <Button
                  onClick={handleCheckIn}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={checkIn.isPending}
                >
                  Check-in
                </Button>
              )}
              
              {reservation.status === ReservationStatus.CheckedIn && reservation.canCheckOut && (
                <Button
                  onClick={handleCheckOut}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={checkOut.isPending}
                >
                  Check-out
                </Button>
              )}
              
              {reservation.canCancel && (
                <Button
                  onClick={() => setCancelDialog(true)}
                  variant="destructive"
                >
                  Cancel
                </Button>
              )}

              {reservation.paymentStatus !== PaymentStatus.Paid && reservation.status !== ReservationStatus.Cancelled && (
                <Button
                  onClick={() => setPaymentDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Record Payment
                </Button>
              )}
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Hotel</Label>
              <p className="text-gray-900">{reservation.hotelName}</p>
            </div>

            <div>
              <Label className="text-gray-500">Room</Label>
              <p className="text-gray-900">Room {reservation.roomNumber}</p>
            </div>

            <div>
              <Label className="text-gray-500">Check-in</Label>
              <p className="text-gray-900">{formatDate(reservation.checkInDate)}</p>
            </div>

            <div>
              <Label className="text-gray-500">Check-out</Label>
              <p className="text-gray-900">{formatDate(reservation.checkOutDate)}</p>
            </div>

            {reservation.totalNights && (
              <div>
                <Label className="text-gray-500">Duration</Label>
                <p className="text-gray-900">{reservation.totalNights} night{reservation.totalNights !== 1 ? 's' : ''}</p>
              </div>
            )}

            {reservation.durationInHours && (
              <div>
                <Label className="text-gray-500">Duration</Label>
                <p className="text-gray-900">{reservation.durationInHours} hour{reservation.durationInHours !== 1 ? 's' : ''}</p>
              </div>
            )}

            <div>
              <Label className="text-gray-500">Number of Guests</Label>
              <p className="text-gray-900">{reservation.numberOfGuests}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Total Amount</Label>
              <p className="text-2xl font-bold text-gray-900">${reservation.totalAmount}</p>
            </div>

            <div>
              <Label className="text-gray-500">Deposit Paid</Label>
              <p className="text-2xl font-bold text-green-600">${reservation.depositAmount}</p>
            </div>

            <div>
              <Label className="text-gray-500">Remaining Balance</Label>
              <p className="text-2xl font-bold text-orange-600">${reservation.remainingAmount}</p>
            </div>

            {reservation.paymentMethod && (
              <div>
                <Label className="text-gray-500">Payment Method</Label>
                <p className="text-gray-900">{PaymentMethod[reservation.paymentMethod]}</p>
              </div>
            )}

            {reservation.paymentReference && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">Payment Reference</Label>
                <p className="text-gray-900">{reservation.paymentReference}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Special Requests & Notes */}
        {(reservation.specialRequests || reservation.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {reservation.specialRequests && (
                <div>
                  <Label className="text-gray-500">Special Requests</Label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{reservation.specialRequests}</p>
                </div>
              )}

              {reservation.notes && (
                <div>
                  <Label className="text-gray-500">Internal Notes</Label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{reservation.notes}</p>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Created</Label>
              <p className="text-gray-900">{formatDate(reservation.createdAt)}</p>
              {reservation.createdByUserName && (
                <p className="text-sm text-gray-500">by {reservation.createdByUserName}</p>
              )}
            </div>

            {reservation.confirmedAt && (
              <div>
                <Label className="text-gray-500">Confirmed</Label>
                <p className="text-gray-900">{formatDate(reservation.confirmedAt)}</p>
              </div>
            )}

            {reservation.checkedInAt && (
              <div>
                <Label className="text-gray-500">Checked In</Label>
                <p className="text-gray-900">{formatDate(reservation.checkedInAt)}</p>
              </div>
            )}

            {reservation.checkedOutAt && (
              <div>
                <Label className="text-gray-500">Checked Out</Label>
                <p className="text-gray-900">{formatDate(reservation.checkedOutAt)}</p>
              </div>
            )}

            {reservation.cancelledAt && (
              <div className="md:col-span-2">
                <Label className="text-red-600">Cancelled</Label>
                <p className="text-gray-900">{formatDate(reservation.cancelledAt)}</p>
                {reservation.cancellationReason && (
                  <p className="text-red-900 bg-red-50 p-3 rounded mt-2">{reservation.cancellationReason}</p>
                )}
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Cancel Dialog */}
        <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Reservation</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancelReason">Cancellation Reason *</Label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCancelDialog(false);
                  setCancelReason('');
                }}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelReservation.isPending || !cancelReason.trim()}
              >
                {cancelReservation.isPending ? 'Cancelling...' : 'Cancel Reservation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Enter payment details for this reservation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount || ''}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max={reservation.remainingAmount}
                  step="0.01"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">Remaining: ${reservation.remainingAmount}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={paymentData.paymentMethod.toString()}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: parseInt(value) }))}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.Cash.toString()}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.CreditCard.toString()}>Credit Card</SelectItem>
                    <SelectItem value={PaymentMethod.DebitCard.toString()}>Debit Card</SelectItem>
                    <SelectItem value={PaymentMethod.BankTransfer.toString()}>Bank Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.Online.toString()}>Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  type="text"
                  value={paymentData.paymentReference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentReference: e.target.value }))}
                  placeholder="Transaction ID..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordPayment}
                disabled={recordPayment.isPending || !paymentData.amount}
              >
                {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
