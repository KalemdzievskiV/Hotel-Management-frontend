// Hotel types matching backend

export interface Hotel {
  id: number;
  ownerId: string;
  ownerName?: string;
  
  // Basic
  name: string;
  description?: string;
  
  // Location
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  
  // Contact
  phoneNumber?: string;
  email?: string;
  website?: string;
  
  // Rating
  stars: number;
  rating: number;
  totalReviews: number;
  
  // Amenities
  amenities?: string;
  
  // Business
  checkInTime?: string;
  checkOutTime?: string;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt?: Date | string;
  
  // Computed
  totalRooms?: number;
  totalReservations?: number;
}

export interface CreateHotelDto {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  stars?: number;
  amenities?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface UpdateHotelDto extends Partial<CreateHotelDto> {
  isActive?: boolean;
}
