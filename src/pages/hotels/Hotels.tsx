import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hotelService } from '../../services/api';
import type { Hotel, Segment, SalesStage, HotelFilters } from '../../types';
import HotelModal from '../../components/hotels/HotelModal';
import { Building2, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const segments: Segment[] = ['luxury', 'business', 'budget', 'resort'];
const salesStages: SalesStage[] = ['prospect', 'negotiation', 'active', 'inactive'];
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];
type SortField = 'name' | 'location' | 'reviews' | 'rating' | 'segment' | 'salesStage';
type SortDirection = 'asc' | 'desc';

export default function Hotels() {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [filters, setFilters] = useState<HotelFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleFilterChange = (key: keyof HotelFilters, value: string) => {
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters((prev: HotelFilters) => ({
        ...prev,
        [key]: value
      }));
    }
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle between asc and desc only
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-indigo-600" />
      : <ArrowDown className="h-4 w-4 text-indigo-600" />;
  };

  const { data: hotelsData, isLoading, error } = useQuery({
    queryKey: ['hotels', page, pageSize, filters, sortField, sortDirection],
    queryFn: () => hotelService.getHotels(page, { 
      ...filters, 
      limit: pageSize,
      sortBy: sortField,
      sortDirection
    }),
  });

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Hotels</h1>
        </div>
        <button className="inline-flex items-center px-4 py-2 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={filters.location || ''}
          onChange={e => handleFilterChange('location', e.target.value)}
          placeholder="Filter by location..."
          className="px-3 py-2 border rounded-md flex-1"
        />
        <select
          value={(filters.segment as Segment) || ''}
          onChange={e => handleFilterChange('segment', e.target.value)}
          className="px-3 py-2 border rounded-md min-w-[200px]"
        >
          <option value="">All Segments</option>
          {segments.map(segment => (
            <option key={segment} value={segment}>{segment}</option>
          ))}
        </select>
        <select
          value={(filters.salesStage as SalesStage) || ''}
          onChange={e => handleFilterChange('salesStage', e.target.value)}
          className="px-3 py-2 border rounded-md min-w-[200px]"
        >
          <option value="">All Sales Stages</option>
          {salesStages.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          Error loading hotels. Please try again later.
        </div>
      ) : !hotelsData?.data?.length ? (
        <div className="text-center py-8 text-gray-600">
          No hotels found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col className="w-80" />
                  <col className="w-40" />
                  <col className="w-32" />
                  <col className="w-32" />
                  <col className="w-40" />
                  <col className="w-40" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate cursor-pointer group"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        <span className="invisible group-hover:visible">
                          {getSortIcon('name')}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate cursor-pointer group"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center gap-2">
                        Location
                        <span className="invisible group-hover:visible">
                          {getSortIcon('location')}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate cursor-pointer group"
                      onClick={() => handleSort('reviews')}
                    >
                      <div className="flex items-center gap-2">
                        Reviews
                        <span className="invisible group-hover:visible">
                          {getSortIcon('reviews')}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate cursor-pointer group"
                      onClick={() => handleSort('rating')}
                    >
                      <div className="flex items-center gap-2">
                        Rating
                        <span className="invisible group-hover:visible">
                          {getSortIcon('rating')}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate cursor-pointer group"
                      onClick={() => handleSort('segment')}
                    >
                      <div className="flex items-center gap-2">
                        Segment
                        <span className="invisible group-hover:visible">
                          {getSortIcon('segment')}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate cursor-pointer group"
                      onClick={() => handleSort('salesStage')}
                    >
                      <div className="flex items-center gap-2">
                        Sales Stage
                        <span className="invisible group-hover:visible">
                          {getSortIcon('salesStage')}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hotelsData.data.map((hotel) => (
                    <tr
                      key={hotel.id}
                      onClick={() => setSelectedHotel(hotel)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate">
                        {hotel.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate">
                        {hotel.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate">
                        {hotel.reviews}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-1">{hotel.rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {hotel.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          hotel.salesStage === 'active' ? 'bg-green-100 text-green-800' :
                          hotel.salesStage === 'negotiation' ? 'bg-yellow-100 text-yellow-800' :
                          hotel.salesStage === 'prospect' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {hotel.salesStage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value) as PageSize);
                  setPage(1);
                }}
                className="rounded-md border-gray-300 text-sm"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
              <span className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{((page - 1) * pageSize) + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(page * pageSize, hotelsData?.total || 0)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{hotelsData?.total || 0}</span>
                {' '}results
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed
                  border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= (hotelsData?.total || 0)}
                className="inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed
                  border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </div>
  );
}