'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useHotels, useDeleteHotel } from '@/hooks/useHotels';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Hotel } from '@/types';
import { formatDate } from '@/lib/utils/date';

export default function HotelsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { data: hotels, isLoading, error } = useHotels();
  const deleteHotel = useDeleteHotel();
  
  const isSuperAdmin = user?.roles.includes('SuperAdmin');

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filter hotels by search term
  const filteredHotels = hotels?.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteHotel.mutateAsync(id);
      showToast('Hotel deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete hotel', 'error');
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading hotels. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotels</h1>
            <p className="mt-1 text-gray-600">
              Manage your hotel properties
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/hotels/new')}>
            <span className="text-lg">+</span>
            Add Hotel
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <Input
              type="text"
              placeholder="Search hotels by name, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading hotels...</p>
            </div>
          ) : filteredHotels && filteredHotels.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    {isSuperAdmin && <TableHead>Owner</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{hotel.name}</div>
                          {hotel.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {hotel.description}
                            </div>
                          )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="text-sm text-gray-900">{hotel.city}</div>
                        <div className="text-sm text-gray-500">{hotel.country}</div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                          ))}
                        </div>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="text-sm text-gray-900">{hotel.ownerName || 'N/A'}</div>
                      </TableCell>
                    )}
                    <TableCell>
                        <Badge 
                          variant={hotel.isActive ? "default" : "secondary"}
                          className={hotel.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}
                        >
                          {hotel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(hotel.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/hotels/${hotel.id}`)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/hotels/${hotel.id}/edit`)}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(hotel.id)}
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
              {searchTerm ? 'No hotels found matching your search.' : 'No hotels yet. Create your first hotel!'}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Hotel?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this hotel? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteHotel.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteHotel.isPending}
              >
                {deleteHotel.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
