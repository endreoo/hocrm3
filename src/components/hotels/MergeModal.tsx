import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelService } from '../../services/api';
import type { Hotel } from '../../types';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const MERGEABLE_FIELDS = [
  'name',
  'location',
  'sub_location',
  'address',
  'description',
  'google_review_score',
  'google_number_of_reviews',
  'market',
  'hotel_website',
  'segment_id',
  'sales_process_id'
] as const;

type MergeableField = typeof MERGEABLE_FIELDS[number];

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetHotel: Hotel;
  sourceHotels: Hotel[];
}

const FIELD_LABELS: Record<MergeableField, string> = {
  name: 'Name',
  location: 'Location',
  sub_location: 'Sub Location',
  address: 'Address',
  description: 'Description',
  google_review_score: 'Google Review Score',
  google_number_of_reviews: 'Number of Reviews',
  market: 'Market',
  hotel_website: 'Website',
  segment_id: 'Segment',
  sales_process_id: 'Sales Process'
};

export default function MergeModal({ isOpen, onClose, targetHotel, sourceHotels }: MergeModalProps) {
  const queryClient = useQueryClient();
  const [selectedFields, setSelectedFields] = useState<Record<MergeableField, number | null>>(
    Object.fromEntries(MERGEABLE_FIELDS.map(field => [field, 0])) as Record<MergeableField, number | null>
  );

  const { mutate: mergeHotels, isPending } = useMutation({
    mutationFn: async () => {
      console.log('=== Merge Hotels Debug Logs ===');
      
      // Get selected fields for each source hotel
      const selectedFieldsBySource = sourceHotels.map((_, sourceIndex) => 
        MERGEABLE_FIELDS.filter(field => selectedFields[field] === sourceIndex + 1)
      );

      // Validate that at least one field is selected
      if (selectedFieldsBySource.every(fields => fields.length === 0)) {
        throw new Error('Please select at least one field to merge from the source hotels');
      }

      console.log('Merge Configuration:', {
        targetHotel: {
          id: targetHotel.id,
          name: targetHotel.name,
        },
        sourceHotels: sourceHotels.map(h => ({
          id: h.id,
          name: h.name,
        })),
        fieldSelections: selectedFieldsBySource.map((fields, idx) => ({
          sourceHotel: sourceHotels[idx].name,
          selectedFields: fields,
        }))
      });

      try {
        const response = await hotelService.mergeHotels(
          targetHotel.id,
          sourceHotels.map(h => h.id),
          selectedFieldsBySource
        );
        return response;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes('foreign key constraint fails')) {
            const errorMessage = 'Cannot merge hotels due to existing dependencies (scraper_progress records). ' +
              'Please ensure all dependencies are handled before merging.';
            toast.error(errorMessage, { autoClose: 8000 });
          } else if (error.message.includes('404')) {
            toast.error('The merge endpoint is not available. Please check the API configuration.');
          } else {
            toast.error(`Merge failed: ${error.message}`);
          }
        } else {
          toast.error('An unexpected error occurred during merge');
        }
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('Merge completed successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotels merged successfully', {
        autoClose: 3000,
      });
      onClose();
    },
    onError: (error) => {
      console.error('Merge operation failed:', error);
      // Error is already handled in mutationFn
    },
  });

  const handleFieldToggle = (hotelIndex: number, field: MergeableField) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: prev[field] === hotelIndex ? null : hotelIndex
    }));
  };

  const handleSelectAll = (hotelIndex: number) => {
    setSelectedFields(prev => {
      const newFields = { ...prev } as Record<MergeableField, number | null>;
      let hasAllSelected = true;
      
      // Check if all available fields are already selected for this hotel
      for (const field of MERGEABLE_FIELDS) {
        if (prev[field] !== hotelIndex) {
          hasAllSelected = false;
          break;
        }
      }

      // If all are selected, clear them. Otherwise, select all available fields
      if (hasAllSelected) {
        for (const field of MERGEABLE_FIELDS) {
          if (prev[field] === hotelIndex) {
            newFields[field] = null;
          }
        }
      } else {
        for (const field of MERGEABLE_FIELDS) {
          newFields[field] = hotelIndex;
        }
      }
      
      return newFields;
    });
  };

  const getFieldValue = (hotel: Hotel, field: MergeableField): string => {
    switch (field) {
      case 'name':
        return hotel.name;
      case 'location':
        return hotel.location;
      case 'sub_location':
        return hotel.sub_location || 'Not set';
      case 'address':
        return hotel.address || 'Not set';
      case 'description':
        return hotel.description || 'Not set';
      case 'google_review_score':
        return hotel.google_review_score ? hotel.google_review_score.toString() : 'Not set';
      case 'google_number_of_reviews':
        return hotel.google_number_of_reviews ? hotel.google_number_of_reviews.toString() : 'Not set';
      case 'market':
        return hotel.market || 'Not set';
      case 'hotel_website':
        return hotel.hotel_website || 'Not set';
      case 'segment_id':
        return hotel.segment?.name || 'Not set';
      case 'sales_process_id':
        return hotel.sales_process?.name || 'Not set';
      default:
        return 'Not set';
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                <div className="absolute right-0 top-0 pr-6 pt-6">
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="px-8 py-6">
                  <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                    Merge Hotels
                  </Dialog.Title>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Select which values to keep for each field. Unselected fields will keep the target hotel's values.</p>
                    
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="py-4 px-3 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 w-[100px] min-w-[100px] border-r border-gray-200">
                                Field
                              </th>
                              <th className="py-4 px-2 text-left text-sm font-medium text-gray-900 w-[180px] min-w-[180px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-indigo-600 font-medium">Target Hotel</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAll(0)}
                                    className="text-xs font-normal px-2 py-1 rounded hover:bg-gray-100"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </th>
                              {sourceHotels.map((_, index) => (
                                <th key={index} className="py-4 px-2 text-left text-sm font-medium text-gray-900 w-[180px] min-w-[180px]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-900">Source {index + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectAll(index + 1)}
                                      className="text-xs font-normal px-2 py-1 rounded hover:bg-gray-100"
                                    >
                                      Select All
                                    </button>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {MERGEABLE_FIELDS.map(field => (
                              <tr key={field} className="hover:bg-gray-50">
                                <td className="py-3 px-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 hover:bg-gray-50 truncate" title={FIELD_LABELS[field]}>
                                  {FIELD_LABELS[field]}
                                </td>
                                <td className="py-3 px-2 text-sm">
                                  <label className={`flex items-center space-x-3 cursor-pointer group ${
                                    selectedFields[field] !== null && selectedFields[field] !== 0 ? 'opacity-50' : ''
                                  }`}>
                                    <input
                                      type="checkbox"
                                      checked={selectedFields[field] === 0}
                                      onChange={() => handleFieldToggle(0, field)}
                                      disabled={selectedFields[field] !== null && selectedFields[field] !== 0}
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                    />
                                    <span 
                                      className={`truncate max-w-[120px] ${
                                        selectedFields[field] === 0
                                          ? 'text-indigo-600 font-medium' 
                                          : selectedFields[field] !== null
                                            ? 'text-gray-400'
                                            : 'text-gray-600 group-hover:text-gray-900'
                                      }`}
                                      title={getFieldValue(targetHotel, field)}
                                    >
                                      {getFieldValue(targetHotel, field)}
                                    </span>
                                  </label>
                                </td>
                                {sourceHotels.map((hotel, index) => (
                                  <td key={hotel.id} className="py-3 px-2 text-sm">
                                    <label className={`flex items-center space-x-3 cursor-pointer group ${
                                      selectedFields[field] !== null && selectedFields[field] !== index + 1 ? 'opacity-50' : ''
                                    }`}>
                                      <input
                                        type="checkbox"
                                        checked={selectedFields[field] === index + 1}
                                        onChange={() => handleFieldToggle(index + 1, field)}
                                        disabled={selectedFields[field] !== null && selectedFields[field] !== index + 1}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                      />
                                      <span 
                                        className={`truncate max-w-[120px] ${
                                          selectedFields[field] === index + 1
                                            ? 'text-indigo-600 font-medium' 
                                            : selectedFields[field] !== null
                                              ? 'text-gray-400'
                                              : 'text-gray-600 group-hover:text-gray-900'
                                        }`}
                                        title={getFieldValue(hotel, field)}
                                      >
                                        {getFieldValue(hotel, field)}
                                      </span>
                                    </label>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Starting merge operation');
                        mergeHotels();
                      }}
                      disabled={isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? 'Merging...' : 'Merge Hotels'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 