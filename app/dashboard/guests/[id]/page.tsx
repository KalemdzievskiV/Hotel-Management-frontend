'use client';

import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useGuest } from '@/hooks/useGuests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/date';

export default function ViewGuestPage() {
  const router = useRouter();
  const params = useParams();
  const guestId = parseInt(params.id as string);
  
  const { data: guest, isLoading, error } = useGuest(guestId);

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading guest. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !guest) {
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
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {guest.firstName} {guest.lastName}
              {guest.isVIP && <span className="ml-2 text-yellow-500" title="VIP">⭐</span>}
            </h1>
            <p className="mt-1 text-gray-600">Guest Profile</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push(`/dashboard/guests/${guest.id}/edit`)}>
              Edit Guest
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/guests')}
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-3">
          <Badge className={guest.isWalkInGuest ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}>
            {guest.isWalkInGuest ? 'Walk-in Guest' : 'Registered User'}
          </Badge>
          {guest.isBlacklisted ? (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
              ⚠️ Blacklisted
            </Badge>
          ) : guest.isActive ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              ✓ Active
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
              ✗ Inactive
            </Badge>
          )}
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Email</Label>
              <a href={`mailto:${guest.email}`} className="text-blue-600 hover:text-blue-800">
                {guest.email}
              </a>
            </div>

            <div>
              <Label className="text-gray-500">Phone</Label>
              <a href={`tel:${guest.phoneNumber}`} className="text-blue-600 hover:text-blue-800">
                {guest.phoneNumber}
              </a>
            </div>

            {guest.hotelName && (
              <div>
                <Label className="text-gray-500">Hotel</Label>
                <p className="text-gray-900">{guest.hotelName}</p>
              </div>
            )}

            {guest.preferredLanguage && (
              <div>
                <Label className="text-gray-500">Preferred Language</Label>
                <p className="text-gray-900">{guest.preferredLanguage}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guest.dateOfBirth && (
              <div>
                <Label className="text-gray-500">Date of Birth</Label>
                <p className="text-gray-900">{formatDate(guest.dateOfBirth)}</p>
              </div>
            )}

            {guest.gender && (
              <div>
                <Label className="text-gray-500">Gender</Label>
                <p className="text-gray-900">{guest.gender}</p>
              </div>
            )}

            {guest.nationality && (
              <div>
                <Label className="text-gray-500">Nationality</Label>
                <p className="text-gray-900">{guest.nationality}</p>
              </div>
            )}

            {guest.identificationType && (
              <div>
                <Label className="text-gray-500">Identification Type</Label>
                <p className="text-gray-900">{guest.identificationType}</p>
              </div>
            )}

            {guest.identificationNumber && (
              <div>
                <Label className="text-gray-500">Identification Number</Label>
                <p className="text-gray-900">{guest.identificationNumber}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Address */}
        {(guest.address || guest.city || guest.country) && (
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guest.address && (
                <div className="md:col-span-2">
                  <Label className="text-gray-500">Street Address</Label>
                  <p className="text-gray-900">{guest.address}</p>
                </div>
              )}

              {guest.city && (
                <div>
                  <Label className="text-gray-500">City</Label>
                  <p className="text-gray-900">{guest.city}</p>
                </div>
              )}

              {guest.state && (
                <div>
                  <Label className="text-gray-500">State/Province</Label>
                  <p className="text-gray-900">{guest.state}</p>
                </div>
              )}

              {guest.country && (
                <div>
                  <Label className="text-gray-500">Country</Label>
                  <p className="text-gray-900">{guest.country}</p>
                </div>
              )}

              {guest.postalCode && (
                <div>
                  <Label className="text-gray-500">Postal Code</Label>
                  <p className="text-gray-900">{guest.postalCode}</p>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {(guest.emergencyContactName || guest.emergencyContactPhone) && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guest.emergencyContactName && (
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="text-gray-900">{guest.emergencyContactName}</p>
                </div>
              )}

              {guest.emergencyContactPhone && (
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <a href={`tel:${guest.emergencyContactPhone}`} className="text-blue-600 hover:text-blue-800">
                    {guest.emergencyContactPhone}
                  </a>
                </div>
              )}

              {guest.emergencyContactRelationship && (
                <div>
                  <Label className="text-gray-500">Relationship</Label>
                  <p className="text-gray-900">{guest.emergencyContactRelationship}</p>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        {(guest.preferences || guest.specialRequests || guest.loyaltyProgramNumber) && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Requests</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guest.loyaltyProgramNumber && (
                <div>
                  <Label className="text-gray-500">Loyalty Program Number</Label>
                  <p className="text-gray-900">{guest.loyaltyProgramNumber}</p>
                </div>
              )}

              {guest.preferences && (
                <div className="md:col-span-2">
                  <Label className="text-gray-500">Preferences</Label>
                  <p className="text-gray-900">{guest.preferences}</p>
                </div>
              )}

              {guest.specialRequests && (
                <div className="md:col-span-2">
                  <Label className="text-gray-500">Special Requests</Label>
                  <p className="text-gray-900">{guest.specialRequests}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <Label className="text-gray-500 mb-2">Notifications</Label>
                <div className="flex gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${guest.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {guest.emailNotifications ? '✓' : '✗'} Email
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${guest.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {guest.smsNotifications ? '✓' : '✗'} SMS
                  </span>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Company/Billing */}
        {(guest.companyName || guest.taxId) && (
          <Card>
            <CardHeader>
              <CardTitle>Company/Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guest.companyName && (
                <div>
                  <Label className="text-gray-500">Company Name</Label>
                  <p className="text-gray-900">{guest.companyName}</p>
                </div>
              )}

              {guest.taxId && (
                <div>
                  <Label className="text-gray-500">Tax ID</Label>
                  <p className="text-gray-900">{guest.taxId}</p>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600">Total Reservations</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {guest.totalReservations || 0}
              </p>
            </div>

            {guest.lastStayDate && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600">Last Stay</p>
                <p className="mt-1 text-sm font-semibold text-green-900">
                  {formatDate(guest.lastStayDate)}
                </p>
              </div>
            )}

            {guest.createdByUserName && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-600">Created By</p>
                <p className="mt-1 text-sm font-semibold text-purple-900">
                  {guest.createdByUserName}
                </p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Created At</Label>
              <p className="text-gray-900">{formatDate(guest.createdAt)}</p>
            </div>

            {guest.updatedAt && (
              <div>
                <Label className="text-gray-500">Last Updated</Label>
                <p className="text-gray-900">{formatDate(guest.updatedAt)}</p>
              </div>
            )}

            {guest.notes && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">Internal Notes</Label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{guest.notes}</p>
              </div>
            )}

            {guest.isBlacklisted && guest.blacklistReason && (
              <div className="md:col-span-2">
                <Label className="text-red-600">Blacklist Reason</Label>
                <p className="text-red-900 bg-red-50 p-3 rounded border border-red-200">{guest.blacklistReason}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
