import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelService } from '../../services/api';
import type { Hotel, Location, Segment, SalesProcess } from '../../types';
import { HotelFilters, SortDirection, SortField } from '../../types';
import HotelModal from '../../components/hotels/HotelModal';
import { Building2, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search, Trash2, CheckSquare, Square, X } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Hotels() {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedHotels, setSelectedHotels] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<HotelFilters>({
    page: 1,
    limit: 20 as PageSize,
    order: 'ASC',
    sortBy: 'name'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSegmentDropdownOpen, setIsSegmentDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const segmentDropdownRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<number | null>(null);
  const [showMassDeleteConfirmation, setShowMassDeleteConfirmation] = useState(false);

  const queryClient = useQueryClient();

  // Query for locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['hotelLocations'],
    queryFn: () => hotelService.getLocations(),
  });

  // Query for segments
  const { data: segments = [], isLoading: isLoadingSegments, error: segmentsError } = useQuery<Segment[]>({
    queryKey: ['hotelSegments'],
    queryFn: () => hotelService.getSegments(),
  });

  // Query for sales processes
  const { data: salesProcesses = [], isLoading: isLoadingSalesProcesses, error: salesProcessesError } = useQuery<SalesProcess[]>({
    queryKey: ['hotelSalesProcesses'],
    queryFn: () => hotelService.getSalesProcesses(),
  });

  // Filter locations based on search
  const filteredLocations = locations?.filter(location =>
    location?.toLowerCase().includes(locationSearch?.toLowerCase() || '')
  ) || [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (segmentDropdownRef.current && !segmentDropdownRef.current.contains(event.target as Node)) {
        setIsSegmentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (key: keyof HotelFilters, value: string | number) => {
    console.log('Filter change:', key, value);
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
      console.log('Updated filters after removal:', newFilters);
    } else {
      setFilters((prev: HotelFilters) => {
        const newFilters = {
          ...prev,
          page: 1,
          [key]: value
        };
        console.log('Updated filters:', newFilters);
        return newFilters;
      });
    }
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      sortBy: field,
      order: prev.order === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return filters.order === 'ASC'
      ? <ArrowUp className="h-4 w-4 text-indigo-600" />
      : <ArrowDown className="h-4 w-4 text-indigo-600" />;
  };

  // Update query to use the new filters directly
  const { data: hotelsData, isLoading, error } = useQuery({
    queryKey: ['hotels', filters],
    queryFn: () => hotelService.getHotels(filters),
  });

  console.log('=== Hotels Component Debug Logs ===');
  console.log('Query state:', {
    isLoading,
    hasError: !!error,
    hasData: !!hotelsData,
    totalHotels: hotelsData?.meta?.total,
    hotelCount: hotelsData?.data?.length,
    currentFilters: filters,
    firstHotel: hotelsData?.data?.[0]
  });

  if (error) {
    console.error('Hotels query error:', error);
  }

  // Delete mutations
  const { mutate: deleteHotel } = useMutation({
    mutationFn: (id: number) => hotelService.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });

  const { mutate: deleteHotels } = useMutation({
    mutationFn: (ids: number[]) => hotelService.deleteHotels(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setSelectedHotels(new Set());
    },
  });

  const handleSelectHotel = (hotelId: number) => {
    setSelectedHotels(prev => {
      const next = new Set(prev);
      if (next.has(hotelId)) {
        next.delete(hotelId);
      } else {
        next.add(hotelId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (hotelsData?.data) {
      if (selectedHotels.size === hotelsData.data.length) {
        setSelectedHotels(new Set());
      } else {
        setSelectedHotels(new Set(hotelsData.data.map(hotel => hotel.id)));
      }
    }
  };

  const handleDeleteClick = (hotelId: number) => {
    setHotelToDelete(hotelId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (hotelToDelete) {
      deleteHotel(hotelToDelete);
    }
  };

  const handleMassDeleteClick = () => {
    setShowMassDeleteConfirmation(true);
  };

  const handleConfirmMassDelete = () => {
    if (selectedHotels.size > 0) {
      deleteHotels(Array.from(selectedHotels));
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Hotels</h1>
        </div>
        <div className="flex items-center gap-4">
          {selectedHotels.size > 0 && (
            <button
              onClick={handleMassDeleteClick}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedHotels.size})
            </button>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border
              ${showFilters 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            <Filter className={`h-4 w-4 mr-2 ${showFilters ? 'text-indigo-600' : ''}`} />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex gap-4 mb-6">
          <div className="relative" ref={locationDropdownRef}>
            <div
              className="px-3 py-2 border rounded-md min-w-[200px] cursor-pointer flex items-center justify-between"
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            >
              <span className="text-gray-700">
                {filters.location || 'All Locations'}
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isLocationDropdownOpen ? 'rotate-90' : ''}`} />
            </div>
            
            {isLocationDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                <div className="p-2 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Search locations..."
                      className="w-full px-3 py-2 border rounded-md pr-8"
                      autoFocus
                    />
                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleFilterChange('location', '');
                      setIsLocationDropdownOpen(false);
                      setLocationSearch('');
                    }}
                  >
                    All Locations
                  </div>
                  {filteredLocations.map(location => (
                    <div
                      key={location}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleFilterChange('location', location);
                        setIsLocationDropdownOpen(false);
                        setLocationSearch('');
                      }}
                    >
                      {location}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={segmentDropdownRef}>
            <div
              className="px-3 py-2 border rounded-md min-w-[200px] cursor-pointer flex items-center justify-between"
              onClick={() => setIsSegmentDropdownOpen(!isSegmentDropdownOpen)}
            >
              <span className="text-gray-700">
                {filters.segment_id ? segments.find(s => s.id === filters.segment_id)?.name : 'All Segments'}
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isSegmentDropdownOpen ? 'rotate-90' : ''}`} />
            </div>
            
            {isSegmentDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingSegments ? (
                    <div className="px-3 py-2 text-gray-500">Loading segments...</div>
                  ) : segmentsError ? (
                    <div className="px-3 py-2 text-red-500">Error loading segments</div>
                  ) : (
                    <>
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleFilterChange('segment_id', '');
                          setIsSegmentDropdownOpen(false);
                        }}
                      >
                        All Segments
                      </div>
                      {segments.map(segment => (
                        <div
                          key={segment.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleFilterChange('segment_id', segment.id);
                            setIsSegmentDropdownOpen(false);
                          }}
                        >
                          {segment.name}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <select
            value={filters.sales_process_id || ''}
            onChange={e => handleFilterChange('sales_process_id', Number(e.target.value))}
            className="px-3 py-2 border rounded-md min-w-[200px]"
          >
            <option value="">All Sales Stages</option>
            {isLoadingSalesProcesses ? (
              <option disabled>Loading...</option>
            ) : salesProcessesError ? (
              <option disabled>Error loading sales stages</option>
            ) : (
              salesProcesses.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))
            )}
          </select>
        </div>
      )}

      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {hotelsData?.data && selectedHotels.size === hotelsData.data.length ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">
                  <button
                    onClick={() => handleSort('name')}
                    className="group inline-flex items-center space-x-2"
                  >
                    <span>Name</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('location')}
                    className="group inline-flex items-center space-x-2"
                  >
                    <span>Location</span>
                    {getSortIcon('location')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Stage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="group inline-flex items-center space-x-2"
                  >
                    <span>Status</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading hotels...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-red-500">
                    Error loading hotels
                  </td>
                </tr>
              ) : !hotelsData?.data?.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hotels found
                  </td>
                </tr>
              ) : (
                hotelsData.data.map(hotel => (
                  <tr 
                    key={hotel.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // Only open modal if not clicking on buttons or checkbox
                      if (!(e.target as HTMLElement).closest('button')) {
                        setSelectedHotel(hotel);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleSelectHotel(hotel.id);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedHotels.has(hotel.id) ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate" title={hotel.name}>
                        {hotel.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{hotel.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{hotel.segment?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{hotel.sales_process?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${hotel.status === 'active' ? 'bg-green-100 text-green-800' :
                          hotel.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {hotel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            setSelectedHotel(hotel);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteClick(hotel.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {hotelsData?.meta && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg sm:px-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-700 whitespace-nowrap">
              <span className="font-medium">{hotelsData.meta.total}</span> records
            </p>
          </div>

          {hotelsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleFilterChange('page', 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">First</span>
                ⟪
              </button>
              <button
                onClick={() => handleFilterChange('page', filters.page! - 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                ⟨
              </button>
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Page <span className="font-medium">{filters.page}</span> of{' '}
                <span className="font-medium">{hotelsData.meta.totalPages}</span>
              </span>
              <button
                onClick={() => handleFilterChange('page', filters.page! + 1)}
                disabled={filters.page === hotelsData.meta.totalPages}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                ⟩
              </button>
              <button
                onClick={() => handleFilterChange('page', hotelsData.meta.totalPages)}
                disabled={filters.page === hotelsData.meta.totalPages}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Last</span>
                ⟫
              </button>
            </div>
          )}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Hotel"
        message="Are you sure you want to delete this hotel? This action cannot be undone."
      />

      <DeleteConfirmationModal
        isOpen={showMassDeleteConfirmation}
        onClose={() => setShowMassDeleteConfirmation(false)}
        onConfirm={handleConfirmMassDelete}
        title="Delete Multiple Hotels"
        message={`Are you sure you want to delete ${selectedHotels.size} hotels? This action cannot be undone.`}
      />

      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </div>
  );
}