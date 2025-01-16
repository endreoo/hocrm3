import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/api';
import type { User, UserFilters } from '../../types';
import UserModal from '../../components/users/UserModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export default function Users() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(20);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters((prev: UserFilters) => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page, pageSize, filters],
    queryFn: () => userService.getUsers(page, {
      ...filters,
      role: filters.role || undefined,
      status: filters.status || undefined,
      limit: pageSize
    }),
  });

  return (
    <div className="px-4 py-6">
      <div className="flex gap-4 mb-6">
        <select
          value={filters.role || ''}
          onChange={e => handleFilterChange('role', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="agent">Agent</option>
          <option value="finance">Finance</option>
          <option value="support">Support</option>
        </select>
        <select
          value={filters.status || ''}
          onChange={e => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <input
          type="text"
          value={filters.search || ''}
          onChange={e => handleFilterChange('search', e.target.value)}
          placeholder="Search users..."
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
            {usersData?.data.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="p-4 border rounded hover:shadow-lg cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">Department: {user.department}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-sm rounded ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                    <span className="px-2 py-1 text-sm bg-gray-100 rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {usersData && (
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
                  Page {page} of {usersData?.pages || 1}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(usersData?.pages || 1, p + 1))}
                  disabled={page >= (usersData?.pages || 1)}
                  className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}