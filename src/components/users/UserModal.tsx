import React, { useState } from 'react';
import { X, UserCog, Mail, Building2, Shield, Key, Activity } from 'lucide-react';
import type { User } from '../../types';

interface UserModalProps {
  user: User;
  onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'permissions' | 'activity'>('details');

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const tabs = [
    { id: 'details', name: 'User Details', icon: UserCog },
    { id: 'permissions', name: 'Permissions', icon: Shield },
    { id: 'activity', name: 'Activity Log', icon: Activity },
  ] as const;

  // Mock activity log data
  const activityLog = [
    {
      id: 1,
      type: 'login',
      description: 'User logged in',
      timestamp: new Date().toISOString(),
      ip: '192.168.1.1'
    },
    {
      id: 2,
      type: 'permission_change',
      description: 'Permission "manage:users" added',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      changedBy: 'Admin'
    },
    {
      id: 3,
      type: 'profile_update',
      description: 'Profile information updated',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      changedBy: 'User'
    }
  ];

  // Available permissions by role
  const rolePermissions = {
    admin: [
      'manage:users',
      'manage:roles',
      'manage:system',
      'view:all',
      'edit:all'
    ],
    manager: [
      'manage:team',
      'view:reports',
      'edit:bookings',
      'view:finance'
    ],
    agent: [
      'view:bookings',
      'edit:bookings',
      'view:guests',
      'edit:guests'
    ],
    finance: [
      'view:finance',
      'edit:finance',
      'view:reports',
      'manage:invoices'
    ],
    support: [
      'view:tickets',
      'edit:tickets',
      'view:bookings',
      'view:guests'
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
            <div className="flex items-center">
              <div className="bg-white/10 p-3 rounded-full">
                <UserCog className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'agent' ? 'bg-green-100 text-green-800' :
                    user.role === 'finance' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">{user.name}</h2>
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <UserCog className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={user.name}
                    onChange={() => {}}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={user.email}
                    onChange={() => {}}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Department</span>
                  </div>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={user.department}
                    onChange={() => {}}
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={user.role}
                    onChange={() => {}}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="agent">Agent</option>
                    <option value="finance">Finance</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Status</p>
                      <p className="text-sm text-gray-500">Account created on {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <select
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={user.status}
                      onChange={() => {}}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Changes to permissions will take effect immediately. Please be careful when modifying admin permissions.
                </p>
              </div>

              {/* Role-based Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Role Permissions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {rolePermissions[user.role]?.map((permission) => (
                    <div
                      key={permission}
                      className="relative flex items-start p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <label className="font-medium text-gray-700 select-none">
                          {permission}
                        </label>
                        <p className="text-gray-500">{getPermissionDescription(permission)}</p>
                      </div>
                      <div className="ml-3 flex items-center h-5">
                        <input
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={user.permissions.includes(permission)}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Permissions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter custom permission"
                    />
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      Add Permission
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {activityLog.map((event, index) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {index !== activityLog.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              event.type === 'login' ? 'bg-green-500' :
                              event.type === 'permission_change' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}>
                              {event.type === 'login' ? (
                                <Key className="h-5 w-5 text-white" />
                              ) : event.type === 'permission_change' ? (
                                <Shield className="h-5 w-5 text-white" />
                              ) : (
                                <Activity className="h-5 w-5 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">{event.description}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
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

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
            {user.status === 'active' ? (
              <button className="flex-1 border border-red-300 text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition-colors">
                Deactivate User
              </button>
            ) : (
              <button className="flex-1 border border-green-300 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition-colors">
                Activate User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    'manage:users': 'Full access to user management',
    'manage:roles': 'Can modify user roles and permissions',
    'manage:system': 'Access to system configuration',
    'view:all': 'Can view all system data',
    'edit:all': 'Can modify all system data',
    'manage:team': 'Team management capabilities',
    'view:reports': 'Access to system reports',
    'edit:bookings': 'Can modify booking information',
    'view:finance': 'Access to financial information',
    'view:bookings': 'Can view booking information',
    'view:guests': 'Access to guest information',
    'edit:guests': 'Can modify guest information',
    'edit:finance': 'Can modify financial records',
    'manage:invoices': 'Full access to invoice management',
    'view:tickets': 'Can view support tickets',
    'edit:tickets': 'Can modify support tickets'
  };

  return descriptions[permission] || 'Custom permission';
}