'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRooms, useDeleteRoom, useUpdateRoomStatus, useMarkRoomCleaned } from '@/hooks/useRooms';
import { useHotels } from '@/hooks/useHotels';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Room, RoomTypeLabels, RoomStatusLabels, RoomStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';
import { MoreVertical, CheckCircle } from 'lucide-react';

export default function RoomsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: rooms, isLoading, error } = useRooms();
  const { data: hotels } = useHotels();
  const deleteRoom = useDeleteRoom();
  const updateRoomStatus = useUpdateRoomStatus();
  const markRoomCleaned = useMarkRoomCleaned();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filter rooms by search term and hotel
  const filteredRooms = rooms?.filter((room) => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHotel = selectedHotelId === 'all' || room.hotelId.toString() === selectedHotelId;
    
    return matchesSearch && matchesHotel;
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteRoom.mutateAsync(id);
      showToast('Room deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete room', 'error');
    }
  };

  const handleStatusChange = async (roomId: number, newStatus: RoomStatus) => {
    try {
      await updateRoomStatus.mutateAsync({ id: roomId, status: newStatus });
      showToast(`Room status updated to ${RoomStatusLabels[newStatus]}`, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update room status', 'error');
    }
  };

  const handleMarkCleaned = async (roomId: number) => {
    try {
      await markRoomCleaned.mutateAsync(roomId);
      showToast('Room marked as cleaned', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to mark room as cleaned', 'error');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusStyles = {
      Available: 'bg-green-100 text-green-800 hover:bg-green-100',
      Occupied: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      Cleaning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      Maintenance: 'bg-red-100 text-red-800 hover:bg-red-100',
      OutOfOrder: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      Reserved: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    };
    
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading rooms. Please try again.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
            <p className="mt-1 text-gray-600">
              Manage hotel rooms and availability
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/rooms/new')}>
            <span className="text-lg">+</span>
            Add Room
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search-rooms">Search rooms</Label>
                <Input
                  id="search-rooms"
                  type="text"
                  placeholder="Search by room number, type, or hotel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
              <div>
                <Label htmlFor="filter-hotel">Filter by hotel</Label>
                <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                  <SelectTrigger id="filter-hotel">
                    <SelectValue placeholder="All Hotels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hotels</SelectItem>
                    {hotels?.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))}
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
              <p className="mt-2 text-gray-600">Loading rooms...</p>
            </div>
          ) : filteredRooms && filteredRooms.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                      Room
                  </TableHead>
                  <TableHead>
                      Hotel
                  </TableHead>
                  <TableHead>
                      Type & Capacity
                  </TableHead>
                  <TableHead>
                      Price
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
                  {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            Room {room.roomNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Floor {room.floor}
                          </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">{room.hotelName}</div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">{RoomTypeLabels[room.type]}</div>
                        <div className="text-sm text-gray-500">
                          {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">
                          ${room.pricePerNight}/night
                        </div>
                        {room.allowsShortStay && room.shortStayHourlyRate && (
                          <div className="text-sm text-gray-500">
                            ${room.shortStayHourlyRate}/hour
                          </div>
                        )}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadgeColor(RoomStatusLabels[room.status])}>
                            {RoomStatusLabels[room.status]}
                          </Badge>
                          {room.status === RoomStatus.Cleaning && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkCleaned(room.id)}
                              className="h-6 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Clean
                            </Button>
                          )}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/rooms/${room.id}/edit`)}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50"
                        >
                          Edit
                        </Button>
                        
                        {/* Status Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(room.id, RoomStatus.Available)}>
                              Set Available
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(room.id, RoomStatus.Occupied)}>
                              Set Occupied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(room.id, RoomStatus.Cleaning)}>
                              Set Cleaning
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(room.id, RoomStatus.Maintenance)}>
                              Set Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(room.id, RoomStatus.OutOfService)}>
                              Set Out of Service
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(room.id, RoomStatus.Reserved)}>
                              Set Reserved
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteConfirm(room.id)}
                              className="text-red-600"
                            >
                              Delete Room
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || selectedHotelId ? 'No rooms found matching your filters.' : 'No rooms yet. Create your first room!'}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Room?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this room? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteRoom.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteRoom.isPending}
              >
                {deleteRoom.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
