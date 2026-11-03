import { RoomType, RoomStatus } from './enums';

// Room types matching backend

export interface Room {
  id: number;
  hotelId: number;
  hotelName?: string;
  
  // Identification
  roomNumber: string;
  type: RoomType;
  floor: number;
  
  // Capacity & Pricing
  capacity: number;
  pricePerNight: number;
  
  // Short stay: a fixed length (e.g. 4 hours) at a flat price
  allowsShortStay: boolean;
  shortStayHours?: number;
  shortStayPrice?: number;
  
  // Details
  description?: string;
  amenities?: string;
  images?: string;
  areaSqM?: number;
  
  // Status
  status: RoomStatus;
  isActive: boolean;
  
  // Features
  bedType?: string;
  hasBathtub: boolean;
  hasBalcony: boolean;
  isSmokingAllowed: boolean;
  viewType?: string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastCleaned?: Date | string;
  lastMaintenance?: Date | string;
  
  // Notes
  notes?: string;
  
  // Computed
  totalReservations?: number;
}

export interface CreateRoomDto {
  hotelId: number;
  roomNumber: string;
  type: RoomType;
  floor?: number;
  capacity: number;
  pricePerNight: number;
  allowsShortStay?: boolean;
  shortStayHours?: number;
  shortStayPrice?: number;
  description?: string;
  amenities?: string;
  images?: string;
  areaSqM?: number;
  status?: RoomStatus;
  isActive?: boolean;
  bedType?: string;
  hasBathtub?: boolean;
  hasBalcony?: boolean;
  isSmokingAllowed?: boolean;
  viewType?: string;
  notes?: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}
