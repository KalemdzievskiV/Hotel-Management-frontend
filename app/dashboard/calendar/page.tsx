'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReservationDialog, { ReservationPrefill } from '@/components/reservations/ReservationDialog';
import CalendarStats, { CalendarStatsData } from '@/components/calendar/CalendarStats';
import CalendarToolbar, { CalendarFilters } from '@/components/calendar/CalendarToolbar';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';
import TimelineView from '@/components/calendar/TimelineView';
import ListView from '@/components/calendar/ListView';
import {
  MONTH_NAMES, STATUS_STYLES, ViewMode, isSameDay, parseStayDate, startOfDay,
} from '@/components/calendar/calendarUtils';
import { reservationsApi, hotelsApi, roomsApi } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { downloadCSV } from '@/lib/export';
import { BookingType, Reservation, ReservationStatus } from '@/types';

type DialogMode = 'create' | 'edit' | 'view';

const DEFAULT_FILTERS: CalendarFilters = {
  searchTerm: '',
  hotelId: 'all',
  roomId: 'all',
  status: 'all',
  bookingType: 'all',
};

function getWeekDays(currentDate: Date): Date[] {
  const sunday = new Date(currentDate);
  sunday.setDate(currentDate.getDate() - currentDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    return day;
  });
}

function applyFilters(reservations: Reservation[], filters: CalendarFilters): Reservation[] {
  const term = filters.searchTerm.toLowerCase();
  return reservations.filter(res =>
    (filters.hotelId === 'all' || res.hotelId === parseInt(filters.hotelId)) &&
    (filters.roomId === 'all' || res.roomId === parseInt(filters.roomId)) &&
    (filters.status === 'all' || res.status === parseInt(filters.status)) &&
    (filters.bookingType === 'all' || res.bookingType === parseInt(filters.bookingType)) &&
    (!term ||
      res.guestName?.toLowerCase().includes(term) ||
      res.roomNumber?.toLowerCase().includes(term) ||
      res.hotelName?.toLowerCase().includes(term))
  );
}

function computeStats(reservations: Reservation[], roomCount: number): CalendarStatsData {
  const today = startOfDay(new Date());

  const checkingIn = reservations.filter(res =>
    isSameDay(parseStayDate(res.checkInDate), today) && res.status !== ReservationStatus.Cancelled).length;

  const checkingOut = reservations.filter(res =>
    isSameDay(parseStayDate(res.checkOutDate), today) && res.status === ReservationStatus.CheckedIn).length;

  const currentlyOccupied = reservations.filter(res =>
    parseStayDate(res.checkInDate) <= today &&
    parseStayDate(res.checkOutDate) > today &&
    res.status === ReservationStatus.CheckedIn).length;

  const revenue = reservations
    .filter(res => res.status !== ReservationStatus.Cancelled)
    .reduce((sum, res) => sum + (res.totalAmount || 0), 0);

  return {
    total: reservations.length,
    checkingIn,
    checkingOut,
    occupancy: roomCount > 0 ? Math.round((currentlyOccupied / roomCount) * 100) : 0,
    revenue,
  };
}

// useSearchParams needs a Suspense boundary in the App Router
export default function CalendarPage() {
  return (
    <Suspense>
      <Calendar />
    </Suspense>
  );
}

/**
 * ?hotelId=&roomId=[&checkIn=&checkOut=&bookingType=] (sent by the Availability page) opens the
 * booking dialog for that room and stay
 */
function roomPrefillFromUrl(params: URLSearchParams): ReservationPrefill | null {
  const hotelId = Number(params.get('hotelId'));
  const roomId = Number(params.get('roomId'));
  if (!(hotelId > 0 && roomId > 0)) return null;

  const bookingType = Number(params.get('bookingType'));
  return {
    hotelId,
    roomId,
    checkInDate: params.get('checkIn') || undefined,
    checkOutDate: params.get('checkOut') || undefined,
    bookingType: bookingType === BookingType.ShortStay ? BookingType.ShortStay : BookingType.Daily,
  };
}

function Calendar() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isGuest } = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);

  const [urlPrefill] = useState(() => roomPrefillFromUrl(searchParams));
  const [dialogOpen, setDialogOpen] = useState(urlPrefill !== null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | ReservationPrefill | null>(urlPrefill);
  const [dialogInitialDate, setDialogInitialDate] = useState<Date | undefined>(() => (urlPrefill ? new Date() : undefined));

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    // Don't reopen the prefilled booking on refresh
    if (!open && urlPrefill) router.replace('/dashboard/calendar');
  };

  const { data: hotels = [] } = useQuery({ queryKey: ['hotels'], queryFn: hotelsApi.getAll });
  // The rooms list is staff-only; guests only get the date-based views, which don't need it
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: roomsApi.getAll, enabled: !isGuest });
  const { data: reservations = [], isLoading } = useQuery({ queryKey: ['reservations'], queryFn: reservationsApi.getAll });

  const filteredRooms = useMemo(
    () => (filters.hotelId === 'all' ? rooms : rooms.filter(room => room.hotelId === parseInt(filters.hotelId))),
    [rooms, filters.hotelId]
  );

  const filteredReservations = useMemo(() => applyFilters(reservations, filters), [reservations, filters]);

  const stats = useMemo(
    () => computeStats(filteredReservations, filters.roomId !== 'all' ? 1 : filteredRooms.length),
    [filteredReservations, filteredRooms, filters.roomId]
  );

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Month view steps by month, week view by week, the day-based views by day
  const shiftDate = (direction: 1 | -1) => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + direction);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7 * direction);
    else next.setDate(next.getDate() + direction);
    setCurrentDate(next);
  };

  const viewTitle = (() => {
    if (viewMode === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const [start, end] = [weekDays[0], weekDays[6]];
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  })();

  const openCreate = (date: Date, roomId?: number) => {
    const room = roomId ? rooms.find(r => r.id === roomId) : undefined;
    setDialogMode('create');
    setDialogInitialDate(date);
    setSelectedReservation(room ? { roomId: room.id, hotelId: room.hotelId } : null);
    setDialogOpen(true);
  };

  const openReservation = (reservation: Reservation) => {
    setDialogMode('view');
    setSelectedReservation(reservation);
    setDialogInitialDate(undefined);
    setDialogOpen(true);
  };

  const exportReservations = () => {
    downloadCSV(
      filteredReservations.map(res => ({
        id: res.id,
        hotel: res.hotelName ?? '',
        room: res.roomNumber ?? '',
        guest: res.guestName ?? '',
        type: res.bookingType === BookingType.ShortStay ? 'Short-Stay' : 'Overnight',
        checkIn: String(res.checkInDate),
        checkOut: String(res.checkOutDate),
        guests: res.numberOfGuests,
        status: STATUS_STYLES[res.status]?.label ?? '',
        total: res.totalAmount,
        paid: res.depositAmount,
      })),
      'reservations'
    );
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      );
    }

    const viewProps = { reservations: filteredReservations, onCreate: openCreate, onSelect: openReservation };
    switch (viewMode) {
      case 'month': return <MonthView currentDate={currentDate} {...viewProps} />;
      case 'week': return <WeekView weekDays={weekDays} {...viewProps} />;
      case 'day': return <DayView currentDate={currentDate} {...viewProps} />;
      case 'timeline': return <TimelineView currentDate={currentDate} rooms={filteredRooms} {...viewProps} />;
      case 'list': return <ListView currentDate={currentDate} rooms={filteredRooms} {...viewProps} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">View and manage reservations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReservations} disabled={filteredReservations.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => openCreate(currentDate)}>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>

        <CalendarStats stats={stats} />

        <CalendarToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          hotels={hotels}
          rooms={filteredRooms}
          onToday={() => setCurrentDate(new Date())}
          roomViewsAvailable={!isGuest}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{viewTitle}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => shiftDate(-1)} aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => shiftDate(1)} aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderView()}</CardContent>
        </Card>

        <CalendarLegend />
      </div>

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        mode={dialogMode}
        reservation={selectedReservation}
        initialDate={dialogInitialDate}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['reservations'] })}
      />
    </DashboardLayout>
  );
}
