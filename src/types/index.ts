// Common Types
export type Status = 'active' | 'pending' | 'cancelled' | 'completed';
export type Segment = 'luxury' | 'business' | 'budget' | 'resort';
export type SalesStage = 'prospect' | 'negotiation' | 'active' | 'inactive';
export type ContractStatus = 'active' | 'expired' | 'terminated' | 'renewed';
export type DistributionChannel = 'direct' | 'gds' | 'ota' | 'wholesale' | 'metasearch';
export type TransactionType = 'invoice' | 'purchase' | 'payment_received' | 'payment_sent';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'check' | 'other';
export type UserRole = 'admin' | 'manager' | 'agent' | 'finance' | 'support';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type EntityType = 'booking' | 'guest' | 'hotel' | 'contact';

// Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    job_title: string;
    role: string;
    contact_id: number | null;
    points: number;
    title: string | null;
    is_approved: boolean;
    room_type_preferences: string | null;
  };
}

// Entity Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  avatar?: string;
  lastActive?: string;
  createdAt: string;
  permissions: string[];
}

export interface Transaction {
  id: string;
  hotelId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  dueDate?: string;
  description: string;
  referenceNumber?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface HotelBalance {
  hotelId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  pendingInvoices: number;
  pendingPayments: number;
}

export interface Contract {
  id: string;
  hotelId: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  type: string;
  terms: string;
  commissionRate: number;
  signedBy?: string;
  terminationReason?: string;
  previousContractId?: string;
}

export interface Distribution {
  id: string;
  hotelId: string;
  channel: DistributionChannel;
  status: 'active' | 'inactive';
  connectionType: 'direct' | 'channel-manager';
  mappingStatus: 'pending' | 'completed' | 'failed';
  lastSync?: string;
  credentials?: {
    username: string;
    propertyId: string;
    chainCode?: string;
  };
  settings?: {
    rateTypes: string[];
    roomTypes: string[];
    restrictions: string[];
  };
}

export interface Booking {
  id: string;
  guestId: string;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  status: Status;
  roomType: string;
  specialRequests?: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingsCount: number;
  lastStayDate?: string;
  preferences?: string[];
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  sub_location: string | null;
  address: string | null;
  description: string | null;
  google_review_score: number | null;
  google_number_of_reviews: number | null;
  market: string | null;
  hotel_website: string | null;
  segment_id: number | null;
  sales_process_id: number;
  segment: {
    id: number;
    name: string;
  } | null;
  sales_process: {
    id: number;
    name: string;
    description: string | null;
    stage: string | null;
  } | null;
}

export interface Activity {
  id: string;
  hotelId: string;
  userId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  summary: string;
  details?: string;
  contactId?: string;
  createdAt: string;
  nextFollowUp?: string;
}

export interface Task {
  id: string;
  hotelId: string;
  createdBy: string;
  assignedTo: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  type: 'follow-up' | 'proposal' | 'contract' | 'integration' | 'other';
}

export interface Campaign {
  id: string;
  hotelId: string;
  stage: 'planning' | 'outreach' | 'negotiation' | 'closing' | 'completed';
  startDate: string;
  targetDate?: string;
  notes?: string;
  status: 'active' | 'paused' | 'completed';
  steps: CampaignStep[];
}

export interface CampaignStep {
  id: string;
  type: 'segment' | 'information' | 'contacts' | 'outreach' | 'proposal' | 'negotiation';
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  notes?: string;
  completedBy?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  hotelId: string;
  email: string;
  phone: string;
  lastInteraction: string;
  employmentHistory?: Employment[];
}

export interface Employment {
  hotelName: string;
  role: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  entities: {
    bookings: string[];
    guests: string[];
    hotels: string[];
    contacts: string[];
  };
  entityType?: EntityType;
  entityId?: string;
  summary: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface TicketFilters {
  limit?: number;
  search?: string;
  status?: Ticket['status'] | '';
  priority?: Ticket['priority'] | '';
  entityType?: EntityType | '';
  entityId?: string;
}

export interface UserFilters {
  limit?: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  department?: string;
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum SortField {
  NAME = 'name',
  LOCATION = 'location',
  REVIEWS = 'google_number_of_reviews',
  RATING = 'google_review_score',
  SEGMENT = 'segment',
  SALES_STAGE = 'sales_process'
}

export interface HotelFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  segment?: string;
  salesStage?: string;
  sortBy?: 'name' | 'location' | 'google_number_of_reviews' | 'google_review_score' | 'sales_process';
  sortDirection?: 'ASC' | 'DESC';
}