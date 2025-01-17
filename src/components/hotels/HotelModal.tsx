import { useState } from 'react';
import { X, MapPin, Mail } from 'lucide-react';
import type { Hotel } from '../../types';

interface HotelModalProps {
  hotel: Hotel;
  onClose: () => void;
}

export default function HotelModal({ hotel, onClose }: HotelModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'contacts' | 'distribution'>('overview');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
              <p className="text-sm text-gray-600">{hotel.location}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contacts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contacts
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'distribution'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Distribution
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{hotel.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Market</p>
                    <p className="text-sm font-medium text-gray-900">{hotel.market || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Segment</p>
                    <p className="text-sm font-medium text-gray-900">{hotel.segment?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sales Process</p>
                    <p className="text-sm font-medium text-gray-900">{hotel.sales_process?.name || 'Not Started'}</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-1">
                        {hotel.google_review_score || 'N/A'}
                      </span>
                      {hotel.google_review_score && <span className="text-yellow-400">★</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Reviews</p>
                    <p className="text-sm font-medium text-gray-900">
                      {hotel.google_number_of_reviews || 'No reviews'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {hotel.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-sm text-gray-600">{hotel.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Booking management will be available once the hotel is integrated with our system.
                </p>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{hotel.hotel_website || 'No website available'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{hotel.address || 'No address available'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Distribution Tab */}
          {activeTab === 'distribution' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Distribution management will be available once the hotel is integrated with our system.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}