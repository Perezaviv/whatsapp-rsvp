
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import StatusChart from './components/StatusChart';
import GuestsTable from './components/GuestsTable';
import ActivityLog from './components/ActivityLog';
import { RsvpStatus, KpiData, Guest, ActivityLogEntry } from './types';
import { SendIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, ChartPieIcon, UsersIcon } from './components/Icons';
import { api } from './services/api';


const App: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const addLog = (message: string, status: 'success' | 'error' | 'info') => {
    const newEntry: ActivityLogEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message,
      status
    };
    setActivityLog(prevLog => [newEntry, ...prevLog].slice(0, 20));
  };

  const fetchGuests = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.getGuests();
      setGuests(data);
    } catch (err) {
      setError('Failed to fetch guest data from the server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);
  
  const updateGuestInState = (updatedGuest: Guest) => {
    setGuests(prevGuests => prevGuests.map(g => g.id === updatedGuest.id ? updatedGuest : g));
  };


  const handleSendMessage = useCallback(async (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    addLog(`Sending invitation to ${guest.name}...`, 'info');
    try {
      const updatedGuest = await api.sendMessage(guestId);
      updateGuestInState(updatedGuest);
      addLog(`Invitation sent successfully to ${guest.name}.`, 'success');
    } catch (error) {
      addLog(`Failed to send invitation to ${guest.name}.`, 'error');
      const failedGuest = { ...guest, status: RsvpStatus.FAILED, lastUpdate: new Date().toISOString() };
      updateGuestInState(failedGuest);
    }
  }, [guests]);

  const handleProcessReply = useCallback(async (guestId: string, message: string): Promise<void> => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    addLog(`Processing reply from ${guest.name}: "${message}"`, 'info');

    try {
      const updatedGuest = await api.simulateReply(guestId, message);
      updateGuestInState(updatedGuest);
      addLog(`Reply from ${guest.name} processed: Status set to ${updatedGuest.status}.`, 'success');
    } catch (error) {
      console.error("Error processing response:", error);
      addLog(`Failed to process reply from ${guest.name}.`, 'error');
    }
  }, [guests]);


  const kpiStats: KpiData[] = useMemo(() => {
    const total = guests.length;
    const confirmed = guests.filter(g => g.status === RsvpStatus.CONFIRMED).length;
    const declined = guests.filter(g => g.status === RsvpStatus.DECLINED).length;
    const needsAttention = guests.filter(g => g.status === RsvpStatus.NEEDS_ATTENTION).length;
    const responded = confirmed + declined + needsAttention;
    const sent = guests.filter(g => g.status !== RsvpStatus.PENDING && g.status !== RsvpStatus.FAILED).length;
    const failed = guests.filter(g => g.status === RsvpStatus.FAILED).length;

    const totalAttendees = guests
      .filter(g => g.status === RsvpStatus.CONFIRMED)
      .reduce((sum, g) => sum + (g.attendeesCount || 0), 0);

    return [
      { title: 'Total Attendees', value: `${totalAttendees}`, icon: <UsersIcon />, color: 'bg-cyan-500' },
      { title: 'Confirmed', value: `${confirmed}`, icon: <CheckCircleIcon />, color: 'bg-green-500' },
      { title: 'Declined', value: `${declined}`, icon: <XCircleIcon />, color: 'bg-red-500' },
      { title: 'Needs Attention', value: `${needsAttention}`, icon: <ExclamationCircleIcon />, color: 'bg-orange-500' },
      { title: 'Total Responded', value: `${responded} of ${total}`, icon: <ChartPieIcon />, color: 'bg-purple-500' },
      { title: 'Sent', value: `${sent}`, icon: <SendIcon />, color: 'bg-blue-500' },
      { title: 'Failed', value: `${failed}`, icon: <ExclamationCircleIcon />, color: 'bg-pink-500' },
    ];
  }, [guests]);

  const statusChartData = useMemo(() => {
    const confirmed = guests.filter(g => g.status === RsvpStatus.CONFIRMED).length;
    const declined = guests.filter(g => g.status === RsvpStatus.DECLINED).length;
    const needsAttention = guests.filter(g => g.status === RsvpStatus.NEEDS_ATTENTION).length;
    const pendingResponse = guests.length - (confirmed + declined + needsAttention);
    
    return [
        { name: RsvpStatus.CONFIRMED, value: confirmed },
        { name: RsvpStatus.DECLINED, value: declined },
        { name: RsvpStatus.NEEDS_ATTENTION, value: needsAttention },
        { name: 'Pending' as const, value: pendingResponse },
    ];
  }, [guests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 px-4 sm:px-0">
          RSVP Campaign Summary
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 px-4 sm:px-0">
          {kpiStats.map(kpi => (
            <KpiCard key={kpi.title} kpi={kpi} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-0">
            <div className="lg:col-span-1">
                <StatusChart data={statusChartData} />
            </div>
            <div className="lg:col-span-2">
                <ActivityLog log={activityLog} />
            </div>
        </div>
        
        <div className="px-4 sm:px-0">
            <GuestsTable 
              guests={guests}
              onSendMessage={handleSendMessage}
              onProcessReply={handleProcessReply}
            />
        </div>

      </main>
    </div>
  );
};

export default App;