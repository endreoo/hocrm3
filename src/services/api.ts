import axios from 'axios';
import type { 
  User, Hotel, Booking, Guest, Contact, Ticket, Transaction, 
  HotelBalance, PaginatedResponse, AuthResponse, UserFilters, TicketFilters, HotelFilters,
  Status, EntityType, TransactionType, Location, Segment, SalesProcess,
  CreateUserInput,
  UpdateUserInput
} from '../types';

// Configuration
const IS_DEV = false; // Disable mock data to use real API
const BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://37.27.142.148:3000';
const DEFAULT_EMAIL = import.meta.env.VITE_CRM_EMAIL || 'testadmin2@example.com';
const DEFAULT_PASSWORD = import.meta.env.VITE_CRM_PASSWORD || 'test1234';

// Initialize axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Setting auth header:', config.headers['Authorization']);
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.log('Unauthorized request - clearing token');
        localStorage.removeItem('access_token');
        delete api.defaults.headers.common['Authorization'];
      }
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers
      });
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: async (data: Partial<User>): Promise<AuthResponse> => {
    try {
      console.log('=== Register Debug Logs ===');
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('Token set successfully after registration');
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('=== Login Debug Logs ===');
      console.log('Login attempt:', { email });

      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password
      });

      console.log('Login response:', {
        status: response.status,
        hasToken: !!response.data.token
      });

      if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('Token set successfully');
        return response.data;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('=== Login Error ===');
      if (axios.isAxiosError(error)) {
        console.error('Login error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },

  approveUser: async (id: number): Promise<void> => {
    await api.post(`/auth/approve/${id}`);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token cleared from localStorage and headers');
  },
};

// Hotel service (Real API)
export const hotelService = {
  getHotels: async (filters?: HotelFilters) => {
    console.log('=== Get Hotels Debug Logs ===');
    console.log('Request filters:', filters);
    try {
      const response = await api.get<HotelResponse>('/hotels', { params: filters });
      
      // Map API response to CRM expected structure
      const mappedResponse: PaginatedResponse<Hotel> = {
        data: response.data.hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          location: hotel.location,
          segment: hotel.segment || { id: 0, name: '' },
          sales_process: hotel.salesProcess ? {
            id: hotel.salesProcess.id,
            name: hotel.salesProcess.name,
            stage: String(hotel.salesProcess.stage || '')
          } : { id: 0, name: '', stage: '' },
          status: 'active',
          google_review_score: hotel.google_review_score || 0,
          google_number_of_reviews: hotel.google_number_of_reviews || 0,
          created_at: '',
          updated_at: ''
        })),
        meta: {
          total: response.data.total,
          page: response.data.currentPage,
          limit: filters?.limit || 20,
          totalPages: response.data.totalPages
        }
      };

      console.log('Hotels response:', {
        status: response.status,
        totalHotels: mappedResponse.meta.total,
        pageSize: mappedResponse.meta.limit,
        currentPage: mappedResponse.meta.page,
        hotelCount: mappedResponse.data.length,
        firstHotel: mappedResponse.data[0]
      });
      
      return mappedResponse;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
      }
      throw error;
    }
  },
  getHotel: (id: number) => api.get<Hotel>(`/hotels/${id}`).then(res => res.data),
  createHotel: (data: Partial<Hotel>) => api.post<Hotel>('/hotels', data).then(res => res.data),
  updateHotel: (id: number, data: Partial<Hotel>) => api.put<Hotel>(`/hotels/${id}`, data).then(res => res.data),
  deleteHotel: (id: number) => api.delete(`/hotels/${id}`).then(res => res.data),
  getLocations: () => api.get<Location[]>('/hotels/locations').then(res => res.data),
  getSegments: () => api.get<Segment[]>('/hotels/segments').then(res => res.data),
  getSalesProcesses: () => api.get<SalesProcess[]>('/hotels/sales-processes').then(res => res.data)
};

export interface BookingFilters extends Partial<Booking> {
  limit?: number;
  guestName?: string;
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
}

// Mock data for development (excluding hotels)
const MOCK_DATA = {
  bookings: Array.from({ length: 10 }, (_, i) => ({
    id: `b${i + 1}`,
    hotelId: 'h1',
    guestId: 'g1',
    checkIn: new Date(2024, 2, i + 1).toISOString(),
    checkOut: new Date(2024, 2, i + 3).toISOString(),
    status: 'confirmed' as Status,
    paymentStatus: 'paid' as 'pending' | 'paid' | 'partial',
    roomType: 'standard',
    totalAmount: 299.99,
    createdAt: new Date().toISOString()
  })),
  guests: Array.from({ length: 10 }, (_, i) => ({
    id: `g${i + 1}`,
    name: `Guest ${i + 1}`,
    email: `guest${i + 1}@example.com`,
    phone: '+1234567890',
    bookingsCount: Math.floor(Math.random() * 5),
    lastBooking: new Date(2024, 1, 1).toISOString(),
    createdAt: new Date().toISOString()
  })),
  contacts: Array.from({ length: 10 }, (_, i) => ({
    id: `c${i + 1}`,
    hotelId: 'h1',
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@hotel.com`,
    phone: '+1234567890',
    role: 'manager',
    lastInteraction: new Date(2024, 2, 1).toISOString(),
    createdAt: new Date().toISOString()
  })),
  tickets: Array.from({ length: 10 }, (_, i) => ({
    id: `t${i + 1}`,
    title: `Issue ${i + 1}`,
    description: 'Sample ticket description',
    summary: 'Sample ticket summary',
    status: 'open' as 'open' | 'in-progress' | 'resolved',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigneeId: 'u1',
    createdBy: 'u1',
    entityType: 'hotel' as EntityType,
    entityId: 'h1',
    entities: {
      hotels: [],
      contacts: [],
      bookings: [],
      guests: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })),
  transactions: Array.from({ length: 10 }, (_, i) => ({
    id: `tr${i + 1}`,
    hotelId: 'h1',
    bookingId: `b${i + 1}`,
    amount: 299.99,
    currency: 'USD',
    type: 'payment' as TransactionType,
    status: 'completed' as 'pending' | 'cancelled' | 'completed',
    description: 'Room payment',
    date: new Date(2024, 2, i + 1).toISOString(),
    createdAt: new Date().toISOString()
  })),
  hotelBalances: Array.from({ length: 5 }, (_, i) => ({
    id: `hb${i + 1}`,
    hotelId: `h${i + 1}`,
    balance: Math.random() * 10000,
    currency: 'USD',
    pendingAmount: Math.random() * 1000,
    pendingInvoices: Math.floor(Math.random() * 5),
    pendingPayments: Math.floor(Math.random() * 3),
    lastPaymentDate: new Date(2024, 2, 1).toISOString(),
    lastUpdated: new Date().toISOString()
  }))
};

// Mock user for development
const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  job_title: 'Administrator',
  role: 'admin',
  contact_id: null,
  points: 0,
  title: null,
  is_approved: true,
  room_type_preferences: null
};

// Booking service (Mock)
export const bookingService = {
  getBookings: async (page = 1, filters?: BookingFilters): Promise<PaginatedResponse<Booking>> => {
    return {
      data: MOCK_DATA.bookings,
      meta: {
        total: MOCK_DATA.bookings.length,
        page: page,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(MOCK_DATA.bookings.length / (filters?.limit || 10))
      }
    };
  },
  getBooking: async (id: string): Promise<Booking> => {
    const booking = MOCK_DATA.bookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }
};

export interface GuestFilters {
  limit?: number;
  search?: string;
  name?: string;
  email?: string;
  minBookings?: string;
}

// Guest service (Mock)
export const guestService = {
  getGuests: async (page = 1, filters?: GuestFilters): Promise<PaginatedResponse<Guest>> => {
    return {
      data: MOCK_DATA.guests,
      meta: {
        total: MOCK_DATA.guests.length,
        page: page,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(MOCK_DATA.guests.length / (filters?.limit || 10))
      }
    };
  },
  getGuest: async (id: string): Promise<Guest> => {
    const guest = MOCK_DATA.guests.find(g => g.id === id);
    if (!guest) throw new Error('Guest not found');
    return guest;
  }
};

export interface ContactFilters extends Partial<Contact> {
  limit?: number;
  hotelName?: string;
  lastInteractionFrom?: string;
  lastInteractionTo?: string;
}

// Contact service (Mock)
export const contactService = {
  getContacts: async (page = 1, filters?: ContactFilters): Promise<PaginatedResponse<Contact>> => {
    return {
      data: MOCK_DATA.contacts,
      meta: {
        total: MOCK_DATA.contacts.length,
        page: page,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(MOCK_DATA.contacts.length / (filters?.limit || 10))
      }
    };
  },
  getContact: async (id: string): Promise<Contact> => {
    const contact = MOCK_DATA.contacts.find(c => c.id === id);
    if (!contact) throw new Error('Contact not found');
    return contact;
  }
};

// Ticket service (Mock)
export const ticketService = {
  getTickets: async (page = 1, filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> => {
    return {
      data: MOCK_DATA.tickets,
      meta: {
        total: MOCK_DATA.tickets.length,
        page: page,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(MOCK_DATA.tickets.length / (filters?.limit || 10))
      }
    };
  },
  getTicket: async (id: string): Promise<Ticket> => {
    const ticket = MOCK_DATA.tickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }
};

export interface TransactionFilters extends Partial<Transaction> {
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Finance service (Mock)
export const financeService = {
  getTransactions: async (page = 1, filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    return {
      data: MOCK_DATA.transactions,
      meta: {
        total: MOCK_DATA.transactions.length,
        page: page,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(MOCK_DATA.transactions.length / (filters?.limit || 10))
      }
    };
  },
  getHotelBalances: async (page = 1): Promise<PaginatedResponse<HotelBalance>> => {
    return {
      data: MOCK_DATA.hotelBalances,
      meta: {
        total: MOCK_DATA.hotelBalances.length,
        page: page,
        limit: 10,
        totalPages: Math.ceil(MOCK_DATA.hotelBalances.length / 10)
      }
    };
  }
};

// User service (Real API)
export const userService = {
  getUsers: (filters?: UserFilters) => 
    api.get<PaginatedResponse<User>>('/users', { params: filters }).then(res => res.data),
  
  getUser: (id: number) => 
    api.get<User>(`/users/${id}`).then(res => res.data),
  
  updateUser: (id: number, data: UpdateUserInput) => 
    api.put<User>(`/users/${id}`, data).then(res => res.data),
  
  createUser: (data: CreateUserInput) => 
    api.post<User>('/users', data).then(res => res.data),
  
  approveUser: (id: number) => 
    api.post<void>(`/users/${id}/approve`).then(res => res.data),
  
  resetPassword: (id: number) => 
    api.post<void>(`/users/${id}/reset-password`).then(res => res.data),
  
  getCurrentUser: () => 
    api.get<User>('/users/me').then(res => res.data),
};

// Export all services
export const apiService = {
  auth,
  hotelService,
  bookingService,
  guestService,
  contactService,
  ticketService,
  financeService,
  userService,
};