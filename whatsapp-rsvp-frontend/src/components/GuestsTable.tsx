
import React, { useState, useMemo } from 'react';
import { Guest, RsvpStatus } from '../types';
import { RSVP_STATUS_LABELS, RSVP_STATUS_COLORS } from '../constants';
import { SendIcon, SpinnerIcon } from './Icons';

interface GuestsTableProps {
  guests: Guest[];
  onSendMessage: (guestId: string) => Promise<void>;
  onProcessReply: (guestId: string, message: string) => Promise<void>;
}

const GuestsTable: React.FC<GuestsTableProps> = ({ guests, onSendMessage, onProcessReply }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'needsAttention'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'ALL'>('ALL');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const needsAttentionCount = useMemo(() => guests.filter(g => g.status === RsvpStatus.NEEDS_ATTENTION).length, [guests]);

  const filteredGuests = useMemo(() => {
    const sourceGuests = activeTab === 'needsAttention'
      ? guests.filter(g => g.status === RsvpStatus.NEEDS_ATTENTION)
      : guests;

    return sourceGuests
      .filter(guest =>
        activeTab === 'needsAttention' || statusFilter === 'ALL' || guest.status === statusFilter
      )
      .filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm)
      );
  }, [guests, searchTerm, statusFilter, activeTab]);

  const formatDateTime = (isoString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    };
    return new Intl.DateTimeFormat('he-IL', options).format(new Date(isoString));
  };

  const handleSend = async (guestId: string) => {
    setLoadingStates(prev => ({ ...prev, [guestId]: true }));
    await onSendMessage(guestId);
    setLoadingStates(prev => ({ ...prev, [guestId]: false }));
  };

  const handleReply = async (guestId: string) => {
    const message = replyInputs[guestId];
    if (!message || !message.trim()) return;

    setLoadingStates(prev => ({ ...prev, [guestId]: true }));
    await onProcessReply(guestId, message);
    setLoadingStates(prev => ({ ...prev, [guestId]: false }));
    setReplyInputs(prev => ({ ...prev, [guestId]: '' }));
  };

  const handleReplyInputChange = (guestId: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [guestId]: value }));
  };

  const renderActionCell = (guest: Guest) => {
    const isLoading = loadingStates[guest.id];

    if (isLoading) {
      return <SpinnerIcon className="h-5 w-5 text-blue-500 animate-spin mx-auto" />;
    }

    switch (guest.status) {
      case RsvpStatus.PENDING:
        return (
          <button
            onClick={() => handleSend(guest.id)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"
            aria-label={`שלח הזמנה ל${guest.name}`}
          >
            <SendIcon className="h-4 w-4" />
            <span>שלח</span>
          </button>
        );
      case RsvpStatus.SENT:
      case RsvpStatus.DELIVERED:
      case RsvpStatus.READ:
      case RsvpStatus.NEEDS_ATTENTION:
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="הזן מספר..."
              value={replyInputs[guest.id] || ''}
              onChange={(e) => handleReplyInputChange(guest.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleReply(guest.id) }}
              className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1 text-xs"
            />
            <button onClick={() => handleReply(guest.id)} className="text-sm text-green-600 hover:text-green-800 font-semibold">
              עדכן
            </button>
          </div>
        );
      default:
        return <span className="text-sm text-gray-400">-</span>;
    }
  };

  return (
    <div className="bg-white p-5 shadow rounded-lg mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900">רשימת מוזמנים</h3>
        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="חיפוש לפי שם או טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
          {activeTab === 'all' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RsvpStatus | 'ALL')}
              className="block w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="ALL">כל הסטטוסים</option>
              {Object.keys(RSVP_STATUS_LABELS).map(status => (
                <option key={status} value={status}>{RSVP_STATUS_LABELS[status as RsvpStatus]}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            כל המוזמנים
          </button>
          <button
            onClick={() => setActiveTab('needsAttention')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'needsAttention' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            דורשים יחס
            {needsAttentionCount > 0 && (
              <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === 'needsAttention' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'}`}>
                {needsAttentionCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">טלפון</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">תגובה</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">מגיעים</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">עדכון אחרון</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guest.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guest.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${RSVP_STATUS_COLORS[guest.status]}`}>
                    {RSVP_STATUS_LABELS[guest.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs break-words">
                  {guest.responseMessage || '–'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-medium">
                  {guest.attendeesCount ?? '–'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(guest.lastUpdate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{renderActionCell(guest)}</td>
              </tr>
            ))}
            {filteredGuests.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  אין מוזמנים התואמים את החיפוש.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestsTable;
