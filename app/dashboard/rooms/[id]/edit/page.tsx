'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRoom, useUpdateRoom } from '@/hooks/useRooms';
import { useHotels } from '@/hooks/useHotels';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UpdateRoomDto, RoomType, RoomStatus, RoomTypeLabels, RoomStatusLabels } from '@/types';

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = parseInt(params.id as string);
  const { showToast } = useToast();
  
  const { data: room, isLoading: loadingRoom, error } = useRoom(roomId);
  const { data: hotels } = useHotels();
  const updateRoom = useUpdateRoom();

  const [formData, setFormData] = useState<UpdateRoomDto>({
    roomNumber: '',
    type: RoomType.Single,
    floor: 1,
    capacity: 1,
    pricePerNight: 0,
    allowsShortStay: false,
    description: '',
    amenities: '',
    status: RoomStatus.Available,
    isActive: true,
    bedType: '',
    hasBathtub: false,
    hasBalcony: false,
    isSmokingAllowed: false,
    viewType: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateRoomDto, string>>>({});

  // Load room data when available
  useEffect(() => {
    if (room) {
      setFormData({
        hotelId: room.hotelId, // Include hotelId for backend validation
        roomNumber: room.roomNumber,
        type: room.type,
        floor: room.floor,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        allowsShortStay: room.allowsShortStay,
        shortStayHourlyRate: room.shortStayHourlyRate,
        minimumShortStayHours: room.minimumShortStayHours,
        maximumShortStayHours: room.maximumShortStayHours,
        description: room.description || '',
        amenities: room.amenities || '',
        areaSqM: room.areaSqM,
        status: room.status,
        isActive: room.isActive,
        bedType: room.bedType || '',
        hasBathtub: room.hasBathtub,
        hasBalcony: room.hasBalcony,
        isSmokingAllowed: room.isSmokingAllowed,
        viewType: room.viewType || '',
        notes: room.notes || '',
      });
    }
  }, [room]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateRoomDto, string>> = {};

    if (!formData.roomNumber?.trim()) newErrors.roomNumber = 'Room number is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (!formData.pricePerNight || formData.pricePerNight < 0) newErrors.pricePerNight = 'Price per night is required';
    
    if (formData.allowsShortStay) {
      if (!formData.shortStayHourlyRate || formData.shortStayHourlyRate < 0) {
        newErrors.shortStayHourlyRate = 'Hourly rate is required for short-stay rooms';
      }
      if (formData.minimumShortStayHours && formData.minimumShortStayHours < 1) {
        newErrors.minimumShortStayHours = 'Minimum hours must be at least 1';
      }
      if (formData.maximumShortStayHours && formData.maximumShortStayHours > 24) {
        newErrors.maximumShortStayHours = 'Maximum hours cannot exceed 24';
      }
      if (formData.minimumShortStayHours && formData.maximumShortStayHours && 
          formData.minimumShortStayHours > formData.maximumShortStayHours) {
        newErrors.maximumShortStayHours = 'Maximum hours must be greater than minimum hours';
      }
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
      console.log('Updating room with data:', formData);
      await updateRoom.mutateAsync({ id: roomId, data: formData });
      showToast('Room updated successfully!', 'success');
      router.push('/dashboard/rooms');
    } catch (error: any) {
      console.error('Room update error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Failed to update room';
      showToast(errorMessage, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (name === 'type' || name === 'status') {
      parsedValue = parseInt(value, 10);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    
    if (errors[name as keyof UpdateRoomDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading room. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadingRoom) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading room...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Room</h1>
          <p className="mt-1 text-gray-600">Update room information for {room?.hotelName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hotel">Hotel</Label>
                <Input
                  id="hotel"
                  value={room?.hotelName || ''}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">Hotel cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className={errors.roomNumber ? 'border-red-500' : ''}
                />
                {errors.roomNumber && <p className="text-sm text-red-600">{errors.roomNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Room Type *</Label>
                <Select
                  name="type"
                  value={formData.type?.toString() || '0'}
                  onValueChange={(value) => handleChange({ target: { name: 'type', value, type: 'select' } } as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RoomTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                {errors.capacity && <p className="text-sm text-red-600">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Price per Night *</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={errors.pricePerNight ? 'border-red-500' : ''}
                />
                {errors.pricePerNight && <p className="text-sm text-red-600">{errors.pricePerNight}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Short-Stay Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Short-Stay Configuration</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowsShortStay"
                  name="allowsShortStay"
                  checked={formData.allowsShortStay}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'allowsShortStay', checked, type: 'checkbox' } } as any)}
                />
                <Label htmlFor="allowsShortStay" className="font-medium cursor-pointer">
                  Allow Short-Stay (Hourly) Bookings
                </Label>
              </div>

              {formData.allowsShortStay && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-6 border-l-2 border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="shortStayHourlyRate">Hourly Rate *</Label>
                    <Input
                      id="shortStayHourlyRate"
                      type="number"
                      name="shortStayHourlyRate"
                      value={formData.shortStayHourlyRate || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={errors.shortStayHourlyRate ? 'border-red-500' : ''}
                      placeholder="25.00"
                    />
                    {errors.shortStayHourlyRate && <p className="text-sm text-red-600">{errors.shortStayHourlyRate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumShortStayHours">Minimum Hours</Label>
                    <Input
                      id="minimumShortStayHours"
                      type="number"
                      name="minimumShortStayHours"
                      value={formData.minimumShortStayHours || ''}
                      onChange={handleChange}
                      min="1"
                      max="24"
                      className={errors.minimumShortStayHours ? 'border-red-500' : ''}
                      placeholder="2"
                    />
                    {errors.minimumShortStayHours && <p className="text-sm text-red-600">{errors.minimumShortStayHours}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximumShortStayHours">Maximum Hours</Label>
                    <Input
                      id="maximumShortStayHours"
                      type="number"
                      name="maximumShortStayHours"
                      value={formData.maximumShortStayHours || ''}
                      onChange={handleChange}
                      min="1"
                      max="24"
                      className={errors.maximumShortStayHours ? 'border-red-500' : ''}
                      placeholder="12"
                    />
                    {errors.maximumShortStayHours && <p className="text-sm text-red-600">{errors.maximumShortStayHours}</p>}
                  </div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>

          {/* Room Features */}
          <Card>
            <CardHeader>
              <CardTitle>Room Features</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bedType">Bed Type</Label>
                <Input
                  id="bedType"
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleChange}
                  placeholder="King, Queen, Twin, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewType">View Type</Label>
                <Input
                  id="viewType"
                  name="viewType"
                  value={formData.viewType}
                  onChange={handleChange}
                  placeholder="City, Ocean, Garden, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaSqM">Area (sq m)</Label>
                <Input
                  id="areaSqM"
                  type="number"
                  name="areaSqM"
                  value={formData.areaSqM || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="25.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status?.toString() || '0'}
                  onValueChange={(value) => handleChange({ target: { name: 'status', value, type: 'select' } } as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RoomStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="WiFi, TV, Mini-bar, Air conditioning"
                />
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasBathtub"
                      name="hasBathtub"
                      checked={formData.hasBathtub}
                      onCheckedChange={(checked) => handleChange({ target: { name: 'hasBathtub', checked, type: 'checkbox' } } as any)}
                    />
                    <Label htmlFor="hasBathtub" className="cursor-pointer">Has Bathtub</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasBalcony"
                      name="hasBalcony"
                      checked={formData.hasBalcony}
                      onCheckedChange={(checked) => handleChange({ target: { name: 'hasBalcony', checked, type: 'checkbox' } } as any)}
                    />
                    <Label htmlFor="hasBalcony" className="cursor-pointer">Has Balcony</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSmokingAllowed"
                      name="isSmokingAllowed"
                      checked={formData.isSmokingAllowed}
                      onCheckedChange={(checked) => handleChange({ target: { name: 'isSmokingAllowed', checked, type: 'checkbox' } } as any)}
                    />
                    <Label htmlFor="isSmokingAllowed" className="cursor-pointer">Smoking Allowed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleChange({ target: { name: 'isActive', checked, type: 'checkbox' } } as any)}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">Room is Active</Label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Internal notes about the room..."
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
              onClick={() => router.push('/dashboard/rooms')}
              disabled={updateRoom.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateRoom.isPending}
            >
              {updateRoom.isPending ? 'Updating...' : 'Update Room'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
