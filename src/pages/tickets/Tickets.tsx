import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../../services/api';
import type { Ticket, TicketFilters } from '../../types';
import TicketModal from '../../components/tickets/TicketModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export default function Tickets() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(20);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters((prev: TicketFilters) => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['tickets', page, pageSize, filters],
    queryFn: () => ticketService.getTickets(page, {
      ...filters,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      entityType: filters.entityType || undefined,
      limit: pageSize
    }),
  });

  return (
    <div className="px-4 py-6">
      <div className="flex gap-4 mb-6">
        <select
          value={filters.status || ''}
          onChange={e => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={filters.priority || ''}
          onChange={e => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filters.entityType || ''}
          onChange={e => handleFilterChange('entityType', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="booking">Booking</option>
          <option value="guest">Guest</option>
          <option value="hotel">Hotel</option>
          <option value="contact">Contact</option>
        </select>
        <input
          type="text"
          value={filters.search || ''}
          onChange={e => handleFilterChange('search', e.target.value)}
          placeholder="Search tickets..."
          className="px-3 py-2 border rounded"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ticketsData?.data.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="p-4 border rounded hover:shadow-lg cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Ticket #{ticket.id}</h3>
                    <p className="text-gray-600">{ticket.summary}</p>
                    <p className="text-gray-600">Type: {ticket.entityType}</p>
                    {ticket.entityId && <p className="text-gray-600">ID: {ticket.entityId}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-sm rounded ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 text-sm rounded ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ticketsData && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value) as typeof PAGE_SIZE_OPTIONS[number])}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-600">
                  Page {page} of {ticketsData?.meta.totalPages || 1}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(ticketsData?.meta.totalPages || 1, p + 1))}
                  disabled={page >= (ticketsData?.meta.totalPages || 1)}
                  className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}