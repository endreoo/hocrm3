import axios from 'axios';
import type { Segment, SalesStage } from '../types';

const API_URL = 'https://apiservice.hotelonline.co';

const segments: Segment[] = ['luxury', 'business', 'budget', 'resort'];
const salesStages: SalesStage[] = ['prospect', 'negotiation', 'active', 'inactive'];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for token handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  token: string;
  // Add other response fields if needed
}

export interface HotelsResponse {
  data: Hotel[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const hotelService = {
  async getHotels(page = 1, filters?: {
    location?: string;
    segment?: string;
    salesStage?: string;
    limit?: number;
  }): Promise<HotelsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (filters?.limit || 20).toString(),
        ...(filters?.location && { location: filters.location }),
        ...(filters?.segment && { segment: filters.segment }),
        ...(filters?.salesStage && { salesStage: filters.salesStage })
      });

      const response = await api.get<HotelsResponse>(`/api/hotels?${params}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Check for network errors
        if (!error.response) {
          console.error('Network Error: Unable to connect to the API server');
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }

        // Log specific error details
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Throw appropriate error message
        if (error.response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        } else if (error.response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else {
          throw new Error('An error occurred while fetching hotels. Please try again later.');
        }
      }
      throw error;
    }
  },
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return { token: response.data.token };
    }
    
    throw new Error('Login failed');
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export const bookingService = {
  async getBookings(page = 1, filters?: {
    status?: string;
    guestName?: string;
    hotelId?: string;
    checkInFrom?: string;
    checkInTo?: string;
    checkOutFrom?: string;
    checkOutTo?: string;
  }): Promise<BookingsResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          id: '1',
          guestId: 'G001',
          hotelId: '1',
          checkIn: '2024-03-15',
          checkOut: '2024-03-20',
          status: 'active',
          roomType: 'Deluxe Suite',
          specialRequests: 'Late check-out requested',
          paymentStatus: 'paid'
        },
        {
          id: '2',
          guestId: 'G002',
          hotelId: '1',
          checkIn: '2024-03-18',
          checkOut: '2024-03-22',
          status: 'pending',
          roomType: 'Standard Room',
          paymentStatus: 'pending'
        },
        {
          id: '3',
          guestId: 'G003',
          hotelId: '2',
          checkIn: '2024-03-10',
          checkOut: '2024-03-15',
          status: 'completed',
          roomType: 'Executive Suite',
          paymentStatus: 'paid'
        },
        {
          id: '4',
          guestId: 'G004',
          hotelId: '3',
          checkIn: '2024-03-20',
          checkOut: '2024-03-25',
          status: 'cancelled',
          roomType: 'Ocean View Room',
          specialRequests: 'Refund requested',
          paymentStatus: 'partial'
        }
      ],
      meta: {
        current_page: page,
        last_page: 2,
        per_page: 10,
        total: 12
      }
    };
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  },
};

export interface GuestsResponse {
  data: Guest[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const guestService = {
  async getGuests(page = 1, filters?: {
    name?: string;
    email?: string;
    minBookings?: string;
  }): Promise<GuestsResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          id: 'G001',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          bookingsCount: 3,
          lastStayDate: '2024-02-15',
          preferences: ['High Floor', 'Non-Smoking', 'Early Check-in']
        },
        {
          id: 'G002',
          name: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          phone: '+1 (555) 234-5678',
          bookingsCount: 1,
          preferences: ['Quiet Room', 'Extra Pillows']
        },
        {
          id: 'G003',
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          phone: '+1 (555) 345-6789',
          bookingsCount: 5,
          lastStayDate: '2024-01-20',
          preferences: ['Late Check-out', 'Airport Transfer']
        },
        {
          id: 'G004',
          name: 'Sarah Davis',
          email: 'sarah.davis@email.com',
          phone: '+1 (555) 456-7890',
          bookingsCount: 2,
          lastStayDate: '2024-02-28',
          preferences: ['Room Service', 'City View']
        }
      ],
      meta: {
        current_page: page,
        last_page: 2,
        per_page: 10,
        total: 12
      }
    };
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  },

  async getGuest(id: string): Promise<Guest> {
    // Mock data for testing
    const mockGuests: Record<string, Guest> = {
      'G001': {
        id: 'G001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        bookingsCount: 3,
        lastStayDate: '2024-02-15',
        preferences: ['High Floor', 'Non-Smoking', 'Early Check-in']
      },
      'G002': {
        id: 'G002',
        name: 'Emma Wilson',
        email: 'emma.wilson@email.com',
        phone: '+1 (555) 234-5678',
        bookingsCount: 1,
        preferences: ['Quiet Room', 'Extra Pillows']
      },
      'G003': {
        id: 'G003',
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1 (555) 345-6789',
        bookingsCount: 5,
        lastStayDate: '2024-01-20',
        preferences: ['Late Check-out', 'Airport Transfer']
      },
      'G004': {
        id: 'G004',
        name: 'Sarah Davis',
        email: 'sarah.davis@email.com',
        phone: '+1 (555) 456-7890',
        bookingsCount: 2,
        lastStayDate: '2024-02-28',
        preferences: ['Room Service', 'City View']
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const guest = mockGuests[id];
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }
};

export interface ContactsResponse {
  data: Contact[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const contactService = {
  async getContacts(page = 1, filters?: {
    name?: string;
    role?: string;
    hotelId?: string;
  }): Promise<ContactsResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          id: 'C001',
          name: 'Robert Johnson',
          role: 'General Manager',
          hotelId: '1',
          email: 'robert.johnson@grandhotel.com',
          phone: '+1 (555) 123-4567',
          lastInteraction: '2024-03-10',
          employmentHistory: [
            {
              hotelName: 'Grand Hotel',
              role: 'General Manager',
              startDate: '2023-01-15',
              notes: 'Led the complete renovation of the property'
            },
            {
              hotelName: 'Seaside Resort',
              role: 'Operations Manager',
              startDate: '2020-03-01',
              endDate: '2022-12-31',
              notes: 'Improved operational efficiency by 25%'
            },
            {
              hotelName: 'City Lodge',
              role: 'Front Office Manager',
              startDate: '2018-06-15',
              endDate: '2020-02-28'
            }
          ]
        },
        {
          id: 'C002',
          name: 'Maria Garcia',
          role: 'Sales Director',
          hotelId: '2',
          email: 'maria.garcia@businessinn.com',
          phone: '+1 (555) 234-5678',
          lastInteraction: '2024-03-12',
          employmentHistory: [
            {
              hotelName: 'Business Inn',
              role: 'Sales Director',
              startDate: '2022-04-01',
              notes: 'Exceeded revenue targets by 30% in first year'
            },
            {
              hotelName: 'Mountain View Hotel',
              role: 'Sales Manager',
              startDate: '2019-08-15',
              endDate: '2022-03-31'
            }
          ]
        },
        {
          id: 'C003',
          name: 'David Chen',
          role: 'Executive Chef',
          hotelId: '3',
          email: 'david.chen@seasideresort.com',
          phone: '+1 (555) 345-6789',
          lastInteraction: '2024-03-08',
          employmentHistory: [
            {
              hotelName: 'Seaside Resort',
              role: 'Executive Chef',
              startDate: '2021-06-01',
              notes: 'Launched award-winning farm-to-table program'
            },
            {
              hotelName: 'Grand Hotel',
              role: 'Sous Chef',
              startDate: '2018-03-15',
              endDate: '2021-05-31'
            }
          ]
        }
      ],
      meta: {
        current_page: page,
        last_page: 2,
        per_page: 10,
        total: 12
      }
    };
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  }
};

export interface TicketsResponse {
  data: Ticket[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const ticketService = {
  async getTickets(page = 1, filters?: {
    status?: string;
    priority?: string;
    entityType?: string;
    search?: string;
  }): Promise<TicketsResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          id: 'T001',
          entities: {
            bookings: ['1'],
            guests: [],
            hotels: [],
            contacts: []
          },
          summary: 'Booking modification request',
          status: 'open',
          priority: 'high',
          createdAt: '2024-03-15T10:00:00Z'
        },
        {
          id: 'T002',
          entities: {
            bookings: [],
            guests: ['G001'],
            hotels: [],
            contacts: []
          },
          summary: 'Special accommodation request',
          status: 'in-progress',
          priority: 'medium',
          createdAt: '2024-03-14T15:30:00Z'
        },
        {
          id: 'T003',
          entities: {
            bookings: [],
            guests: [],
            hotels: ['2'],
            contacts: []
          },
          summary: 'Rate plan update needed',
          status: 'resolved',
          priority: 'low',
          createdAt: '2024-03-13T09:15:00Z'
        },
        {
          id: 'T004',
          entities: {
            bookings: [],
            guests: [],
            hotels: [],
            contacts: ['C001']
          },
          summary: 'New contact information update',
          status: 'open',
          priority: 'medium',
          createdAt: '2024-03-12T16:45:00Z'
        }
      ],
      meta: {
        current_page: page,
        last_page: 2,
        per_page: 10,
        total: 12
      }
    };
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  }
};

export interface TransactionsResponse {
  data: Transaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface HotelBalancesResponse {
  data: HotelBalance[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const financeService = {
  async getTransactions(page = 1, filters?: {
    hotelId?: string;
    type?: TransactionType;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<TransactionsResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          id: 'T001',
          hotelId: '1',
          type: 'invoice',
          amount: 5000.00,
          currency: 'USD',
          status: 'completed',
          date: '2024-03-01',
          dueDate: '2024-03-31',
          description: 'Commission for February bookings',
          referenceNumber: 'INV-2024-001',
          paymentMethod: 'bank_transfer',
          notes: 'Regular monthly commission'
        },
        {
          id: 'T002',
          hotelId: '2',
          type: 'purchase',
          amount: 3500.00,
          currency: 'USD',
          status: 'pending',
          date: '2024-03-05',
          description: 'Bulk room purchase - Summer promotion',
          referenceNumber: 'PO-2024-002'
        },
        {
          id: 'T003',
          hotelId: '1',
          type: 'payment_received',
          amount: 5000.00,
          currency: 'USD',
          status: 'completed',
          date: '2024-03-10',
          description: 'Payment for INV-2024-001',
          referenceNumber: 'PAY-2024-001',
          paymentMethod: 'bank_transfer'
        }
      ],
      meta: {
        current_page: page,
        last_page: 2,
        per_page: 10,
        total: 25
      }
    };
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  },

  async getHotelBalances(page = 1): Promise<HotelBalancesResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          hotelId: '1',
          balance: 2500.00,
          currency: 'USD',
          lastUpdated: '2024-03-15T12:00:00Z',
          pendingInvoices: 1,
          pendingPayments: 0
        },
        {
          hotelId: '2',
          balance: -1500.00,
          currency: 'USD',
          lastUpdated: '2024-03-15T12:00:00Z',
          pendingInvoices: 0,
          pendingPayments: 1
        },
        {
          hotelId: '3',
          balance: 0.00,
          currency: 'USD',
          lastUpdated: '2024-03-15T12:00:00Z',
          pendingInvoices: 0,
          pendingPayments: 0
        }
      ],
      meta: {
        current_page: page,
        last_page: 1,
        per_page: 10,
        total: 3
      }
    };
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  }
};

export interface UsersResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    // Mock current user data for testing
    const defaultAdminUser = {
      id: 'U001',
      name: 'Admin User',
      email: 'admin@hotelonline.co',
      role: 'admin',
      status: 'active',
      department: 'Management',
      lastActive: new Date().toISOString(),
      createdAt: '2023-01-01T00:00:00Z',
      permissions: [
        'view:dashboard',
        'view:hotels',
        'edit:hotels',
        'view:contacts',
        'edit:contacts',
        'view:bookings',
        'edit:bookings',
        'view:guests',
        'edit:guests',
        'view:finance',
        'edit:finance',
        'view:tickets',
        'edit:tickets',
        'manage:users'
      ]
    };
    await new Promise(resolve => setTimeout(resolve, 300));
    return defaultAdminUser;
  },

  async getUsers(page = 1, filters?: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }): Promise<UsersResponse> {
    // Mock data for testing
    const mockData = {
      data: [
        {
          id: 'U001',
          name: 'John Admin',
          email: 'john.admin@hotelonline.co',
          role: 'admin',
          status: 'active',
          department: 'Management',
          lastActive: '2024-03-15T14:30:00Z',
          createdAt: '2023-01-01T00:00:00Z',
          permissions: ['all']
        },
        {
          id: 'U002',
          name: 'Sarah Manager',
          email: 'sarah.manager@hotelonline.co',
          role: 'manager',
          status: 'active',
          department: 'Sales',
          lastActive: '2024-03-15T13:45:00Z',
          createdAt: '2023-02-15T00:00:00Z',
          permissions: ['read:all', 'write:sales', 'manage:team']
        },
        {
          id: 'U003',
          name: 'Mike Support',
          email: 'mike.support@hotelonline.co',
          role: 'support',
          status: 'active',
          department: 'Customer Support',
          lastActive: '2024-03-15T14:15:00Z',
          createdAt: '2023-03-01T00:00:00Z',
          permissions: ['read:tickets', 'write:tickets', 'read:bookings']
        }
      ],
      meta: {
        current_page: page,
        last_page: 1,
        per_page: 10,
        total: 3
      }
    };
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  },

  async getUser(id: string): Promise<User> {
    // Mock data for testing
    const mockUsers: Record<string, User> = {
      'U001': {
        id: 'U001',
        name: 'John Admin',
        email: 'john.admin@hotelonline.co',
        role: 'admin',
        status: 'active',
        department: 'Management',
        lastActive: '2024-03-15T14:30:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        permissions: ['all']
      }
    };

    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers[id];
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
};

export default api;