import React, { useState } from 'react';
import { X, MapPin, Calendar, Mail, Phone, CheckCircle2, Clock, AlertCircle, ClipboardCheck, UserCheck, Building2, Megaphone, DollarSign, BookOpen, Contact2, TrendingUp, Network, FileText, ScrollText } from 'lucide-react';
import type { Hotel } from '../../types';

interface HotelModalProps {
  hotel: Hotel;
  onClose: () => void;
}

export default function HotelModal({ hotel, onClose }: HotelModalProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'revenue' | 'bookings' | 'finance' | 'contacts' | 'distribution' | 'contracts'>('sales');

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const tabs = [
    { id: 'sales', name: 'Sales', icon: Megaphone },
    { id: 'revenue', name: 'Revenue Management', icon: TrendingUp },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'bookings', name: 'Bookings', icon: BookOpen },
    { id: 'contacts', name: 'Contacts', icon: Contact2 },
    { id: 'distribution', name: 'Distribution', icon: Network },
    { id: 'contracts', name: 'Contracts', icon: ScrollText },
  ] as const;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-bold text-white mb-2">{hotel.name}</h2>
            <div className="flex items-center text-white/90">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{hotel.location}</span>
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
          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-8">
              {/* Qualification Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualification Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      icon: ClipboardCheck, 
                      title: 'Segmentation',
                      description: 'Identify hotel segment and fit',
                      status: hotel.campaign?.steps.find(s => s.type === 'segment')?.status || 'pending',
                      date: hotel.campaign?.steps.find(s => s.type === 'segment')?.completedAt
                    },
                    { 
                      icon: Building2, 
                      title: 'Information',
                      description: 'Gather hotel information',
                      status: hotel.campaign?.steps.find(s => s.type === 'information')?.status || 'pending',
                      date: hotel.campaign?.steps.find(s => s.type === 'information')?.completedAt
                    },
                    { 
                      icon: UserCheck, 
                      title: 'Contacts',
                      description: 'Identify key contacts',
                      status: hotel.campaign?.steps.find(s => s.type === 'contacts')?.status || 'pending',
                      date: hotel.campaign?.steps.find(s => s.type === 'contacts')?.completedAt
                    },
                    { 
                      icon: Megaphone, 
                      title: 'Campaign',
                      description: 'Start outreach campaign',
                      status: hotel.campaign?.steps.find(s => s.type === 'outreach')?.status || 'pending',
                      date: hotel.campaign?.steps.find(s => s.type === 'outreach')?.completedAt
                    }
                  ].map((step, index) => (
                    <div 
                      key={step.title} 
                      className={`p-4 rounded-lg border-2 ${
                        step.status === 'completed' ? 'border-green-200 bg-green-50' :
                        step.status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-full ${
                          step.status === 'completed' ? 'bg-green-200' :
                          step.status === 'in-progress' ? 'bg-blue-200' :
                          'bg-gray-200'
                        }`}>
                          <step.icon className={`h-5 w-5 ${
                            step.status === 'completed' ? 'text-green-700' :
                            step.status === 'in-progress' ? 'text-blue-700' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <span className="text-sm font-medium">Step {index + 1}</span>
                      </div>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Completed: {new Date(step.date).toLocaleDateString()}
                        </p>
                      )}
                      {step.status !== 'completed' && (
                        <button
                          className={`mt-3 w-full px-3 py-1 rounded text-sm font-medium ${
                            step.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {step.status === 'in-progress' ? 'Mark Complete' : 'Start Step'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Progress */}
              {hotel.campaign && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">B2B Sales Pipeline</h3>
                    {hotel.campaign.startDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Campaign Started: {new Date(hotel.campaign.startDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          hotel.campaign.status === 'active' ? 'bg-green-100' :
                          hotel.campaign.status === 'paused' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {hotel.campaign.status === 'active' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : hotel.campaign.status === 'paused' ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <span className="ml-2 font-medium capitalize">{hotel.campaign.stage} Stage</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        hotel.campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        hotel.campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {hotel.campaign.status}
                      </span>
                    </div>

                    {/* Campaign Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="text-xs font-semibold text-indigo-600 uppercase">
                          Pipeline Progress
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-indigo-600">
                            {Math.round(
                              (hotel.campaign.steps.filter(s => s.status === 'completed').length /
                              hotel.campaign.steps.length) * 100
                            )}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                        <div
                          style={{
                            width: `${(hotel.campaign.steps.filter(s => s.status === 'completed').length /
                              hotel.campaign.steps.length) * 100}%`
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activities & Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {hotel.activities?.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          activity.type === 'call' ? 'bg-blue-100' :
                          activity.type === 'email' ? 'bg-green-100' :
                          activity.type === 'meeting' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          <Phone className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.summary}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Tasks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Tasks</h3>
                  <div className="space-y-4">
                    {hotel.tasks?.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          task.priority === 'high' ? 'bg-red-100' :
                          task.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <AlertCircle className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Management Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Revenue management features will be available once the hotel becomes an active client.
                </p>
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-8">
              {/* Balance Overview */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Financial Overview</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-green-600 mb-1">Current Balance</div>
                      <div className="text-2xl font-semibold text-green-700">$2,500.00</div>
                      <div className="text-sm text-green-600 mt-1">Last updated: Today</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-yellow-600 mb-1">Pending Invoices</div>
                      <div className="text-2xl font-semibold text-yellow-700">1</div>
                      <div className="text-sm text-yellow-600 mt-1">$1,500.00 total</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-600 mb-1">Pending Payments</div>
                      <div className="text-2xl font-semibold text-blue-700">0</div>
                      <div className="text-sm text-blue-600 mt-1">$0.00 total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      New Transaction
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Mar 10, 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Payment Received
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Payment for INV-2024-001
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          +$5,000.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Mar 1, 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Invoice
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Commission for February bookings
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                          -$5,000.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                    View All Transactions
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-md">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                          <p className="text-sm text-gray-500">Primary payment method</p>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Add Payment Method
                  </button>
                </div>
              </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>reservations@{hotel.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>

              {/* Contact List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Hotel Contacts</h3>
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <UserCheck className="h-4 w-4 mr-1" />
                    Add Contact
                  </button>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {[
                      { name: 'John Smith', role: 'General Manager', email: 'john@example.com' },
                      { name: 'Sarah Johnson', role: 'Sales Director', email: 'sarah@example.com' },
                    ].map((contact, index) => (
                      <li key={index}>
                        <div className="px-4 py-4 flex items-center sm:px-6">
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <div className="flex text-sm">
                                <p className="font-medium text-indigo-600 truncate">{contact.name}</p>
                                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                  in {contact.role}
                                </p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>{contact.email}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-5 flex-shrink-0">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              View Details
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Distribution Tab */}
          {activeTab === 'distribution' && (
            <div className="space-y-8">
              {/* Distribution Channels */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Distribution Channels</h3>
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <Network className="h-4 w-4 mr-1" />
                    Add Channel
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      type: 'GDS',
                      status: 'active',
                      lastSync: '2024-03-15T10:30:00',
                      connectionType: 'direct',
                      mappingStatus: 'completed'
                    },
                    {
                      type: 'OTA',
                      status: 'active',
                      lastSync: '2024-03-15T10:45:00',
                      connectionType: 'channel-manager',
                      mappingStatus: 'completed'
                    },
                    {
                      type: 'Metasearch',
                      status: 'pending',
                      connectionType: 'direct',
                      mappingStatus: 'pending'
                    }
                  ].map((channel, index) => (
                    <div key={index} className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{channel.type}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          channel.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {channel.status}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Network className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">
                            Connection: {channel.connectionType}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">
                            Mapping: {channel.mappingStatus}
                          </span>
                        </div>
                        {channel.lastSync && (
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              Last Sync: {new Date(channel.lastSync).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <button className="w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Manage Channel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-8">
              {/* Contract Actions */}
              <div className="flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  <FileText className="h-4 w-4 mr-2" />
                  New Contract
                </button>
              </div>

              {/* Active Contract */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Active Contract</h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contract Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">Premium Partnership</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Commission Rate</dt>
                      <dd className="mt-1 text-sm text-gray-900">15%</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">January 1, 2024</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">End Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">December 31, 2024</dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      View Contract
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                      Terminate Contract
                    </button>
                  </div>
                </div>
              </div>

              {/* Contract History */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contract History</h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {[
                      {
                        id: 'c2',
                        type: 'Standard Partnership',
                        startDate: '2023-01-01',
                        endDate: '2023-12-31',
                        status: 'expired',
                        commissionRate: 10,
                        terminationReason: null
                      },
                      {
                        id: 'c3',
                        type: 'Basic Partnership',
                        startDate: '2022-01-01',
                        endDate: '2022-06-30',
                        status: 'terminated',
                        commissionRate: 8,
                        terminationReason: 'Upgraded to Standard Partnership'
                      }
                    ].map((contract) => (
                      <li key={contract.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900">{contract.type}</h4>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                contract.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {contract.status}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              Commission Rate: {contract.commissionRate}%
                            </div>
                            {contract.terminationReason && (
                              <div className="mt-2 text-sm text-gray-500">
                                <span className="font-medium">Termination Reason:</span> {contract.terminationReason}
                              </div>
                            )}
                          </div>
                          <button className="ml-4 text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}