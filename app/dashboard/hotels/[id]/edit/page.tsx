'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useHotel, useUpdateHotel } from '@/hooks/useHotels';
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
import { UpdateHotelDto } from '@/types';

export default function EditHotelPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = parseInt(params.id as string);
  const { showToast } = useToast();
  
  const { data: hotel, isLoading: loadingHotel, error } = useHotel(hotelId);
  const updateHotel = useUpdateHotel();

  const [formData, setFormData] = useState<UpdateHotelDto>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
    website: '',
    stars: 3,
    amenities: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateHotelDto, string>>>({});

  // Load hotel data when available
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name,
        description: hotel.description || '',
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        postalCode: hotel.postalCode || '',
        phoneNumber: hotel.phoneNumber || '',
        email: hotel.email || '',
        website: hotel.website || '',
        stars: hotel.stars,
        amenities: hotel.amenities || '',
        checkInTime: hotel.checkInTime || '14:00',
        checkOutTime: hotel.checkOutTime || '11:00',
        isActive: hotel.isActive,
      });
    }
  }, [hotel]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateHotelDto, string>> = {};

    if (!formData.name?.trim()) newErrors.name = 'Hotel name is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
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
      await updateHotel.mutateAsync({ id: hotelId, data: formData });
      showToast('Hotel updated successfully!', 'success');
      router.push('/dashboard/hotels');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update hotel', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stars' ? parseInt(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value,
    }));
    if (errors[name as keyof UpdateHotelDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading hotel. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadingHotel) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading hotel...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
          <p className="mt-1 text-gray-600">Update hotel information</p>
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
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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

              <div className="space-y-2">
                <Label htmlFor="stars">Stars *</Label>
                <Select 
                  value={formData.stars?.toString() || '3'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stars: parseInt(value) }))}
                >
                  <SelectTrigger id="stars">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Star{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">
                  Hotel is Active
                </Label>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Check-in/Check-out Times */}
          <Card>
            <CardHeader>
              <CardTitle>Check-in/Check-out</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleChange}
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
              onClick={() => router.push('/dashboard/hotels')}
              disabled={updateHotel.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateHotel.isPending}
            >
              {updateHotel.isPending ? 'Updating...' : 'Update Hotel'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
