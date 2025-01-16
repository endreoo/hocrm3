import { useQuery } from '@tanstack/react-query';
import { 
  Building2, Users, BookOpen, DollarSign, 
  TrendingUp, Star, Clock, Calendar,
  CheckCircle2, AlertTriangle, Contact2
} from 'lucide-react';
import { hotelService, bookingService, guestService, financeService } from '../../services/api';

export default function Dashboard() {
  // Fetch data from all services
  const { data: hotelsData } = useQuery({
    queryKey: ['hotels-dashboard'],
    queryFn: () => hotelService.getHotels(1),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings-dashboard'],
    queryFn: () => bookingService.getBookings(1),
  });

  const { data: guestsData } = useQuery({
    queryKey: ['guests-dashboard'],
    queryFn: () => guestService.getGuests(1),
  });

  const { data: hotelBalances } = useQuery({
    queryKey: ['hotel-balances-dashboard'],
    queryFn: () => financeService.getHotelBalances(1),
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Total Hotels: <span className="font-medium">{hotelsData?.total || 0}</span>
              </span>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-green-500">+12%</span>
            <span className="ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-semibold text-gray-900"> 
                {bookingsData?.data?.filter(b => b.status === 'active')?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated just now</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Total Guests: <span className="font-medium">{guestsData?.total || 0}</span>
              </span>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-green-500">+8%</span>
            <span className="ml-1">new guests this week</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900"> 
                ${hotelBalances?.data?.reduce((acc, curr) => acc + curr.balance, 0)?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-green-500">+15%</span>
            <span className="ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  {
                    id: 1,
                    type: 'booking',
                    content: 'New booking at Grand Hotel',
                    timestamp: '30 minutes ago',
                    icon: BookOpen,
                    iconBackground: 'bg-green-500'
                  },
                  {
                    id: 2,
                    type: 'guest',
                    content: 'New guest registration',
                    timestamp: '2 hours ago',
                    icon: Users,
                    iconBackground: 'bg-blue-500'
                  },
                  {
                    id: 3,
                    type: 'hotel',
                    content: 'Hotel status updated',
                    timestamp: '4 hours ago',
                    icon: Building2,
                    iconBackground: 'bg-indigo-500'
                  }
                ].map((item, itemIdx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {itemIdx !== 2 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`${item.iconBackground} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}
                          >
                            <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{item.content}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{item.timestamp}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Upcoming Check-ins */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Today's Overview</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                    Upcoming Check-ins
                  </dt>
                  <dd className="mt-1 flex justify-between items-baseline">
                    <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                      12
                      <span className="ml-2 text-sm font-medium text-gray-500">bookings</span>
                    </div>
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Completed Check-ins
                  </dt>
                  <dd className="mt-1 flex justify-between items-baseline">
                    <div className="flex items-baseline text-2xl font-semibold text-green-600">
                      8
                      <span className="ml-2 text-sm font-medium text-gray-500">of 12</span>
                    </div>
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                    Pending Issues
                  </dt>
                  <dd className="mt-1 flex justify-between items-baseline">
                    <div className="flex items-baseline text-2xl font-semibold text-yellow-600">
                      3
                      <span className="ml-2 text-sm font-medium text-gray-500">tickets</span>
                    </div>
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Contact2 className="h-4 w-4 mr-2 text-blue-500" />
                    Active Contacts
                  </dt>
                  <dd className="mt-1 flex justify-between items-baseline">
                    <div className="flex items-baseline text-2xl font-semibold text-blue-600">
                      24
                      <span className="ml-2 text-sm font-medium text-gray-500">contacts</span>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Top Performing Hotels */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Performing Hotels</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(hotelsData?.data || []).slice(0, 3).map((hotel) => (
                  <div key={hotel.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{hotel.name}</p>
                        <p className="text-sm text-gray-500">{hotel.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{hotel.rating}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        hotel.salesStage === 'active' ? 'bg-green-100 text-green-800' :
                        hotel.salesStage === 'negotiation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {hotel.salesStage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}