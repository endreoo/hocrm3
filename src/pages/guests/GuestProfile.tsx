import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Star, History, Calendar, Building2, Clock, ArrowLeft } from 'lucide-react';
import { guestService, bookingService } from '../../services/api';
import type { Booking } from '../../types';

interface GuestProfileProps {
  guestId: string;
}

export default function GuestProfile({ guestId }: GuestProfileProps) {
  const { data: guest, isLoading: isLoadingGuest } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: () => guestService.getGuest(guestId),
  });

  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['guest-bookings', guestId],
    queryFn: () => bookingService.getBookings(1, { guestName: guestId }),
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingGuest || isLoadingBookings) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!guest) {
    return <div className="text-red-600">Guest not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => window.location.href = '/guests'}
        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        <span>Back to Guests</span>
      </button>

      {/* Guest Info Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8">
          <div className="flex items-center mb-4">
            <div className="bg-white/10 p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">{guest.name}</h1>
              <p className="text-indigo-100">Guest ID: {guest.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <span>{guest.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              <span>{guest.phone}</span>
            </div>
            <div className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              <span>{guest.bookingsCount} Total Bookings</span>
            </div>
          </div>
        </div>
        
        {/* Guest Preferences */}
        {guest.preferences && guest.preferences.length > 0 && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Guest Preferences
            </h3>
            <div className="flex flex-wrap gap-2">
              {guest.preferences.map((preference, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  <Star className="h-4 w-4 mr-1" />
                  {preference}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Booking History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {bookingsData?.data.map((booking) => (
            <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() => window.location.href = `/bookings/${booking.id}`}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Check-in</span>
                  </div>
                  <div className="font-medium">
                    {new Date(booking.checkIn).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Check-out</span>
                  </div>
                  <div className="font-medium">
                    {new Date(booking.checkOut).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-gray-500 mb-1">
                    <Building2 className="h-4 w-4 mr-1" />
                    <span>Room</span>
                  </div>
                  <div className="font-medium">{booking.roomType}</div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4 text-sm">
                  <div className="text-gray-500 mb-1">Special Requests</div>
                  <div className="text-gray-700">{booking.specialRequests}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}