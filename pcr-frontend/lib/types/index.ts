// Core domain types for P.C. Resource platform

export interface Asset {
  id: string;
  assetTag: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: 'desktop' | 'laptop' | 'server' | 'peripheral' | 'other';
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location: string;
  purchaseDate: string;
  warrantyId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warranty {
  id: string;
  assetId: string;
  provider: string;
  startDate: string;
  endDate: string;
  coverageType: 'parts' | 'labor' | 'full' | 'limited';
  status: 'active' | 'expired' | 'pending';
  termsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  assetId?: string;
  customerId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  type: 'repair' | 'rma' | 'maintenance' | 'support';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  type: 'lease' | 'service' | 'support' | 'maintenance';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  value: number;
  renewalDate?: string;
  sla?: ServiceLevelAgreement;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLevelAgreement {
  responseTime: string; // e.g., "4 hours"
  resolutionTime: string; // e.g., "24 hours"
  availability: string; // e.g., "99.9%"
  supportHours: string; // e.g., "24/7" or "Business hours"
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'business' | 'government' | 'education' | 'nonprofit';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'technician' | 'sales' | 'customer';
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}
