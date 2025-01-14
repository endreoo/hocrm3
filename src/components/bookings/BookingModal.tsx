import React, { useState } from 'react';
import { X, Calendar, User, Building2, Clock, FileText, History, Receipt, TicketCheck, CheckCircle2, AlertTriangle, Ban } from 'lucide-react';
import type { Booking } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { guestService } from '../../services/api';

interface BookingModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingModal({ booking, onClose }: BookingModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'finance' | 'tickets'>('details');

  const { data: guest, isLoading: isLoadingGuest } = useQuery({
    queryKey: ['guest', booking.guestId],
    queryFn: () => guestService.getGuest(booking.guestId),
    staleTime: 30000,
  });

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'details', name: 'Booking Details', icon: Calendar },
    { id: 'history', name: 'History', icon: History },
    { id: 'finance', name: 'Finance', icon: Receipt },
    { id: 'tickets', name: 'Tickets', icon: TicketCheck },
  ] as const;

  // Mock booking history data
  const bookingHistory = [
    { 
      date: '2024-03-10T10:00:00',
      type: 'created',
      description: 'Booking created',
      icon: Calendar
    },
    { 
      date: '2024-03-10T10:05:00',
      type: 'notification',
      description: 'Booking confirmation sent to hotel',
      icon: Building2
    },
    { 
      date: '2024-03-10T10:30:00',
      type: 'guest',
      description: 'Guest information sent to hotel',
      icon: User
    },
    { 
      date: '2024-03-15T14:00:00',
      type: 'check-in',
      description: 'Guest checked in',
      icon: CheckCircle2
    }
  ];

  // Mock finance data
  const financeData = {
    invoice: {
      number: 'INV-2024-001',
      date: '2024-03-10',
      amount: 599.99,
      status: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2024-03-10'
    },
    transactions: [
      {
        date: '2024-03-10',
        type: 'charge',
        amount: 599.99,
        description: 'Room charge'
      },
      {
        date: '2024-03-10',
        type: 'payment',
        amount: -599.99,
        description: 'Payment received'
      }
    ]
  };

  // Mock tickets data
  const tickets = [
    {
      id: 'T001',
      title: 'Special room request',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-03-09T15:30:00',
      updatedAt: '2024-03-09T16:45:00'
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        {/* Header with Guest Info */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-600 to-indigo-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            {isLoadingGuest ? (
              <div className="space-y-2">
                <div className="animate-pulse h-6 bg-white/20 rounded w-1/3"></div>
              </div>
            ) : guest ? (
              <div className="flex items-center">
                <div className="bg-white/10 p-3 rounded-full">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white">{guest.name}</h2>
                  <button
                    onClick={() => window.location.href = `/guests/${booking.guestId}`}
                    className="text-indigo-200 hover:text-white text-sm flex items-center mt-1"
                  >
                    View Guest Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-white/90">Guest information not available</div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center
                  hover:bg-gray-50 focus:z-10 focus:outline-none
                  ${activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-center">
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Check-in</span>
                    </div>
                    <div className="text-gray-900">
                      {new Date(booking.checkIn).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Room Type</span>
                    </div>
                    <div className="text-gray-900">{booking.roomType}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Check-out</span>
                    </div>
                    <div className="text-gray-900">
                      {new Date(booking.checkOut).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <div className="text-gray-900">
                      {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Special Requests</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    {booking.specialRequests}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {bookingHistory.map((event, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== bookingHistory.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              event.type === 'created' ? 'bg-blue-500' :
                              event.type === 'notification' ? 'bg-yellow-500' :
                              event.type === 'guest' ? 'bg-green-500' :
                              'bg-gray-500'
                            }`}>
                              <event.icon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">{event.description}</p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {new Date(event.date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Details</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{financeData.invoice.number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="mt-1 text-sm text-gray-900">${financeData.invoice.amount}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="mt-1 text-sm text-gray-900">{financeData.invoice.paymentMethod}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{financeData.invoice.paymentDate}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Transactions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transactions</h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {financeData.transactions.map((transaction, index) => (
                      <li key={index} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                          <div className={`text-sm font-medium ${
                            transaction.type === 'charge' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'charge' ? '+' : '-'}${Math.abs(transaction.amount)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {tickets.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <li key={ticket.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {ticket.status}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Created: {new Date(ticket.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6">
                  <TicketCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
                  <p className="mt-1 text-sm text-gray-500">No support tickets have been created for this booking.</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Edit Booking
            </button>
            {booking.status === 'active' && (
              <button className="flex-1 border border-red-300 text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition-colors">
                Cancel Booking
              </button>
            )}
            <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}