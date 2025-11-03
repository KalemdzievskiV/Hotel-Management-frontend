'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { reservationsApi, hotelsApi, roomsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Search, Filter, Download, List, Grid, Clock, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ReservationStatus, BookingType } from '@/types';
import ReservationDialog from '@/components/reservations/ReservationDialog';

type ViewMode = 'month' | 'week' | 'day' | 'timeline' | 'list';
type DialogMode = 'create' | 'edit' | 'view';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('all');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [dialogInitialDate, setDialogInitialDate] = useState<Date | undefined>();

  // Fetch data
  const { data: hotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelsApi.getAll,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
  });

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsApi.getAll,
  });

  // Filter rooms by selected hotel
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    if (selectedHotelId === 'all') return rooms;
    return rooms.filter(room => room.hotelId === parseInt(selectedHotelId));
  }, [rooms, selectedHotelId]);

  // Filter reservations by selected hotel, room, status, and search
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    
    let filtered = reservations;
    
    if (selectedHotelId !== 'all') {
      filtered = filtered.filter(res => res.hotelId === parseInt(selectedHotelId));
    }
    
    if (selectedRoomId !== 'all') {
      filtered = filtered.filter(res => res.roomId === parseInt(selectedRoomId));
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === parseInt(statusFilter));
    }
    
    if (bookingTypeFilter !== 'all') {
      filtered = filtered.filter(res => res.bookingType === parseInt(bookingTypeFilter));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(res => 
        res.guestName?.toLowerCase().includes(term) ||
        res.roomNumber?.toLowerCase().includes(term) ||
        res.hotelName?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [reservations, selectedHotelId, selectedRoomId, statusFilter, bookingTypeFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredReservations || !rooms) return { total: 0, checkingIn: 0, checkingOut: 0, occupancy: 0, revenue: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkingIn = filteredReservations.filter(res => {
      const checkIn = new Date(res.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime() && res.status !== ReservationStatus.Cancelled;
    }).length;
    
    const checkingOut = filteredReservations.filter(res => {
      const checkOut = new Date(res.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);
      return checkOut.getTime() === today.getTime() && res.status === ReservationStatus.CheckedIn;
    }).length;
    
    const currentlyOccupied = filteredReservations.filter(res => {
      const checkIn = new Date(res.checkInDate);
      const checkOut = new Date(res.checkOutDate);
      return checkIn <= today && checkOut > today && res.status === ReservationStatus.CheckedIn;
    }).length;
    
    const relevantRooms = selectedRoomId !== 'all' ? 1 : 
      selectedHotelId !== 'all' ? rooms.filter(r => r.hotelId === parseInt(selectedHotelId)).length : rooms.length;
    
    const occupancy = relevantRooms > 0 ? Math.round((currentlyOccupied / relevantRooms) * 100) : 0;
    
    const revenue = filteredReservations
      .filter(res => res.status !== ReservationStatus.Cancelled)
      .reduce((sum, res) => sum + (res.totalAmount || 0), 0);
    
    return {
      total: filteredReservations.length,
      checkingIn,
      checkingOut,
      occupancy,
      revenue
    };
  }, [filteredReservations, rooms, selectedHotelId, selectedRoomId]);

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate]);

  // Generate week days
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start on Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  // Generate hours for day view
  const dayHours = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  }, []);

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date) => {
    if (!filteredReservations) return [];
    
    return filteredReservations.filter(res => {
      const checkIn = new Date(res.checkInDate);
      const checkOut = new Date(res.checkOutDate);
      
      // Reset time to compare only dates
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const checkInOnly = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const checkOutOnly = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      
      // Include if date is between check-in and check-out (inclusive of check-in, exclusive of check-out for overnight)
      // For short stays on the same day, include if dates match
      if (checkInOnly.getTime() === checkOutOnly.getTime()) {
        // Short stay on same day
        return dateOnly.getTime() === checkInOnly.getTime();
      } else {
        // Overnight stay - include from check-in date up to (but not including) check-out date
        return dateOnly.getTime() >= checkInOnly.getTime() && dateOnly.getTime() < checkOutOnly.getTime();
      }
    });
  };

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else { // day, timeline, or list
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else { // day, timeline, or list
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get title based on view mode
  const getViewTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    } else if (viewMode === 'day' || viewMode === 'list') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
  };

  // Status color helper
  const getStatusColor = (status: number) => {
    const colors = {
      0: 'bg-yellow-100 text-yellow-800 border-yellow-300', // Pending
      1: 'bg-blue-100 text-blue-800 border-blue-300',       // Confirmed
      2: 'bg-green-100 text-green-800 border-green-300',    // CheckedIn
      3: 'bg-gray-100 text-gray-800 border-gray-300',       // CheckedOut
      4: 'bg-red-100 text-red-800 border-red-300',          // Cancelled
      5: 'bg-orange-100 text-orange-800 border-orange-300', // NoShow
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Booking type badge helper
  const getBookingTypeBadge = (type: number) => {
    return type === BookingType.ShortStay ? (
      <span title="Short-Stay" className="inline-flex">
        <Clock className="h-3 w-3 text-purple-600" />
      </span>
    ) : null;
  };

  // Status badge helper
  const getStatusBadge = (status: number) => {
    const variants: Record<number, { label: string; className: string }> = {
      0: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      1: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      2: { label: 'Checked In', className: 'bg-green-100 text-green-800 border-green-300' },
      3: { label: 'Checked Out', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      4: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-300' },
      5: { label: 'No Show', className: 'bg-red-100 text-red-800 border-red-300' },
    };
    const config = variants[status] || variants[0];
    return <Badge className={`${config.className} text-xs`}>{config.label}</Badge>;
  };

  // Format time for short stays
  const formatTime = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Quick create handler
  const handleQuickCreate = (date: Date, roomId?: number) => {
    setDialogMode('create');
    setDialogInitialDate(date);
    
    // If roomId is provided, find the room and pass full info
    if (roomId && rooms) {
      const room = rooms.find(r => r.id === roomId);
      setSelectedReservation(room ? { roomId: room.id, hotelId: room.hotelId } : null);
    } else {
      setSelectedReservation(null);
    }
    
    setDialogOpen(true);
  };

  // View/Edit reservation handler
  const handleReservationClick = (reservation: any) => {
    setDialogMode('view');
    setSelectedReservation(reservation);
    setDialogInitialDate(undefined);
    setDialogOpen(true);
  };

  // Handle dialog success (refresh data)
  const handleDialogSuccess = () => {
    // Refetch reservations
    reservations && window.location.reload(); // Simple refresh for now
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">View and manage reservations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => alert('Export feature coming soon!')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => {
              setDialogMode('create');
              setDialogInitialDate(currentDate);
              setSelectedReservation(null);
              setDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reservations</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Checking In Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.checkingIn}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-lg">→</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Checking Out Today</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.checkingOut}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-lg">←</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.occupancy}%</p>
                </div>
                <Grid className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-lg">$</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Controls */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* View Mode Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className="flex-1 sm:flex-none"
                    >
                      <Grid className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Month</span>
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className="flex-1 sm:flex-none"
                    >
                      <List className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Week</span>
                    </Button>
                    <Button
                      variant={viewMode === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('day')}
                      className="flex-1 sm:flex-none"
                    >
                      <Clock className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Day</span>
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex-1 sm:flex-none"
                    >
                      <List className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">List</span>
                    </Button>
                    <Button
                      variant={viewMode === 'timeline' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('timeline')}
                      className="flex-1 sm:flex-none hidden sm:flex"
                    >
                      <BarChart3 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Timeline</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by guest, room, hotel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Hotel</label>
                <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Hotels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hotels</SelectItem>
                    {hotels?.map(hotel => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Room</label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {filteredRooms?.map(room => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.roomNumber} - {room.hotelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Confirmed</SelectItem>
                    <SelectItem value="2">Checked In</SelectItem>
                    <SelectItem value="3">Checked Out</SelectItem>
                    <SelectItem value="4">Cancelled</SelectItem>
                    <SelectItem value="5">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="0">Daily</SelectItem>
                    <SelectItem value="1">Short-Stay</SelectItem>
                    <SelectItem value="2">Weekly</SelectItem>
                    <SelectItem value="3">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {getViewTitle()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading calendar...</div>
              </div>
            ) : viewMode === 'month' ? (
              <div className="border rounded-lg overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50">
                  {dayNames.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-b">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.slice(0, 1)}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <div key={`empty-${index}`} className="min-h-20 sm:min-h-32 p-1 sm:p-2 border-b border-r bg-gray-50" />
                      );
                    }

                    const dayReservations = getReservationsForDate(date);
                    const isToday = 
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={index}
                        className={`min-h-20 sm:min-h-32 p-1 sm:p-2 border-b border-r relative cursor-pointer group hover:bg-blue-50 transition-colors ${
                          isToday ? 'bg-blue-50' : date.getMonth() !== currentDate.getMonth() ? 'bg-gray-100' : 'bg-white'
                        }`}
                        onClick={(e) => {
                          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('empty-space')) {
                            handleQuickCreate(date);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <div className={`text-xs sm:text-sm font-medium ${
                            isToday ? 'text-blue-600' : date.getMonth() !== currentDate.getMonth() ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {date.getDate()}
                          </div>
                          <Plus className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          {dayReservations.slice(0, 3).map(res => (
                            <div
                              key={res.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReservationClick(res);
                              }}
                              className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(res.status)}`}
                              title={`${res.guestName} - Room ${res.roomNumber}\n${res.bookingType === BookingType.ShortStay ? `${formatTime(res.checkInDate)} - ${formatTime(res.checkOutDate)}` : 'Overnight'}`}
                            >
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <span className="hidden sm:inline">{getBookingTypeBadge(res.bookingType)}</span>
                                <span className="font-medium truncate text-[10px] sm:text-xs">{res.roomNumber}</span>
                              </div>
                              <div className="truncate text-[9px] sm:text-xs opacity-75 hidden sm:block">
                                {res.guestName}
                              </div>
                              {res.bookingType === BookingType.ShortStay && (
                                <div className="text-xs opacity-60 items-center gap-1 mt-0.5 hidden sm:flex">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatTime(res.checkInDate)} - {formatTime(res.checkOutDate)}
                                </div>
                              )}
                            </div>
                          ))}
                          {dayReservations.length > 3 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{dayReservations.length - 3} more
                            </div>
                          )}
                          {dayReservations.length === 0 && (
                            <div className="empty-space h-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === 'week' ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {weekDays.map((date, index) => {
                    const dayReservations = getReservationsForDate(date);
                    const isToday = 
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();

                    return (
                      <div key={index} className="bg-white">
                        <div 
                          className={`p-3 text-center border-b cursor-pointer hover:bg-blue-100 transition-colors ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                          onClick={() => handleQuickCreate(date)}
                          title="Click to create reservation"
                        >
                          <div className="text-xs text-gray-600">{dayNames[index]}</div>
                          <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {date.getDate()}
                          </div>
                        </div>
                        <div 
                          className="p-2 space-y-2 min-h-[400px] cursor-pointer hover:bg-gray-50"
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              handleQuickCreate(date);
                            }
                          }}
                        >
                          {dayReservations.map(res => (
                            <div
                              key={res.id}
                              onClick={() => handleReservationClick(res)}
                              className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(res.status)}`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {getBookingTypeBadge(res.bookingType)}
                                <span className="font-bold">Room {res.roomNumber}</span>
                              </div>
                              <div className="font-medium">{res.guestName}</div>
                              {res.bookingType === BookingType.ShortStay && (
                                <div className="text-xs opacity-70 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(res.checkInDate)} - {formatTime(res.checkOutDate)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === 'day' ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b text-center">
                  <div className="text-sm text-gray-600">{dayNames[currentDate.getDay()]}</div>
                  <div className="text-2xl font-bold text-gray-900">{currentDate.getDate()}</div>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {dayHours.map(hour => {
                    const hourStart = new Date(currentDate);
                    hourStart.setHours(hour, 0, 0, 0);
                    const hourEnd = new Date(currentDate);
                    hourEnd.setHours(hour + 1, 0, 0, 0);
                    
                    // Show reservations that are active during this hour
                    const hourReservations = filteredReservations?.filter(res => {
                      const checkIn = new Date(res.checkInDate);
                      const checkOut = new Date(res.checkOutDate);
                      
                      // For same-day reservations, show if they overlap this hour
                      const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
                      const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
                      const isSameDay = checkInDate.getTime() === checkOutDate.getTime() && 
                                       checkInDate.getTime() === new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
                      
                      if (isSameDay) {
                        // Show if reservation overlaps with this hour
                        return checkIn < hourEnd && checkOut > hourStart;
                      } else {
                        // For multi-day, only show at the start hour on the first day
                        return checkIn >= hourStart && checkIn < hourEnd;
                      }
                    }) || [];

                    return (
                      <div key={hour} className="grid grid-cols-[80px_1fr] border-b hover:bg-gray-50">
                        <div className="py-2 px-2 text-right text-xs text-gray-600 border-r bg-gray-50">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </div>
                        <div 
                          className={`p-1 min-h-[40px] cursor-pointer ${hourReservations.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1' : 'hover:bg-blue-50'}`}
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              const dateWithHour = new Date(currentDate);
                              dateWithHour.setHours(hour, 0, 0, 0);
                              handleQuickCreate(dateWithHour);
                            }
                          }}
                          title="Click empty space to create reservation"
                        >
                          {hourReservations.map(res => {
                            const checkIn = new Date(res.checkInDate);
                            const checkOut = new Date(res.checkOutDate);
                            const durationMs = checkOut.getTime() - checkIn.getTime();
                            const durationHours = durationMs / (1000 * 60 * 60);
                            
                            // Check if it's a multi-day reservation
                            const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
                            const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
                            const isMultiDay = checkOutDate.getTime() > checkInDate.getTime();
                            
                            // Check if reservation starts in this hour
                            const startsInThisHour = checkIn >= hourStart && checkIn < hourEnd;
                            
                            return (
                              <div
                                key={res.id}
                                onClick={() => handleReservationClick(res)}
                                className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(res.status)} ${!startsInThisHour ? 'opacity-60' : ''}`}
                              >
                                <div className="flex items-center gap-1">
                                  {getBookingTypeBadge(res.bookingType)}
                                  <span className="font-bold truncate">Room {res.roomNumber}</span>
                                </div>
                                <div className="font-medium truncate text-[11px]">{res.guestName}</div>
                                <div className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  <span className="truncate">{formatTime(res.checkInDate)} - {formatTime(res.checkOutDate)}</span>
                                </div>
                                {isMultiDay && (
                                  <Badge variant="secondary" className="mt-0.5 text-[9px] px-1 py-0">
                                    Multi-day
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === 'timeline' ? (
              <div className="border rounded-lg overflow-hidden">
                {/* Timeline Header */}
                <div className="bg-gray-50 border-b">
                  <div className="grid grid-cols-[150px_1fr]">
                    <div className="p-3 border-r font-semibold text-sm">Rooms</div>
                    <div className="grid grid-cols-24 text-xs">
                      {dayHours.map(hour => (
                        <div key={hour} className="p-2 text-center border-r border-gray-200">
                          {hour === 0 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour-12}P`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Body - Rooms */}
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredRooms && filteredRooms.length > 0 ? (
                    filteredRooms.map(room => {
                      // Get all reservations for this room on the current date
                      const roomReservations = filteredReservations?.filter(res => {
                        if (res.roomId !== room.id) return false;
                        
                        const checkIn = new Date(res.checkInDate);
                        const checkOut = new Date(res.checkOutDate);
                        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
                        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
                        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                        
                        // Include if reservation is active on this date
                        return checkInDate.getTime() <= currentDateOnly.getTime() && 
                               checkOutDate.getTime() >= currentDateOnly.getTime();
                      }) || [];

                      return (
                        <div key={room.id} className="border-b hover:bg-gray-50">
                          <div className="grid grid-cols-[150px_1fr] min-h-[60px]">
                            {/* Room Info */}
                            <div className="p-3 border-r bg-gray-50 flex flex-col justify-center">
                              <div className="font-bold text-sm">Room {room.roomNumber}</div>
                              <div className="text-xs text-gray-600">{room.type}</div>
                            </div>

                            {/* Timeline Grid */}
                            <div className="relative">
                              {/* Hour grid lines */}
                              <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                                {dayHours.map(hour => (
                                  <div key={hour} className="border-r border-gray-100" />
                                ))}
                              </div>

                              {/* Clickable background for creating reservations */}
                              <div 
                                className="absolute inset-0 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleQuickCreate(currentDate, room.id)}
                                title={`Click to create reservation for Room ${room.roomNumber}`}
                              />

                              {/* Reservation Bars */}
                              <div className="relative p-2 space-y-1 min-h-[60px] pointer-events-none">
                                {roomReservations.map(res => {
                                  const checkIn = new Date(res.checkInDate);
                                  const checkOut = new Date(res.checkOutDate);
                                  
                                  // Calculate position and width
                                  const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                                  const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
                                  const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
                                  
                                  let startHour = 0;
                                  let endHour = 24;
                                  
                                  // If check-in is today, start at check-in hour
                                  if (checkInDate.getTime() === currentDateOnly.getTime()) {
                                    startHour = checkIn.getHours() + (checkIn.getMinutes() / 60);
                                  }
                                  
                                  // If check-out is today, end at check-out hour
                                  if (checkOutDate.getTime() === currentDateOnly.getTime()) {
                                    endHour = checkOut.getHours() + (checkOut.getMinutes() / 60);
                                  }
                                  
                                  const leftPercent = (startHour / 24) * 100;
                                  const widthPercent = ((endHour - startHour) / 24) * 100;

                                  return (
                                    <div
                                      key={res.id}
                                      onClick={() => handleReservationClick(res)}
                                      className={`absolute h-8 rounded cursor-pointer hover:shadow-lg transition-all border-2 pointer-events-auto ${getStatusColor(res.status)} flex items-center px-2 overflow-hidden`}
                                      style={{
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        zIndex: 10
                                      }}
                                      title={`${res.guestName} - ${formatTime(res.checkInDate)} to ${formatTime(res.checkOutDate)}`}
                                    >
                                      <div className="flex items-center gap-1 truncate">
                                        {getBookingTypeBadge(res.bookingType)}
                                        <span className="text-xs font-bold truncate">{res.guestName}</span>
                                        <span className="text-xs opacity-70">
                                          {formatTime(checkIn)} - {formatTime(checkOut)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No rooms available. Please add rooms or adjust filters.
                    </div>
                  )}
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredRooms && filteredRooms.length > 0 ? (
                  filteredRooms.map(room => {
                    // Get all reservations for this room on the current date
                    const roomReservations = filteredReservations?.filter(res => {
                      if (res.roomId !== room.id) return false;
                      
                      const checkIn = new Date(res.checkInDate);
                      const checkOut = new Date(res.checkOutDate);
                      const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
                      const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
                      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                      
                      // Include if reservation is active on this date
                      return checkInDate.getTime() <= currentDateOnly.getTime() && 
                             checkOutDate.getTime() >= currentDateOnly.getTime();
                    }) || [];

                    return (
                      <Card key={room.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {/* Room Header */}
                          <div 
                            className="p-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleQuickCreate(currentDate, room.id)}
                          >
                            <div>
                              <div className="font-bold text-lg">Room {room.roomNumber}</div>
                              <div className="text-sm text-gray-600">{room.type} • Capacity: {room.capacity}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {roomReservations.length > 0 ? (
                                <Badge variant="secondary">{roomReservations.length} booking{roomReservations.length > 1 ? 's' : ''}</Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600">Available</Badge>
                              )}
                              <Plus className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>

                          {/* Reservations List */}
                          {roomReservations.length > 0 ? (
                            <div className="divide-y">
                              {roomReservations.map(res => {
                                const checkIn = new Date(res.checkInDate);
                                const checkOut = new Date(res.checkOutDate);
                                
                                return (
                                  <div
                                    key={res.id}
                                    onClick={() => handleReservationClick(res)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getStatusColor(res.status)}`}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          {getBookingTypeBadge(res.bookingType)}
                                          {getStatusBadge(res.status)}
                                        </div>
                                        <div className="font-semibold text-gray-900 mb-1">
                                          {res.guestName}
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>
                                              {res.bookingType === BookingType.ShortStay ? (
                                                `${formatTime(res.checkInDate)} - ${formatTime(res.checkOutDate)}`
                                              ) : (
                                                `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`
                                              )}
                                            </span>
                                          </div>
                                          {res.numberOfGuests > 0 && (
                                            <div className="flex items-center gap-2">
                                              <span>{res.numberOfGuests} guest{res.numberOfGuests > 1 ? 's' : ''}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-lg text-green-600">
                                          ${res.totalAmount || 0}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-500 text-sm">
                              No reservations for this date. Click the room header to create one.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No rooms available. Please add rooms or adjust filters.
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Status</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                    <span className="text-sm">Checked In</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                    <span className="text-sm">Checked Out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
                    <span className="text-sm">No Show</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Booking Type</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Short-Stay (Hourly)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
                    <span className="text-sm">Overnight Stay</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Tips</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Click on a date to quickly create a new reservation</li>
                  <li>• Click on a reservation to view details</li>
                  <li>• Hover over dates to see the + icon for quick creation</li>
                  <li>• Short-stay bookings show time ranges (e.g., 10:00 AM - 2:00 PM)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservation Dialog */}
      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        reservation={selectedReservation}
        initialDate={dialogInitialDate}
        onSuccess={handleDialogSuccess}
      />
    </DashboardLayout>
  );
}
