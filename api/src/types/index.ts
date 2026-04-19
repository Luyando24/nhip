export type UserRole = 
  | 'clinician' 
  | 'pharmacist' 
  | 'facility_admin' 
  | 'provincial_officer' 
  | 'ministry_admin' 
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  facilityId?: string;
  province?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface Facility {
  id: string;
  name: string;
  district: string;
  province: string;
  facilityType: 'hospital' | 'clinic' | 'health_post';
  lat?: number;
  lng?: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  province?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DeathRecord {
  id: string;
  facilityId: string;
  recordedBy: string;
  patientAgeYears?: number;
  patientSex: 'male' | 'female' | 'unknown';
  patientDistrict?: string;
  primaryCauseIcd11: string;
  primaryCauseLabel: string;
  timeOfDeath: Date;
  timeOfAdmission?: Date;
  ward?: string;
  wasAdmitted: boolean;
  notes?: string;
  createdAt: Date;
}

export interface DrugInventory {
  id: string;
  facilityId: string;
  drugName: string;
  genericName?: string;
  batchNumber?: string;
  quantityInStock: number;
  unit: string;
  expiryDate: Date;
  reorderLevel: number;
  lastUpdatedBy?: string;
  updatedAt: Date;
}
