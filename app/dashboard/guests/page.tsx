'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useGuests, useDeleteGuest } from '@/hooks/useGuests';
import { useHotels } from '@/hooks/useHotels';
import { useToast } from '@/components/ui/Toast';
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
import { Guest } from '@/types';
import { formatDate } from '@/lib/utils/date';

export default function GuestsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: guests, isLoading, error } = useGuests();
  const { data: hotels } = useHotels();
  const deleteGuest = useDeleteGuest();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [guestTypeFilter, setGuestTypeFilter] = useState<string>('all'); // all, walk-in, registered
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filter guests
  const filteredGuests = guests?.filter((guest) => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phoneNumber.includes(searchTerm);
    
    const matchesHotel = selectedHotelId === 'all' || guest.hotelId?.toString() === selectedHotelId;
    
    const matchesType = 
      guestTypeFilter === 'all' ||
      (guestTypeFilter === 'walk-in' && guest.isWalkInGuest) ||
      (guestTypeFilter === 'registered' && !guest.isWalkInGuest);
    
    return matchesSearch && matchesHotel && matchesType;
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteGuest.mutateAsync(id);
      showToast('Guest deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete guest', 'error');
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading guests. Please try again.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Guests</h1>
            <p className="mt-1 text-gray-600">
              Manage guest information and profiles
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/guests/new')}>
            <span className="text-lg">+</span>
            Add Guest
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search-guests">Search guests</Label>
                <Input
                  id="search-guests"
                  type="text"
                  placeholder="Search by name, email, or phone..."
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
              <div>
                <Label htmlFor="filter-type">Guest type</Label>
                <Select value={guestTypeFilter} onValueChange={setGuestTypeFilter}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="All Guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Guests</SelectItem>
                    <SelectItem value="walk-in">Walk-in Guests</SelectItem>
                    <SelectItem value="registered">Registered Users</SelectItem>
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
              <p className="mt-2 text-gray-600">Loading guests...</p>
            </div>
          ) : filteredGuests && filteredGuests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                      Guest
                  </TableHead>
                  <TableHead>
                      Contact
                  </TableHead>
                  <TableHead>
                      Type
                  </TableHead>
                  <TableHead>
                      Hotel
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
                  {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {guest.firstName} {guest.lastName}
                            {guest.isVIP && (
                              <span className="ml-2 text-yellow-500" title="VIP">⭐</span>
                            )}
                          </div>
                          {guest.nationality && (
                            <div className="text-sm text-gray-500">{guest.nationality}</div>
                          )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">{guest.email}</div>
                        <div className="text-sm text-gray-500">{guest.phoneNumber}</div>
                    </TableCell>
                    <TableCell>
                        <Badge className={guest.isWalkInGuest ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}>
                          {guest.isWalkInGuest ? 'Walk-in' : 'Registered'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">
                          {guest.hotelName || '-'}
                        </div>
                    </TableCell>
                    <TableCell>
                        {guest.isBlacklisted ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Blacklisted
                          </Badge>
                        ) : guest.isActive ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Inactive
                          </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/guests/${guest.id}`)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/guests/${guest.id}/edit`)}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(guest.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || selectedHotelId || guestTypeFilter !== 'all' 
                ? 'No guests found matching your filters.' 
                : 'No guests yet. Create your first guest!'}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Guest?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this guest? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteGuest.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteGuest.isPending}
              >
                {deleteGuest.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
