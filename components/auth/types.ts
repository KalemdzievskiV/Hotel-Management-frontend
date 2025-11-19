export interface SignUpFormData {
  // Step 1: Account
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Personal Info
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  
  // Step 3: Address & Preferences
  country: string;
  city: string;
  address: string;
  postalCode: string;
  preferredLanguage: string;
  currency: string;
  agreeToTerms: boolean;
  receivePromotions: boolean;
}
