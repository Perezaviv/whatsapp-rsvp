
import React from 'react';
import { ActivityLogEntry } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, SendIcon } from './Icons';

interface ActivityLogProps {
  log: ActivityLogEntry[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ log }) => {

  const getIcon = (status: ActivityLogEntry['status']) => {
    switch(status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <SendIcon className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const formatTime = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
      });
  }

  return (
    <div className="bg-white p-5 shadow rounded-lg h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">יומן פעילות</h3>
      <div className="overflow-y-auto h-64 pr-2 space-y-4">
        {log.length === 0 && (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">יומן הפעילות ריק. בצע פעולה כדי לראות עדכונים.</p>
            </div>
        )}
        {log.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getIcon(entry.status)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{entry.message}</p>
              <p className="text-xs text-gray-400">{formatTime(entry.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
