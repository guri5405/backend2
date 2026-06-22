import type { ApplicationStatus, PropertyStatus, UserRole } from './models';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicUserDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  address: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  address?: string;
  rentAmount?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: PropertyStatus;
}

export interface ListPropertiesQuery {
  page?: number;
  limit?: number;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  status?: PropertyStatus;
  sortBy?: 'rentAmount' | 'createdAt' | 'bedrooms' | 'bathrooms' | 'title';
  order?: 'asc' | 'desc';
}

export interface PropertyDTO {
  id: number;
  landlordId: number;
  title: string;
  description: string;
  address: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplyToPropertyInput {
  message?: string | null;
}

export interface ApplicationDTO {
  id: number;
  propertyId: number;
  tenantId: number;
  message: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  property?: {
    title: string;
    address: string;
    rentAmount?: number;
  };
  tenant?: {
    name: string;
    email: string;
  };
}


export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface LandlordDashboardStats {
  totalProperties: number;
  activeProperties: number;
  rentedProperties: number;
  totalApplications: number;
}

export interface TenantDashboardStats {
  totalApplications: number;
  approved: number;
  rejected: number;
  pending: number;
}
