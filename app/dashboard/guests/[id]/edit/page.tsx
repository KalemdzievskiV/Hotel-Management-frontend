'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useGuest, useUpdateGuest } from '@/hooks/useGuests';
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
import { UpdateGuestDto } from '@/types';

export default function EditGuestPage() {
  const router = useRouter();
  const params = useParams();
  const guestId = parseInt(params.id as string);
  const { showToast } = useToast();
  
  const { data: guest, isLoading: loadingGuest, error } = useGuest(guestId);
  const { data: hotels } = useHotels();
  const updateGuest = useUpdateGuest();

  const [formData, setFormData] = useState<UpdateGuestDto>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    hotelId: undefined,
    identificationNumber: '',
    identificationType: '',
    dateOfBirth: '',
    nationality: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    specialRequests: '',
    preferences: '',
    isVIP: false,
    loyaltyProgramNumber: '',
    emailNotifications: true,
    smsNotifications: false,
    preferredLanguage: '',
    companyName: '',
    taxId: '',
    notes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateGuestDto, string>>>({});

  // Load guest data when available
  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phoneNumber: guest.phoneNumber,
        hotelId: guest.hotelId,
        identificationNumber: guest.identificationNumber || '',
        identificationType: guest.identificationType || '',
        dateOfBirth: guest.dateOfBirth ? new Date(guest.dateOfBirth).toISOString().split('T')[0] : '',
        nationality: guest.nationality || '',
        gender: guest.gender || '',
        address: guest.address || '',
        city: guest.city || '',
        state: guest.state || '',
        country: guest.country || '',
        postalCode: guest.postalCode || '',
        emergencyContactName: guest.emergencyContactName || '',
        emergencyContactPhone: guest.emergencyContactPhone || '',
        emergencyContactRelationship: guest.emergencyContactRelationship || '',
        specialRequests: guest.specialRequests || '',
        preferences: guest.preferences || '',
        isVIP: guest.isVIP,
        loyaltyProgramNumber: guest.loyaltyProgramNumber || '',
        emailNotifications: guest.emailNotifications,
        smsNotifications: guest.smsNotifications,
        preferredLanguage: guest.preferredLanguage || '',
        companyName: guest.companyName || '',
        taxId: guest.taxId || '',
        notes: guest.notes || '',
        isActive: guest.isActive,
      });
    }
  }, [guest]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateGuestDto, string>> = {};

    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';

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
      // Clean up empty strings
      const cleanedData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' || typeof value === 'boolean' || typeof value === 'number') {
          cleanedData[key] = value;
        }
      });

      await updateGuest.mutateAsync({ id: guestId, data: cleanedData });
      showToast('Guest updated successfully!', 'success');
      router.push('/dashboard/guests');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Failed to update guest';
      showToast(errorMessage, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'hotelId') {
      parsedValue = value ? parseInt(value, 10) : undefined;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    
    if (errors[name as keyof UpdateGuestDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading guest. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadingGuest) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading guest...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Guest</h1>
          <p className="mt-1 text-gray-600">Update guest information for {guest?.firstName} {guest?.lastName}</p>
        </div>

        {/* Form - Same structure as create, but with pre-filled data */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
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
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelId">Hotel</Label>
                <Select
                  name="hotelId"
                  value={formData.hotelId?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, hotelId: value ? parseInt(value) : undefined }))}
                  disabled={!guest?.isWalkInGuest}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No specific hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels?.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!guest?.isWalkInGuest && (
                  <p className="text-xs text-gray-500">Hotel cannot be changed for registered users</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="PreferNotToSay">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="e.g., American, British"
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Preferences</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVIP"
                  name="isVIP"
                  checked={formData.isVIP}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVIP: checked as boolean }))}
                />
                <Label htmlFor="isVIP" className="font-medium cursor-pointer">VIP ⭐</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked as boolean }))}
                />
                <Label htmlFor="emailNotifications" className="cursor-pointer">Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked as boolean }))}
                />
                <Label htmlFor="smsNotifications" className="cursor-pointer">SMS Notifications</Label>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Internal notes"
              />
            </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/guests')}
              disabled={updateGuest.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateGuest.isPending}
            >
              {updateGuest.isPending ? 'Updating...' : 'Update Guest'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
