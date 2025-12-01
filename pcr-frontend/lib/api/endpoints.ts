// API endpoint functions with RSC support
// These are placeholder functions that will connect to your backend API

import { api } from './client';
import type {
  Asset,
  Warranty,
  Ticket,
  Quote,
  Contract,
  Customer,
  PaginatedResponse,
  ApiResponse,
} from '@/lib/types';

// ============================================================================
// ASSET ENDPOINTS
// ============================================================================

export async function getAssets(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaginatedResponse<Asset>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.status) searchParams.set('status', params.status);

  return api.get<PaginatedResponse<Asset>>(
    `/assets?${searchParams.toString()}`
  );
}

export async function getAsset(id: string): Promise<ApiResponse<Asset>> {
  return api.get<ApiResponse<Asset>>(`/assets/${id}`);
}

export async function createAsset(data: Partial<Asset>): Promise<ApiResponse<Asset>> {
  return api.post<ApiResponse<Asset>>('/assets', data);
}

export async function updateAsset(
  id: string,
  data: Partial<Asset>
): Promise<ApiResponse<Asset>> {
  return api.put<ApiResponse<Asset>>(`/assets/${id}`, data);
}

export async function deleteAsset(id: string): Promise<ApiResponse<void>> {
  return api.delete<ApiResponse<void>>(`/assets/${id}`);
}

// ============================================================================
// WARRANTY ENDPOINTS
// ============================================================================

export async function getWarranties(params?: {
  assetId?: string;
  status?: string;
}): Promise<PaginatedResponse<Warranty>> {
  const searchParams = new URLSearchParams();
  if (params?.assetId) searchParams.set('assetId', params.assetId);
  if (params?.status) searchParams.set('status', params.status);

  return api.get<PaginatedResponse<Warranty>>(
    `/warranties?${searchParams.toString()}`
  );
}

export async function getWarranty(id: string): Promise<ApiResponse<Warranty>> {
  return api.get<ApiResponse<Warranty>>(`/warranties/${id}`);
}

export async function createWarranty(
  data: Partial<Warranty>
): Promise<ApiResponse<Warranty>> {
  return api.post<ApiResponse<Warranty>>('/warranties', data);
}

// ============================================================================
// TICKET ENDPOINTS
// ============================================================================

export async function getTickets(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
}): Promise<PaginatedResponse<Ticket>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);

  return api.get<PaginatedResponse<Ticket>>(
    `/tickets?${searchParams.toString()}`
  );
}

export async function getTicket(id: string): Promise<ApiResponse<Ticket>> {
  return api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
}

export async function createTicket(
  data: Partial<Ticket>
): Promise<ApiResponse<Ticket>> {
  return api.post<ApiResponse<Ticket>>('/tickets', data);
}

export async function updateTicket(
  id: string,
  data: Partial<Ticket>
): Promise<ApiResponse<Ticket>> {
  return api.put<ApiResponse<Ticket>>(`/tickets/${id}`, data);
}

// ============================================================================
// QUOTE ENDPOINTS
// ============================================================================

export async function getQuotes(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  customerId?: string;
}): Promise<PaginatedResponse<Quote>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.customerId) searchParams.set('customerId', params.customerId);

  return api.get<PaginatedResponse<Quote>>(
    `/quotes?${searchParams.toString()}`
  );
}

export async function getQuote(id: string): Promise<ApiResponse<Quote>> {
  return api.get<ApiResponse<Quote>>(`/quotes/${id}`);
}

export async function createQuote(data: Partial<Quote>): Promise<ApiResponse<Quote>> {
  return api.post<ApiResponse<Quote>>('/quotes', data);
}

export async function updateQuote(
  id: string,
  data: Partial<Quote>
): Promise<ApiResponse<Quote>> {
  return api.put<ApiResponse<Quote>>(`/quotes/${id}`, data);
}

// ============================================================================
// CONTRACT ENDPOINTS
// ============================================================================

export async function getContracts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
}): Promise<PaginatedResponse<Contract>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.type) searchParams.set('type', params.type);

  return api.get<PaginatedResponse<Contract>>(
    `/contracts?${searchParams.toString()}`
  );
}

export async function getContract(id: string): Promise<ApiResponse<Contract>> {
  return api.get<ApiResponse<Contract>>(`/contracts/${id}`);
}

export async function createContract(
  data: Partial<Contract>
): Promise<ApiResponse<Contract>> {
  return api.post<ApiResponse<Contract>>('/contracts', data);
}

export async function updateContract(
  id: string,
  data: Partial<Contract>
): Promise<ApiResponse<Contract>> {
  return api.put<ApiResponse<Contract>>(`/contracts/${id}`, data);
}

// ============================================================================
// CUSTOMER ENDPOINTS
// ============================================================================

export async function getCustomers(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
}): Promise<PaginatedResponse<Customer>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.type) searchParams.set('type', params.type);

  return api.get<PaginatedResponse<Customer>>(
    `/customers?${searchParams.toString()}`
  );
}

export async function getCustomer(id: string): Promise<ApiResponse<Customer>> {
  return api.get<ApiResponse<Customer>>(`/customers/${id}`);
}
