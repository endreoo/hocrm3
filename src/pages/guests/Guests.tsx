import React, { useState } from 'react';
import { Users, Filter, ArrowUpDown, Star, History, Mail, Phone } from 'lucide-react';
import type { Guest } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { guestService } from '../../services/api';

const ITEMS_PER_PAGE = 10;

export default function Guests() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    minBookings: '',
  });

  const { data: guestsData, isLoading, error } = useQuery({
    queryKey: ['guests', page, filters],
    queryFn: () => guestService.getGuests(page, filters),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Guest;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Guest) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const guests = guestsData?.data || [];
  const sortedGuests = [...guests].sort((a, b) => {
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

  const skeletonRows = Array(10).fill(null);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-xl font-semibold text-gray-900">Guests</h2>
          </div>
          <button
            onClick={() => {
              setFilters({
                name: '',
                email: '',
                minBookings: '',
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {error && <div className="p-4 text-red-600">Error loading guests. Please try again.</div>}

      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Search by email..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.email}
            onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Min. number of bookings..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.minBookings}
            onChange={(e) => setFilters(prev => ({ ...prev, minBookings: e.target.value }))}
          />
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['name', 'email', 'phone', 'bookingsCount', 'lastStayDate'].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column as keyof Guest)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                ))}
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
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
              )) : sortedGuests.map((guest) => (
                <tr
                  key={guest.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = `/guests/${guest.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        {guest.preferences && guest.preferences.length > 0 && (
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-gray-500 ml-1">
                              {guest.preferences.length} preferences
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      {guest.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {guest.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <History className="h-4 w-4 mr-1" />
                      {guest.bookingsCount} stays
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {guest.lastStayDate ? new Date(guest.lastStayDate).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/guests/${guest.id}`;
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {guestsData && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(page * ITEMS_PER_PAGE, guestsData.meta.total)} of{' '}
              {guestsData.meta.total} results
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
                disabled={page >= guestsData.meta.last_page || isLoading}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}