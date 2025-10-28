// User types matching backend

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  
  // Profile
  profilePictureUrl?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Professional
  jobTitle?: string;
  department?: string;
  hotelId?: number;
  hotelName?: string;
  
  // Emergency
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Preferences
  preferredLanguage?: string;
  timeZone?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Status
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastLoginDate?: Date | string;
  notes?: string;
  
  // Roles
  roles: string[];
  
  // Computed
  age?: number;
  isStaff?: boolean;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  jobTitle?: string;
  department?: string;
  hotelId?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredLanguage?: string;
  timeZone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  jobTitle?: string;
  department?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredLanguage?: string;
  timeZone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  notes?: string;
}
