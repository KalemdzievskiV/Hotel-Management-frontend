'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCreateGuest } from '@/hooks/useGuests';
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
import { CreateGuestDto } from '@/types';

export default function NewGuestPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createGuest = useCreateGuest();
  const { data: hotels } = useHotels();

  const [formData, setFormData] = useState<CreateGuestDto>({
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
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateGuestDto, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateGuestDto, string>> = {};

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
      const cleanedData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' || typeof value === 'boolean' || typeof value === 'number') {
          cleanedData[key] = value;
        }
      });

      await createGuest.mutateAsync(cleanedData);
      showToast('Guest created successfully!', 'success');
      router.push('/dashboard/guests');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Failed to create guest';
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
    
    if (errors[name as keyof CreateGuestDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Guest</h1>
          <p className="mt-1 text-gray-600">Create a new walk-in guest profile</p>
        </div>

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
                  <Label htmlFor="hotelId">Hotel (Optional)</Label>
                  <Select
                    name="hotelId"
                    value={formData.hotelId?.toString() || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, hotelId: value ? parseInt(value) : undefined }))}
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
                  <p className="text-xs text-gray-500">Link this walk-in guest to a specific hotel</p>
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

          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle>Identification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="identificationType">Identification Type</Label>
                  <Select
                    name="identificationType"
                    value={formData.identificationType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, identificationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="DriverLicense">Driver's License</SelectItem>
                      <SelectItem value="NationalID">National ID</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationNumber">Identification Number</Label>
                  <Input
                    id="identificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
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

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Input
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    placeholder="e.g., English, Spanish"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loyaltyProgramNumber">Loyalty Program Number</Label>
                  <Input
                    id="loyaltyProgramNumber"
                    name="loyaltyProgramNumber"
                    value={formData.loyaltyProgramNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="preferences">Preferences</Label>
                  <Textarea
                    id="preferences"
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Room preferences, dietary restrictions, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isVIP"
                        checked={formData.isVIP}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVIP: checked as boolean }))}
                      />
                      <Label htmlFor="isVIP" className="cursor-pointer">VIP Guest</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked as boolean }))}
                      />
                      <Label htmlFor="emailNotifications" className="cursor-pointer">Email Notifications</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsNotifications"
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked as boolean }))}
                      />
                      <Label htmlFor="smsNotifications" className="cursor-pointer">SMS Notifications</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
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
                  placeholder="Internal notes about the guest (not visible to guest)"
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
              disabled={createGuest.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGuest.isPending}
            >
              {createGuest.isPending ? 'Creating...' : 'Create Guest'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
