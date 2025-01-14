import React, { useState } from 'react';
import { Contact2, Filter, ArrowUpDown, Building2, Mail, Phone, Calendar, History } from 'lucide-react';
import type { Contact } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { contactService } from '../../services/api';
import ContactModal from '../../components/contacts/ContactModal';

const ITEMS_PER_PAGE = 10;

export default function Contacts() {
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filters, setFilters] = useState({
    name: '',
    role: '',
    hotelId: '',
  });

  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: ['contacts', page, filters],
    queryFn: () => contactService.getContacts(page, filters),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Contact;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Contact) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const contacts = contactsData?.data || [];
  const sortedContacts = [...contacts].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const skeletonRows = Array(10).fill(null);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Contact2 className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-xl font-semibold text-gray-900">Hotel Contacts</h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setFilters({
                  name: '',
                  role: '',
                  hotelId: '',
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
            <button
              onClick={() => setSelectedContact({ id: 'new', name: '', role: '', hotelId: '', email: '', phone: '', lastInteraction: new Date().toISOString(), employmentHistory: [] })}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Contact2 className="h-4 w-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-4 text-red-600">Error loading contacts. Please try again.</div>}

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
            type="text"
            placeholder="Filter by role..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          />
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.hotelId}
            onChange={(e) => setFilters(prev => ({ ...prev, hotelId: e.target.value }))}
          >
            <option value="">All Hotels</option>
            <option value="1">Grand Hotel</option>
            <option value="2">Business Inn</option>
            <option value="3">Seaside Resort</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['name', 'role', 'email', 'phone', 'lastInteraction'].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column as keyof Contact)}
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
              )) : sortedContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Contact2 className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        {contact.employmentHistory && contact.employmentHistory.length > 1 && (
                          <div className="flex items-center mt-1">
                            <History className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500 ml-1">
                              {contact.employmentHistory.length} previous hotels
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                      {contact.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      {contact.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {contact.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(contact.lastInteraction).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contactsData && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(page * ITEMS_PER_PAGE, contactsData.meta.total)} of{' '}
              {contactsData.meta.total} results
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
                disabled={page >= contactsData.meta.last_page || isLoading}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}