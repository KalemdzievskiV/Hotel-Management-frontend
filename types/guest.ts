// Guest types matching backend

export interface Guest {
  id: number;
  userId?: string;
  hotelId?: number;
  createdByUserId?: string;
  
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  
  // Identification
  identificationNumber?: string;
  identificationType?: string;
  dateOfBirth?: Date | string;
  nationality?: string;
  gender?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Preferences
  specialRequests?: string;
  preferences?: string;
  isVIP: boolean;
  loyaltyProgramNumber?: string;
  
  // Communication
  emailNotifications: boolean;
  smsNotifications: boolean;
  preferredLanguage?: string;
  
  // Billing
  companyName?: string;
  taxId?: string;
  
  // Status
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  notes?: string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastStayDate?: Date | string;
  
  // Computed
  hotelName?: string;
  createdByUserName?: string;
  isWalkInGuest?: boolean;
  totalReservations?: number;
}

export interface CreateGuestDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  hotelId?: number;
  identificationNumber?: string;
  identificationType?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  specialRequests?: string;
  preferences?: string;
  isVIP?: boolean;
  loyaltyProgramNumber?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  preferredLanguage?: string;
  companyName?: string;
  taxId?: string;
  notes?: string;
}

export interface UpdateGuestDto extends Partial<CreateGuestDto> {
  isActive?: boolean;
}
