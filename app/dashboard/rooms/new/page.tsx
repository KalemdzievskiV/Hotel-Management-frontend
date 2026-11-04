'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCreateRoom } from '@/hooks/useRooms';
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
import { CreateRoomDto, RoomType, RoomStatus, RoomTypeLabels, RoomStatusLabels } from '@/types';

export default function NewRoomPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createRoom = useCreateRoom();
  const { data: hotels } = useHotels();

  const [formData, setFormData] = useState<CreateRoomDto>({
    hotelId: 0,
    roomNumber: '',
    type: RoomType.Single,
    floor: 1,
    capacity: 1,
    pricePerNight: 0,
    allowsShortStay: false,
    shortStayHours: 4,
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

  const [errors, setErrors] = useState<Partial<Record<keyof CreateRoomDto, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRoomDto, string>> = {};

    if (!formData.hotelId) newErrors.hotelId = 'Hotel is required';
    if (!formData.roomNumber?.trim()) newErrors.roomNumber = 'Room number is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (!formData.pricePerNight || formData.pricePerNight < 0) newErrors.pricePerNight = 'Price per night is required';
    
    if (formData.allowsShortStay) {
      if (!formData.shortStayHours || formData.shortStayHours < 1 || formData.shortStayHours > 23) {
        newErrors.shortStayHours = 'Short stay length must be between 1 and 23 hours';
      }
      if (!formData.shortStayPrice || formData.shortStayPrice <= 0) {
        newErrors.shortStayPrice = 'Short stay price is required';
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
      console.log('Creating room with data:', formData);
      await createRoom.mutateAsync(formData);
      showToast('Room created successfully!', 'success');
      router.push('/dashboard/rooms');
    } catch (error: any) {
      console.error('Room creation error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Failed to create room';
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
    } else if (name === 'hotelId' || name === 'type' || name === 'status') {
      // Parse enum and ID fields as numbers
      parsedValue = parseInt(value, 10);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    
    if (errors[name as keyof CreateRoomDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Room</h1>
          <p className="mt-1 text-gray-600">Create a new room for your hotel</p>
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
                <Label htmlFor="hotelId">Hotel *</Label>
                <Select
                  name="hotelId"
                  value={formData.hotelId ? formData.hotelId.toString() : ''}
                  onValueChange={(value) => handleChange({ target: { name: 'hotelId', value, type: 'select' } } as any)}
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
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className={errors.roomNumber ? 'border-red-500' : ''}
                  placeholder="101"
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
                  <SelectTrigger className="w-full">
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
                  placeholder="150.00"
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
                  placeholder="Spacious room with city view..."
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
                  Allow Short-Stay Bookings
                </Label>
              </div>

              {formData.allowsShortStay && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="shortStayHours">Short Stay Length (hours) *</Label>
                    <Input
                      id="shortStayHours"
                      type="number"
                      name="shortStayHours"
                      value={formData.shortStayHours || ''}
                      onChange={handleChange}
                      min="1"
                      max="23"
                      step="1"
                      className={errors.shortStayHours ? 'border-red-500' : ''}
                      placeholder="4"
                    />
                    <p className="text-xs text-gray-500">Staff can book more or fewer hours when needed.</p>
                    {errors.shortStayHours && <p className="text-sm text-red-600">{errors.shortStayHours}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortStayPrice">Short Stay Price *</Label>
                    <Input
                      id="shortStayPrice"
                      type="number"
                      name="shortStayPrice"
                      value={formData.shortStayPrice || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={errors.shortStayPrice ? 'border-red-500' : ''}
                      placeholder="100.00"
                    />
                    <p className="text-xs text-gray-500">Flat price for the whole short stay, not per hour.</p>
                    {errors.shortStayPrice && <p className="text-sm text-red-600">{errors.shortStayPrice}</p>}
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
                  <SelectTrigger className="w-full">
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
              disabled={createRoom.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRoom.isPending}
            >
              {createRoom.isPending ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
