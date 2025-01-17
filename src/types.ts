export interface User {
  id: number;
  username: string;
  email: string;
  job_title: string;
  role: 'admin' | 'user';
  title: string | null;
  is_approved: boolean;
  points: number;
  room_type_preferences: number[] | null;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  job_title: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  job_title?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: 'admin' | 'user' | '';
  is_approved?: boolean;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface UserResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  users: User[];
}

// Hotel types
export interface Hotel {
  id: number;
  name: string;
  location: string;
  segment: {
    id: number;
    name: string;
  };
  sales_process: {
    id: number;
    name: string;
    stage: string;
  };
  status: Status;
  google_review_score?: number;
  google_number_of_reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface HotelFilters {
  search?: string;
  location?: string;
  segment_id?: number;
  sales_process_id?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  min_rating?: number;
  max_rating?: number;
}

// Common types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type EntityType = 'hotel' | 'booking' | 'guest' | 'contact';
export type TransactionType = 'payment' | 'refund' | 'charge';
export type SortDirection = 'ASC' | 'DESC';
export enum SortField {
  NAME = 'name',
  LOCATION = 'location',
  SEGMENT = 'segment',
  SALES_STAGE = 'sales_stage',
  STATUS = 'status',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  REVIEWS = 'google_number_of_reviews',
  RATING = 'google_review_score'
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Ticket types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  summary: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  createdBy: string;
  entityType: EntityType;
  entityId: string;
  entities: {
    hotels: any[];
    contacts: any[];
    bookings: any[];
    guests: any[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  entityType?: EntityType;
  limit?: number;
}

// Booking types
export interface Booking {
  id: string;
  hotelId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  status: Status;
  paymentStatus: 'pending' | 'paid' | 'partial';
  roomType: string;
  totalAmount: number;
  createdAt: string;
}

// Guest types
export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingsCount: number;
  lastBooking: string;
  createdAt: string;
}

// Contact types
export interface Contact {
  id: string;
  hotelId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  lastInteraction: string;
  createdAt: string;
}

// Transaction types
export interface Transaction {
  id: string;
  hotelId: string;
  bookingId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: 'pending' | 'cancelled' | 'completed';
  description: string;
  date: string;
  createdAt: string;
}

export interface HotelBalance {
  id: string;
  hotelId: string;
  balance: number;
  currency: string;
  pendingAmount: number;
  pendingInvoices: number;
  pendingPayments: number;
  lastPaymentDate: string;
  lastUpdated: string;
}

export type Location = string;

export interface Segment {
  id: number;
  name: string;
}

export interface SalesProcess {
  id: number;
  name: string;
  stage: string;
}

// API Response types
export interface HotelResponse {
  total: number;          // Total number of hotels
  totalPages: number;     // Total number of pages
  currentPage: number;    // Current page number
  hotels: Array<{
    id: number;
    name: string;
    location: string;
    sub_location: string | null;
    description: string | null;
    address: string | null;
    google_review_score: number | null;
    google_number_of_reviews: number | null;
    hotel_website: string | null;
    market: string | null;
    sales_process_id: number | null;
    segment_id: number | null;
    segment: {
      id: number;
      name: string;
    } | null;
    salesProcess: {
      id: number;
      name: string;
      stage: number | null;
    } | null;
  }>;
}

// Other types as needed... 