import React from 'react';
import { X, Mail, Phone, Building2, Calendar, Briefcase, Clock } from 'lucide-react';
import type { Contact } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { hotelService } from '../../services/api';

interface ContactModalProps {
  contact: Contact;
  onClose: () => void;
}

export default function ContactModal({ contact, onClose }: ContactModalProps) {
  const { data: hotel } = useQuery({
    queryKey: ['hotel', contact.hotelId],
    queryFn: () => hotelService.getHotels({ page: 1, limit: 20 }).then(res => 
      res.data.find(h => h.id === Number(contact.hotelId))
    ),
    enabled: !!contact.hotelId,
  });

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            <h2 className="text-2xl font-bold text-white mb-2">{contact.name}</h2>
            <div className="flex items-center text-white/90">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{contact.role}</span>
              {hotel && (
                <>
                  <span className="mx-2">at</span>
                  <span>{hotel.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <div className="text-gray-900">{contact.email}</div>
            </div>
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <div className="text-gray-900">{contact.phone}</div>
            </div>
          </div>

          {/* Last Interaction */}
          <div className="mb-8">
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Last Interaction</span>
            </div>
            <div className="text-gray-900">
              {new Date(contact.lastInteraction).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Employment History */}
          {contact.employmentHistory && contact.employmentHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employment History</h3>
              <div className="space-y-6">
                {contact.employmentHistory.map((employment, index) => (
                  <div
                    key={index}
                    className="relative pl-8 pb-6 border-l-2 border-gray-200 last:pb-0"
                  >
                    <div className="absolute left-0 transform -translate-x-1/2 mt-1">
                      <div className="h-4 w-4 rounded-full bg-indigo-600"></div>
                    </div>
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{employment.role}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{employment.hotelName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span>
                        {new Date(employment.startDate).toLocaleDateString()} - {' '}
                        {employment.endDate ? new Date(employment.endDate).toLocaleDateString() : 'Present'}
                      </span>
                    </div>
                    {employment.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        {employment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Edit Contact
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Log Interaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}