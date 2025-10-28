'use client';

import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useHotel } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils/date';

export default function ViewHotelPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = parseInt(params.id as string);
  
  const { data: hotel, isLoading, error } = useHotel(hotelId);

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading hotel. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !hotel) {
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
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="mt-1 text-gray-600">Hotel Details</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push(`/dashboard/hotels/${hotel.id}/edit`)}>
              Edit Hotel
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/hotels')}
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <Badge className={hotel.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
            {hotel.isActive ? '✓ Active' : '✗ Inactive'}
          </Badge>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">
                Hotel Name
              </Label>
              <p className="text-gray-900">{hotel.name}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                Rating
              </Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
                <span className="text-gray-600 ml-2">
                  ({hotel.stars} star{hotel.stars !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {hotel.description && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">
                  Description
                </Label>
                <p className="text-gray-900">{hotel.description}</p>
              </div>
            )}

            {hotel.amenities && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">
                  Amenities
                </Label>
                <p className="text-gray-900">{hotel.amenities}</p>
              </div>
            )}
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
            <div>
              <Label className="text-gray-500">
                Address
              </Label>
              <p className="text-gray-900">{hotel.address}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                City
              </Label>
              <p className="text-gray-900">{hotel.city}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                Country
              </Label>
              <p className="text-gray-900">{hotel.country}</p>
            </div>

            {hotel.postalCode && (
              <div>
                <Label className="text-gray-500">
                  Postal Code
                </Label>
                <p className="text-gray-900">{hotel.postalCode}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotel.phoneNumber && (
              <div>
                <Label className="text-gray-500">
                  Phone Number
                </Label>
                <a
                  href={`tel:${hotel.phoneNumber}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {hotel.phoneNumber}
                </a>
              </div>
            )}

            {hotel.email && (
              <div>
                <Label className="text-gray-500">
                  Email
                </Label>
                <a
                  href={`mailto:${hotel.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {hotel.email}
                </a>
              </div>
            )}

            {hotel.website && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">
                  Website
                </Label>
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {hotel.website}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Check-in/Check-out */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in/Check-out Times</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">
                Check-in Time
              </Label>
              <p className="text-gray-900">{hotel.checkInTime || 'Not set'}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                Check-out Time
              </Label>
              <p className="text-gray-900">{hotel.checkOutTime || 'Not set'}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600">Total Rooms</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {hotel.totalRooms || 0}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600">Total Reservations</p>
              <p className="mt-1 text-2xl font-bold text-green-900">
                {hotel.totalReservations || 0}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-600">Average Rating</p>
              <p className="mt-1 text-2xl font-bold text-yellow-900">
                {hotel.rating ? hotel.rating.toFixed(1) : 'N/A'}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-600">Total Reviews</p>
              <p className="mt-1 text-2xl font-bold text-purple-900">
                {hotel.totalReviews || 0}
              </p>
            </div>
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
              <Label className="text-gray-500">
                Created At
              </Label>
              <p className="text-gray-900">{formatDate(hotel.createdAt)}</p>
            </div>

            {hotel.updatedAt && (
              <div>
                <Label className="text-gray-500">
                  Last Updated
                </Label>
                <p className="text-gray-900">{formatDate(hotel.updatedAt)}</p>
              </div>
            )}

            {hotel.ownerName && (
              <div>
                <Label className="text-gray-500">
                  Owner
                </Label>
                <p className="text-gray-900">{hotel.ownerName}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
