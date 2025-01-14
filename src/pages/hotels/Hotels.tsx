import React, { useState, useEffect } from 'react';
import { Building2, Filter, ArrowUpDown } from 'lucide-react';
import type { Hotel, Segment, SalesStage } from '../../types';
import HotelModal from '../../components/hotels/HotelModal';
import { useQuery } from '@tanstack/react-query';
import { hotelService } from '../../services/api';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const segments: Segment[] = ['luxury', 'business', 'budget', 'resort'];
const salesStages: SalesStage[] = ['prospect', 'negotiation', 'active', 'inactive'];

export default function Hotels() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(20);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [filters, setFilters] = useState({
    location: '',
    segment: '' as Segment | '',
    salesStage: '' as SalesStage | ''
  });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data: hotelsData, isLoading, error } = useQuery({
    queryKey: ['hotels', page, filters],
    queryFn: () => hotelService.getHotels(page, { ...filters, limit: pageSize }),
    keepPreviousData: true, // Keep showing previous data while loading new data
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 1, // Only retry once if the request fails
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Hotel;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Create skeleton array for loading state
  const skeletonRows = Array(pageSize).fill(null);

  const handleSort = (key: keyof Hotel) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const hotels = hotelsData?.data || [];
  const sortedHotels = [...hotels]
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

  return (
    <div className="bg-white shadow rounded-lg relative">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-xl font-semibold text-gray-900">Hotels</h2>
          </div>
          <button
            onClick={() => {
              setFilters({
                location: '',
                segment: '',
                salesStage: ''
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {error && <div className="p-4 text-red-600">Error loading hotels. Please try again.</div>}

      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
          <input
            aria-label="Filter by location"
            type="text"
            placeholder="Filter by location..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.location}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({ ...prev, location: value }));
            }}
          />
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.segment}
            onChange={(e) => setFilters(prev => ({ ...prev, segment: e.target.value as Segment }))}
          >
            <option value="">All Segments</option>
            {segments.map(segment => (
              <option key={segment} value={segment}>
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.salesStage}
            onChange={(e) => setFilters(prev => ({ ...prev, salesStage: e.target.value as SalesStage }))}
          >
            <option value="">All Sales Stages</option>
            {salesStages.map(stage => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['name', 'location', 'reviews', 'rating', 'segment', 'salesStage'].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column as keyof Hotel)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.charAt(0).toUpperCase() + column.slice(1)}</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? skeletonRows.map((_, index) => (
                <tr key={index}>
                  {Array(6).fill(null).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              )) : sortedHotels.map((hotel) => (
                <tr
                  key={hotel.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedHotel(hotel)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{hotel.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hotel.reviews}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{hotel.rating}</span>
                      <span className="ml-1 text-yellow-400">★</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {hotel.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${hotel.salesStage === 'active' ? 'bg-green-100 text-green-800' :
                        hotel.salesStage === 'negotiation' ? 'bg-yellow-100 text-yellow-800' :
                        hotel.salesStage === 'prospect' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {hotel.salesStage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hotelsData && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {hotelsData.data.length > 0 ? ((page - 1) * pageSize) + 1 : 0} to{' '}
              {Math.min(page * pageSize, hotelsData?.meta?.total || 0).toLocaleString()} of{' '}
              {(hotelsData?.meta?.total || 0).toLocaleString()} results
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value) as typeof PAGE_SIZE_OPTIONS[number]);
                    setPage(1); // Reset to first page when changing page size
                  }}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size} per page</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (hotelsData?.meta?.last_page || 1) || isLoading}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </div>
  );
}