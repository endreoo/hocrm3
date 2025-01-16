import axios from 'axios';
import type { 
  User, Hotel, Booking, Guest, Contact, Ticket, Transaction, 
  HotelBalance, PaginatedResponse, AuthResponse, UserFilters, TicketFilters, HotelFilters,
  Status, EntityType, TransactionType
} from '../types';

const IS_DEV = true; // Set to true to use mock data for all services except hotels
const BASE_URL = 'https://apiservice.hotelonline.co/api';

// Production credentials for hotels API
const PROD_CREDENTIALS = {
  email: 'admin@hotelonline.co',
  password: 'admin123'
};

// Initialize hotels API auth
const initHotelsAuth = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, PROD_CREDENTIALS);
    if (response.data?.access_token) {
      localStorage.setItem('hotels_access_token', response.data.access_token);
    }
  } catch (error) {
    console.error('Failed to initialize hotels API auth:', error);
  }
};

// Call initHotelsAuth when module loads
initHotelsAuth();

// Mock user data for development
const MOCK_USER: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  department: 'Management',
  permissions: [
    'view:dashboard',
    'view:hotels',
    'view:bookings',
    'view:guests',
    'view:contacts',
    'view:tickets',
    'view:finance',
    'manage:users'
  ],
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString()
};

// Mock data for development
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

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set token if it exists in localStorage
const token = localStorage.getItem('access_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Use hotels token for hotels API, regular token for other endpoints
    const token = config.url?.includes('/hotels') 
      ? localStorage.getItem('hotels_access_token')
      : localStorage.getItem('access_token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Always use production credentials for hotels API
      if (email === 'admin@hotelonline.co' && password === 'admin123') {
        const response = await api.post<AuthResponse>('/auth/login', {
          email,
          password
        });
        console.log('Login response:', response.data);
        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          // Set the token in axios headers immediately
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          return response.data;
        }
        throw new Error('No access token received');
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('access_token');
    // Remove token from axios headers
    delete api.defaults.headers.common['Authorization'];
  },
};

// Hotel service
export const hotelService = {
  getHotels: async (page = 1, filters?: HotelFilters): Promise<PaginatedResponse<Hotel>> => {
    // Always use real API for hotels
    const response = await api.get<PaginatedResponse<Hotel>>('/hotels', { 
      params: { 
        page, 
        ...filters,
        limit: filters?.limit || 20
      } 
    });
    return response.data;
  },
  
  getLocations: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/hotels/locations');
    return response.data;
  },

  getSegments: async (): Promise<string[]> => {
    // Always use real API for segments
    const response = await api.get<string[]>('/hotels/segments');
    return response.data;
  },

  getSalesProcesses: async (): Promise<string[]> => {
    // Always use real API for sales processes
    interface SalesProcess {
      id: number;
      name: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    }
    const response = await api.get<SalesProcess[]>('/hotels/sales-processes');
    return response.data
      .sort((a, b) => a.id - b.id)
      .map(process => process.name);
  },
};

export interface BookingFilters extends Partial<Booking> {
  limit?: number;
  guestName?: string;
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
}

// Booking service
export const bookingService = {
  getBookings: async (page = 1, filters?: BookingFilters): Promise<PaginatedResponse<Booking>> => {
    if (IS_DEV) {
      return {
        data: MOCK_DATA.bookings,
        total: MOCK_DATA.bookings.length,
        pages: Math.ceil(MOCK_DATA.bookings.length / (filters?.limit || 10))
      };
    }
    const response = await api.get<PaginatedResponse<Booking>>('/bookings', { params: { page, ...filters } });
    return response.data;
  },
};

export interface GuestFilters {
  limit?: number;
  search?: string;
  name?: string;
  email?: string;
  minBookings?: string;
}

// Guest service
export const guestService = {
  getGuests: async (page = 1, filters?: GuestFilters): Promise<PaginatedResponse<Guest>> => {
    if (IS_DEV) {
      return {
        data: MOCK_DATA.guests,
        total: MOCK_DATA.guests.length,
        pages: Math.ceil(MOCK_DATA.guests.length / (filters?.limit || 10))
      };
    }
    const response = await api.get<PaginatedResponse<Guest>>('/guests', { params: { page, ...filters } });
    return response.data;
  },
  getGuest: async (id: string): Promise<Guest> => {
    if (IS_DEV) {
      const guest = MOCK_DATA.guests.find(g => g.id === id);
      if (!guest) throw new Error('Guest not found');
      return guest;
    }
    const response = await api.get<Guest>(`/guests/${id}`);
    return response.data;
  },
};

export interface ContactFilters extends Partial<Contact> {
  limit?: number;
  hotelName?: string;
  lastInteractionFrom?: string;
  lastInteractionTo?: string;
}

// Contact service
export const contactService = {
  getContacts: async (page = 1, filters?: ContactFilters): Promise<PaginatedResponse<Contact>> => {
    if (IS_DEV) {
      return {
        data: MOCK_DATA.contacts,
        total: MOCK_DATA.contacts.length,
        pages: Math.ceil(MOCK_DATA.contacts.length / (filters?.limit || 10))
      };
    }
    const response = await api.get<PaginatedResponse<Contact>>('/contacts', { params: { page, ...filters } });
    return response.data;
  },
};

// Ticket service
export const ticketService = {
  getTickets: async (page = 1, filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> => {
    if (IS_DEV) {
      return {
        data: MOCK_DATA.tickets,
        total: MOCK_DATA.tickets.length,
        pages: Math.ceil(MOCK_DATA.tickets.length / (filters?.limit || 10))
      };
    }
    const response = await api.get<PaginatedResponse<Ticket>>('/tickets', { params: { page, ...filters } });
    return response.data;
  },
};

export interface TransactionFilters extends Partial<Transaction> {
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Finance service
export const financeService = {
  getTransactions: async (page = 1, filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    if (IS_DEV) {
      return {
        data: MOCK_DATA.transactions,
        total: MOCK_DATA.transactions.length,
        pages: Math.ceil(MOCK_DATA.transactions.length / (filters?.limit || 10))
      };
    }
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', { params: { page, ...filters } });
    return response.data;
  },
  getHotelBalances: async (page = 1): Promise<PaginatedResponse<HotelBalance>> => {
    if (IS_DEV) {
      return {
        data: MOCK_DATA.hotelBalances,
        total: MOCK_DATA.hotelBalances.length,
        pages: Math.ceil(MOCK_DATA.hotelBalances.length / 10)
      };
    }
    const response = await api.get<PaginatedResponse<HotelBalance>>('/hotel-balances', { params: { page } });
    return response.data;
  },
};

// User service
export const userService = {
  getUsers: async (_page = 1, _filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    // Always use mock data for users
    return {
      data: [MOCK_USER],
      total: 1,
      pages: 1
    };
  },
  getCurrentUser: async (): Promise<User> => {
    // Always return mock user
    console.log('Using mock user data');
    return MOCK_USER;
  },
};

// Add the interface for segment response
interface ApiSegment {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

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