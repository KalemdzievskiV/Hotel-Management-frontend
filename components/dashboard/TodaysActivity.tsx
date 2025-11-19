'use client';

import { useState } from 'react';
import { useTodaysCheckIns, useTodaysCheckOuts, useCheckIn, useCheckOut } from '@/hooks/useReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LogIn, 
  LogOut, 
  Clock, 
  User, 
  Home, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Reservation, ReservationStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function TodaysActivity() {
  const { data: checkIns, isLoading: loadingCheckIns, refetch: refetchCheckIns } = useTodaysCheckIns();
  const { data: checkOuts, isLoading: loadingCheckOuts, refetch: refetchCheckOuts } = useTodaysCheckOuts();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const { showToast } = useToast();

  const [processingId, setProcessingId] = useState<number | null>(null);

  // Calculate stats
  const checkInsCompleted = checkIns?.filter(r => r.status === ReservationStatus.CheckedIn).length || 0;
  const checkInsPending = checkIns?.filter(r => r.status === ReservationStatus.Confirmed).length || 0;
  
  const checkOutsCompleted = checkOuts?.filter(r => r.status === ReservationStatus.CheckedOut).length || 0;
  const checkOutsPending = checkOuts?.filter(r => r.status === ReservationStatus.CheckedIn).length || 0;

  const handleCheckIn = async (reservation: Reservation) => {
    if (reservation.status !== ReservationStatus.Confirmed) {
      showToast('Only confirmed reservations can be checked in', 'error');
      return;
    }

    setProcessingId(reservation.id);
    try {
      await checkInMutation.mutateAsync(reservation.id);
      showToast(`${reservation.guestName} checked in successfully`, 'success');
      refetchCheckIns();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to check in';
      showToast(errorMessage, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckOut = async (reservation: Reservation) => {
    if (reservation.status !== ReservationStatus.CheckedIn) {
      showToast('Only checked-in guests can be checked out', 'error');
      return;
    }

    setProcessingId(reservation.id);
    try {
      await checkOutMutation.mutateAsync(reservation.id);
      showToast(`${reservation.guestName} checked out successfully`, 'success');
      refetchCheckOuts();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to check out';
      showToast(errorMessage, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'h:mm a');
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const variants: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: any }> = {
      [ReservationStatus.Confirmed]: { label: 'Pending', variant: 'secondary', icon: Clock },
      [ReservationStatus.CheckedIn]: { label: 'Checked In', variant: 'default', icon: CheckCircle2 },
      [ReservationStatus.CheckedOut]: { label: 'Checked Out', variant: 'outline', icon: CheckCircle2 },
    };
    
    const config = variants[status] || { label: 'Unknown', variant: 'secondary', icon: AlertCircle };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loadingCheckIns || loadingCheckOuts) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Check-Ins Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-green-600" />
            Today's Check-ins
            <Badge variant="outline" className="ml-auto">
              {checkInsCompleted}/{(checkInsCompleted + checkInsPending)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Completed: {checkInsCompleted}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Pending: {checkInsPending}</span>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {checkIns && checkIns.length > 0 ? (
              checkIns.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{reservation.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home className="h-3 w-3" />
                        <span>{reservation.hotelName} - Room {reservation.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(reservation.checkInDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(reservation.status)}
                      {reservation.status === ReservationStatus.Confirmed && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(reservation)}
                          disabled={processingId === reservation.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingId === reservation.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <LogIn className="h-3 w-3 mr-1" />
                              Check In
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No check-ins scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Check-Outs Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-orange-600" />
            Today's Check-outs
            <Badge variant="outline" className="ml-auto">
              {checkOutsCompleted}/{(checkOutsCompleted + checkOutsPending)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Completed: {checkOutsCompleted}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Pending: {checkOutsPending}</span>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {checkOuts && checkOuts.length > 0 ? (
              checkOuts.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{reservation.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home className="h-3 w-3" />
                        <span>{reservation.hotelName} - Room {reservation.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(reservation.checkOutDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(reservation.status)}
                      {reservation.status === ReservationStatus.CheckedIn && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckOut(reservation)}
                          disabled={processingId === reservation.id}
                          variant="outline"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50"
                        >
                          {processingId === reservation.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <LogOut className="h-3 w-3 mr-1" />
                              Check Out
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No check-outs scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
