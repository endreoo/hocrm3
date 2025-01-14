import React, { useState } from 'react';
import { X, Building2, Calendar, Clock, FileText, DollarSign, User, BookOpen, Contact2 } from 'lucide-react';
import type { Transaction } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { hotelService, bookingService, guestService, contactService } from '../../services/api';

interface TransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'related' | 'history'>('details');

  const { data: hotel } = useQuery({
    queryKey: ['hotel', transaction.hotelId],
    queryFn: () => hotelService.getHotels(1).then(res => 
      res.data.find(h => h.id === transaction.hotelId)
    ),
  });

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 text-blue-800';
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      case 'payment_received':
        return 'bg-green-100 text-green-800';
      case 'payment_sent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'details', name: 'Transaction Details', icon: FileText },
    { id: 'related', name: 'Related Entities', icon: Building2 },
    { id: 'history', name: 'History', icon: Clock },
  ] as const;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-indigo-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-6">
            <div className="flex items-center mb-2">
              <div className="bg-white/10 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                    {transaction.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {transaction.type === 'payment_received' || transaction.type === 'invoice' ? '+' : '-'}
                  {transaction.amount.toFixed(2)} {transaction.currency}
                </h2>
              </div>
            </div>
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
              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Transaction Date</span>
                  </div>
                  <div className="text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {transaction.dueDate && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Due Date</span>
                    </div>
                    <div className="text-gray-900">
                      {new Date(transaction.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Hotel</span>
                  </div>
                  <div className="text-gray-900">{hotel?.name || 'Loading...'}</div>
                </div>

                {transaction.referenceNumber && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Reference Number</span>
                    </div>
                    <div className="text-gray-900">{transaction.referenceNumber}</div>
                  </div>
                )}

                {transaction.paymentMethod && (
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Payment Method</span>
                    </div>
                    <div className="text-gray-900">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Description</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  {transaction.description}
                </div>
              </div>

              {/* Notes */}
              {transaction.notes && (
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Additional Notes</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    {transaction.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Entities Tab */}
          {activeTab === 'related' && (
            <div className="space-y-6">
              {/* Hotel */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Hotel Information</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {hotel ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-medium">{hotel.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Location: {hotel.location}
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        View Hotel Details
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">Loading hotel information...</div>
                  )}
                </div>
              </div>

              {/* Bookings */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Related Bookings</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No bookings are currently linked to this transaction.
                    </p>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Link a Booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Related Contacts</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center py-6">
                    <Contact2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No contacts are currently linked to this transaction.
                    </p>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Link a Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    {
                      date: transaction.date,
                      type: 'created',
                      description: 'Transaction created',
                      user: 'System'
                    },
                    {
                      date: transaction.date,
                      type: 'status',
                      description: `Status set to ${transaction.status}`,
                      user: 'System'
                    }
                  ].map((event, index, array) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== array.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                              <Clock className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {event.description}{' '}
                                <span className="font-medium text-gray-900">
                                  by {event.user}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
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

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {transaction.status === 'pending' && (
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Mark as Completed
              </button>
            )}
            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Edit Transaction
            </button>
            {transaction.status !== 'cancelled' && (
              <button className="flex-1 border border-red-300 text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition-colors">
                Cancel Transaction
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}