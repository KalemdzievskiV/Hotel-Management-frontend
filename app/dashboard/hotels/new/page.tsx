'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCreateHotel } from '@/hooks/useHotels';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateHotelDto } from '@/types';

export default function NewHotelPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createHotel = useCreateHotel();

  const [formData, setFormData] = useState<CreateHotelDto>({
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
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateHotelDto, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateHotelDto, string>> = {};

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
      await createHotel.mutateAsync(formData);
      showToast('Hotel created successfully!', 'success');
      router.push('/dashboard/hotels');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create hotel', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stars' ? parseInt(value) : value,
    }));
    // Clear error for this field
    if (errors[name as keyof CreateHotelDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Hotel</h1>
          <p className="mt-1 text-gray-600">Create a new hotel property</p>
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
                    placeholder="Grand Plaza Hotel"
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
                    placeholder="A luxurious 5-star hotel in the heart of the city..."
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
                    placeholder="WiFi, Pool, Spa, Gym, Parking"
                  />
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
                    placeholder="123 Main Street"
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
                    placeholder="New York"
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
                    placeholder="USA"
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
                    placeholder="10001"
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
                    placeholder="+1 (555) 123-4567"
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
                    placeholder="info@grandplaza.com"
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
                    placeholder="https://www.grandplaza.com"
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
              disabled={createHotel.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createHotel.isPending}
            >
              {createHotel.isPending ? 'Creating...' : 'Create Hotel'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
