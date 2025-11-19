'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useReservations, useConfirmReservation, useCheckIn, useCheckOut, useCancelReservation } from '@/hooks/useReservations';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api';
import { hotelKeys } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Reservation, ReservationStatus, PaymentStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';

export default function ReservationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const permissions = usePermissions();
  const { data: reservations, isLoading, error } = useReservations();
  
  // Only fetch hotels if user can view all reservations (Admin/Manager/SuperAdmin)
  const { data: hotels } = useQuery({
    queryKey: hotelKeys.lists(),
    queryFn: () => hotelsApi.getAll(),
    enabled: permissions.canViewAllReservations,
  });
  
  const confirmReservation = useConfirmReservation();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelReservation = useCancelReservation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelDialog, setCancelDialog] = useState<{ id: number; guestName: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Filter reservations
  const filteredReservations = reservations?.filter((reservation) => {
    const matchesSearch = 
      reservation.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toString().includes(searchTerm);
    
    const matchesHotel = selectedHotelId === 'all' || reservation.hotelId.toString() === selectedHotelId;
    const matchesStatus = statusFilter === 'all' || reservation.status.toString() === statusFilter;
    
    return matchesSearch && matchesHotel && matchesStatus;
  });

  const handleConfirm = async (id: number) => {
    try {
      await confirmReservation.mutateAsync(id);
      showToast('Reservation confirmed successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to confirm reservation', 'error');
    }
  };

  const handleCheckIn = async (id: number) => {
    try {
      await checkIn.mutateAsync(id);
      showToast('Guest checked in successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to check in', 'error');
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await checkOut.mutateAsync(id);
      showToast('Guest checked out successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to check out', 'error');
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog || !cancelReason.trim()) {
      showToast('Please provide a cancellation reason', 'error');
      return;
    }

    try {
      await cancelReservation.mutateAsync({ 
        id: cancelDialog.id, 
        data: { reason: cancelReason } 
      });
      showToast('Reservation cancelled successfully', 'success');
      setCancelDialog(null);
      setCancelReason('');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to cancel reservation', 'error');
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
          <p className="text-red-800">Error loading reservations. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
            <p className="mt-1 text-gray-600">
              Manage bookings and reservations
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/reservations/new')}>
            <span className="text-lg">+</span>
            New Reservation
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className={`grid grid-cols-1 gap-4 ${permissions.canViewAllReservations ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              <div>
                <Label htmlFor="search-reservations">Search</Label>
                <Input
                  id="search-reservations"
                  type="text"
                  placeholder="Search by guest, room, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {permissions.canViewAllReservations && (
                <div>
                  <Label htmlFor="filter-hotel">Filter by hotel</Label>
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger id="filter-hotel">
                      <SelectValue placeholder="All Hotels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hotels</SelectItem>
                      {hotels?.map((hotel: any) => (
                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={ReservationStatus.Pending.toString()}>Pending</SelectItem>
                    <SelectItem value={ReservationStatus.Confirmed.toString()}>Confirmed</SelectItem>
                    <SelectItem value={ReservationStatus.CheckedIn.toString()}>Checked In</SelectItem>
                    <SelectItem value={ReservationStatus.CheckedOut.toString()}>Checked Out</SelectItem>
                    <SelectItem value={ReservationStatus.Cancelled.toString()}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading reservations...</p>
            </div>
          ) : filteredReservations && filteredReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                      ID
                  </TableHead>
                  <TableHead>
                      Guest
                  </TableHead>
                  <TableHead>
                      Room
                  </TableHead>
                  <TableHead>
                      Dates
                  </TableHead>
                  <TableHead>
                      Amount
                  </TableHead>
                  <TableHead>
                      Status
                  </TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                        <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm font-medium text-gray-900">{reservation.guestName}</div>
                        <div className="text-sm text-gray-500">{reservation.numberOfGuests} guest{reservation.numberOfGuests !== 1 ? 's' : ''}</div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">{reservation.hotelName}</div>
                        <div className="text-sm text-gray-500">Room {reservation.roomNumber}</div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">{formatDate(reservation.checkInDate)}</div>
                        <div className="text-sm text-gray-500">to {formatDate(reservation.checkOutDate)}</div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm font-medium text-gray-900">${reservation.totalAmount}</div>
                        <Badge className={getPaymentBadge(reservation.paymentStatus)}>
                          {PaymentStatus[reservation.paymentStatus]}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge className={getStatusBadge(reservation.status)}>
                          {ReservationStatus[reservation.status]}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/reservations/${reservation.id}`)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                          >
                            View
                          </Button>
                          
                          {reservation.status === ReservationStatus.Pending && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConfirm(reservation.id)}
                              disabled={confirmReservation.isPending}
                              className="text-green-600 hover:text-green-900 hover:bg-green-50"
                            >
                              Confirm
                            </Button>
                          )}
                          
                          {reservation.status === ReservationStatus.Confirmed && reservation.canCheckIn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCheckIn(reservation.id)}
                              disabled={checkIn.isPending}
                              className="text-green-600 hover:text-green-900 hover:bg-green-50"
                            >
                              Check-in
                            </Button>
                          )}
                          
                          {reservation.status === ReservationStatus.CheckedIn && reservation.canCheckOut && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCheckOut(reservation.id)}
                              disabled={checkOut.isPending}
                              className="text-purple-600 hover:text-purple-900 hover:bg-purple-50"
                            >
                              Check-out
                            </Button>
                          )}
                          
                          {reservation.canCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelDialog({ id: reservation.id, guestName: reservation.guestName || 'Guest' })}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || selectedHotelId || statusFilter !== 'all' 
                ? 'No reservations found matching your filters.' 
                : 'No reservations yet. Create your first reservation!'}
            </div>
          )}
        </div>

        {/* Cancel Dialog */}
        <Dialog open={!!cancelDialog} onOpenChange={() => { setCancelDialog(null); setCancelReason(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Reservation</DialogTitle>
              <DialogDescription>
                Cancel reservation for <strong>{cancelDialog?.guestName}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for cancellation..."
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCancelDialog(null);
                  setCancelReason('');
                }}
                disabled={cancelReservation.isPending}
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
      </div>
    </DashboardLayout>
  );
}
