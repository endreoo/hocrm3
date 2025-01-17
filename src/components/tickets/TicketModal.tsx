import React, { useState } from 'react';
import { X, User, Building2, BookOpen, Contact2, Clock, MessageSquare, AlertTriangle, CheckCircle2, Bot } from 'lucide-react';
import type { Ticket } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { bookingService, guestService, hotelService, contactService } from '../../services/api';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketModal({ ticket, onClose }: TicketModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'ai'>('details');

  // Fetch related entity data based on ticket type
  // Fetch data for all linked entities
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', ticket.entities.bookings],
    queryFn: () => Promise.all(
      ticket.entities.bookings.map(id => 
        bookingService.getBookings(1, { id }).then(res => res.data[0])
      )
    ),
    enabled: ticket.entities.bookings.length > 0,
  });

  const { data: guestsData } = useQuery({
    queryKey: ['guests', ticket.entities.guests],
    queryFn: () => Promise.all(
      ticket.entities.guests.map(id => guestService.getGuest(id))
    ),
    enabled: ticket.entities.guests.length > 0,
  });

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels', ticket.entities.hotels],
    queryFn: () => Promise.all(
      ticket.entities.hotels.map(id => 
        hotelService.getHotels({ page: 1, limit: 20 }).then(res => res.data.find(h => h.id === Number(id)))
      )
    ),
    enabled: ticket.entities.hotels.length > 0,
  });

  const { data: contactsData } = useQuery({
    queryKey: ['contacts', ticket.entities.contacts],
    queryFn: () => Promise.all(
      ticket.entities.contacts.map(id => 
        contactService.getContacts(1).then(res => res.data.find(c => c.id === id))
      )
    ),
    enabled: ticket.entities.contacts.length > 0,
  });

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Use AlertTriangle as the default icon for tickets
  const TicketIcon = AlertTriangle;

  const tabs = [
    { id: 'details', name: 'Ticket Details', icon: AlertTriangle },
    { id: 'history', name: 'History', icon: Clock },
    { id: 'ai', name: 'AI Analysis', icon: Bot },
  ] as const;

  // Mock ticket history
  const ticketHistory = [
    {
      id: 1,
      type: 'created',
      message: 'Ticket created',
      timestamp: '2024-03-15T10:00:00Z',
      user: 'System'
    },
    {
      id: 2,
      type: 'status_change',
      message: 'Status changed to In Progress',
      timestamp: '2024-03-15T10:30:00Z',
      user: 'John Smith'
    },
    {
      id: 3,
      type: 'comment',
      message: 'Customer contacted via email',
      timestamp: '2024-03-15T11:00:00Z',
      user: 'Sarah Johnson'
    }
  ];

  // Mock AI analysis
  const aiAnalysis = {
    category: 'Booking Modification',
    sentiment: 'Neutral',
    urgency: 'Medium',
    suggestedActions: [
      'Review booking details',
      'Check availability for requested dates',
      'Prepare response template'
    ],
    similarTickets: [
      {
        id: 'T123',
        summary: 'Similar booking modification request',
        resolution: 'Modified booking dates as requested'
      }
    ]
  };

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
                <TicketIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} priority
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{ticket.summary}</h2>
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
              {/* Related Entities */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Related Entities</h3>
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
                      <span className="mr-1">+</span>
                      Add Entity
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Link this ticket to related bookings, guests, hotels, or contacts</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {/* Booking Card */}
                    <div className="border rounded-lg relative group hover:border-indigo-300 hover:shadow-sm transition-all duration-200 bg-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">Booking</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {ticket.entities.bookings.length > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                                {ticket.entities.bookings.length}
                              </span>
                            )}
                            <button
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                              onClick={() => {/* Add linking logic */}}
                            >
                              <span className="mr-1">+</span>
                              Link Booking
                            </button>
                          </div>
                        </div>
                        {bookingsData && bookingsData.length > 0 ? (
                          <div className="space-y-2 mt-4">
                            {bookingsData.map((booking, index) => (
                              <div key={booking.id} className={`${index > 0 ? 'pt-2 border-t' : ''} group/item`}>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">#{booking.id}</p>
                                  <button className="text-xs text-red-600 hover:text-red-700 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    Remove
                                  </button>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No bookings linked</p>
                            <button className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
                              <span className="mr-1">+</span>
                              Link a Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guest Card */}
                    <div className="border rounded-lg relative group hover:border-green-300 hover:shadow-sm transition-all duration-200 bg-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">Guest</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {ticket.entities.guests.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {ticket.entities.guests.length}
                              </span>
                            )}
                            <button
                              className="text-xs text-green-600 hover:text-green-900 font-medium"
                              onClick={() => {/* Add linking logic */}}
                            >
                              Link Guest
                            </button>
                          </div>
                        </div>
                        {guestsData && guestsData.length > 0 ? (
                          <div className="space-y-2">
                            {guestsData.map((guest, index) => (
                              <div key={guest.id} className={index > 0 ? 'pt-2 border-t' : ''}>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                                  <button className="text-xs text-red-600 hover:text-red-900">
                                    Remove
                                  </button>
                                </div>
                                <p className="text-xs text-gray-600">{guest.email}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No guests linked</p>
                            <button className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors">
                              <span className="mr-1">+</span>
                              Link a Guest
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hotels Card */}
                    <div className="border rounded-lg relative group hover:border-indigo-300 hover:shadow-sm transition-all duration-200 bg-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">Hotels</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {ticket.entities.hotels.length > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                                {ticket.entities.hotels.length}
                              </span>
                            )}
                            <button
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                              onClick={() => {/* Add linking logic */}}
                            >
                              <span className="mr-1">+</span>
                              Link Hotel
                            </button>
                          </div>
                        </div>
                        {hotelsData?.filter(Boolean).map((hotel, index) => (
                          hotel && (
                            <div key={hotel.id} className={index > 0 ? 'pt-2 border-t' : ''}>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{hotel.name}</p>
                                <button className="text-xs text-red-600 hover:text-red-900">
                                  Remove
                                </button>
                              </div>
                              <p className="text-xs text-gray-600">{hotel.location}</p>
                            </div>
                          )
                        ))}
                        {(!hotelsData || hotelsData.length === 0) && (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No hotels linked</p>
                            <button className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                              <span className="mr-1">+</span>
                              Link a Hotel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contacts Card */}
                    <div className="border rounded-lg relative group hover:border-indigo-300 hover:shadow-sm transition-all duration-200 bg-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Contact2 className="h-5 w-5 text-indigo-600 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">Contacts</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {ticket.entities.contacts.length > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                                {ticket.entities.contacts.length}
                              </span>
                            )}
                            <button
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                              onClick={() => {/* Add linking logic */}}
                            >
                              <span className="mr-1">+</span>
                              Link Contact
                            </button>
                          </div>
                        </div>
                        {contactsData?.filter(Boolean).map((contact, index) => (
                          contact && (
                            <div key={contact.id} className={index > 0 ? 'pt-2 border-t' : ''}>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                <button className="text-xs text-red-600 hover:text-red-900">
                                  Remove
                                </button>
                              </div>
                              <p className="text-xs text-gray-600">{contact.role}</p>
                            </div>
                          )
                        ))}
                        {(!contactsData || contactsData.length === 0) && (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No contacts linked</p>
                            <button className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors">
                              <span className="mr-1">+</span>
                              Link a Contact
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Thread */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Thread</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">John Doe</span>
                          <span className="text-gray-500"> wrote:</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          Need to modify my booking dates due to flight changes.
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          March 15, 2024 10:30 AM
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Reply Form */}
                  <div className="mt-4">
                    <label htmlFor="reply" className="sr-only">Reply to ticket</label>
                    <textarea
                      id="reply"
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Type your reply..."
                    />
                    <div className="mt-3 flex justify-end space-x-3">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Reply
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
                  {ticketHistory.map((event, index) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {index !== ticketHistory.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              event.type === 'created' ? 'bg-green-500' :
                              event.type === 'status_change' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}>
                              {event.type === 'created' ? (
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              ) : event.type === 'status_change' ? (
                                <AlertTriangle className="h-5 w-5 text-white" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                {event.message}{' '}
                                <span className="font-medium text-gray-900">by {event.user}</span>
                              </p>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
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

          {/* AI Analysis Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* AI Categorization */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
                    <div className="text-sm text-gray-900">{aiAnalysis.category}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">Sentiment</div>
                    <div className="text-sm text-gray-900">{aiAnalysis.sentiment}</div>
                  </div>
                </div>
              </div>

              {/* Suggested Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Actions</h4>
                <ul className="space-y-2">
                  {aiAnalysis.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Similar Tickets */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Similar Tickets</h4>
                <div className="space-y-3">
                  {aiAnalysis.similarTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.summary}</div>
                      <div className="mt-1 text-sm text-gray-500">Resolution: {ticket.resolution}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {ticket.status !== 'resolved' && (
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Mark as Resolved
              </button>
            )}
            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Assign Ticket
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2  rounded-md hover:bg-gray-50 transition-colors">
              Update Priority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}