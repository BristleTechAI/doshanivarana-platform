// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

export function LiveStream() {
  const { templeId } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [streamState, setStreamState] = useState<'idle' | 'live' | 'ended'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [viewers, setViewers] = useState<number | null>(null);
  const [streamHealth, setStreamHealth] = useState<string>('—');
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Track active stream ID
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewersRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!templeId) return;

    // Fetch scheduled bookings for this temple
    const q = query(
      collection(db, 'bookings'),
      where('templeId', '==', templeId),
      where('status', '==', 'SCHEDULED'),
      where('isDeleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUpcomingBookings(bks);
      if (bks.length > 0 && !selectedSlot) {
        setSelectedSlot(bks[0].id);
      } else if (bks.length === 0) {
        setSelectedSlot('');
      }
    });

    return () => unsubscribe();
  }, [templeId]);

  const booking = upcomingBookings.find(b => b.id === selectedSlot);

  useEffect(() => {
    if (streamState === 'live') {
      // Start duration timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);

      // Start viewers simulation
      const baseViewers = booking ? 0 : 12;
      viewersRef.current = setInterval(() => {
        setViewers(prev => {
          if (prev === null) return baseViewers;
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const nextVal = prev + delta;
          return nextVal < 1 ? 1 : nextVal;
        });
      }, 5000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (viewersRef.current) clearInterval(viewersRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (viewersRef.current) clearInterval(viewersRef.current);
    };
  }, [streamState, booking]);

  const handleStartStream = async () => {
    if (!booking) return;

    try {
      const streamId = `stream_${Date.now()}`;
      
      // Update booking status
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'IN_PROGRESS',
        streamId: streamId,
        streamStatus: 'LIVE'
      });

      // Create stream document
      await setDoc(doc(db, 'liveStreams', streamId), {
        streamId,
        bookingId: booking.id,
        templeId: booking.templeId,
        poojaId: booking.poojaId,
        streamUrl: `rtmp://live.doshanivarana.com/app/${streamId}`,
        status: 'LIVE',
        createdAt: serverTimestamp()
      });

      // Generate System Event
      await setDoc(doc(collection(db, 'systemEvents')), {
        eventType: 'stream.started',
        entityId: streamId,
        entityType: 'stream',
        payload: {
          streamId,
          bookingId: booking.id,
          templeId: booking.templeId,
          userId: booking.userId
        },
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      // Audit Log
      await setDoc(doc(collection(db, 'auditLogs')), {
        action: 'STREAM_STARTED',
        entityId: streamId,
        entityType: 'stream',
        performedBy: templeId,
        timestamp: serverTimestamp(),
        details: `Stream ${streamId} started for booking ${booking.id}`
      });

      setActiveStreamId(streamId);
      setViewers(12);
      setStreamHealth('Excellent');
      setStreamState('live');
      setNotification('Live broadcast started successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to start stream');
    }
  };

  const handleStopStream = () => {
    setStreamState('ended');
    setShowFinishedModal(true);
  };

  const handleRestartStream = () => {
    setStreamState('idle');
    setElapsedSeconds(0);
    setViewers(null);
    setStreamHealth('—');
    setActiveStreamId(null);
    setNotification('Stream reset to idle. Ready to restart.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setNotification(`${label} copied to clipboard!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleModalSubmit = async (notify: boolean) => {
    setShowFinishedModal(false);
    if (!booking || !activeStreamId) return;

    try {
      // Update stream status
      await updateDoc(doc(db, 'liveStreams', activeStreamId), {
        status: 'ENDED',
        endedAt: serverTimestamp()
      });

      // Update booking status
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'COMPLETED',
        streamStatus: 'ENDED',
        recordingStatus: notify ? 'Available' : 'Processing'
      });

      // Generate System Event
      await setDoc(doc(collection(db, 'systemEvents')), {
        eventType: 'stream.ended',
        entityId: activeStreamId,
        entityType: 'stream',
        payload: {
          streamId: activeStreamId,
          bookingId: booking.id,
          templeId: booking.templeId,
          userId: booking.userId
        },
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      // Audit Log
      await setDoc(doc(collection(db, 'auditLogs')), {
        action: 'STREAM_ENDED',
        entityId: activeStreamId,
        entityType: 'stream',
        performedBy: templeId,
        timestamp: serverTimestamp(),
        details: `Stream ${activeStreamId} ended for booking ${booking.id}`
      });

      if (notify) {
        setNotification('Devotees notified with the recording link!');
      } else {
        setNotification('Recording saved for review.');
      }
      setTimeout(() => setNotification(null), 3500);
      setStreamState('idle');
      setElapsedSeconds(0);
      setActiveStreamId(null);
      
    } catch (e) {
      console.error(e);
      alert('Failed to end stream properly');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      <PageHeader title="Live Stream Control" />
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <p className="text-body-md text-on-surface-variant font-medium">Manage live pooja broadcasts and equipment statuses</p>
      </div>

      {/* Slot Selector Bar */}
      <section className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] p-6 mb-6">
        <label className="block text-label-md text-on-surface-variant font-bold uppercase tracking-wider mb-2">
          Select Pooja Slot to Stream
        </label>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 w-full">
            <select 
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              disabled={streamState !== 'idle'}
              className="w-full appearance-none bg-surface border border-primary/30 rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 font-semibold cursor-pointer disabled:opacity-50"
            >
              {upcomingBookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.poojaName} — {b.id} at {b.scheduledDate} ({b.currentBookings || 1} Bookings)
                </option>
              ))}
              {upcomingBookings.length === 0 && (
                <option value="">No upcoming pooja bookings</option>
              )}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Pre-Stream Checklist */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-6 border-b border-outline-variant/30 pb-2">
              Pre-Stream Checklist
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <p className="text-button text-on-surface font-bold">Pujari Assigned</p>
                  <p className="text-body-sm text-on-surface-variant font-medium">{booking ? booking.priestName || 'Assigned' : 'None'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-red-50 -mx-2 p-2 rounded-lg border border-red-100">
                <span className="material-symbols-outlined text-red-600">warning</span>
                <div>
                  <p className="text-button text-red-700 font-bold">Internet Connection</p>
                  <p className="text-body-sm text-red-600 font-semibold">Signal Checked — Status unstable</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <p className="text-button text-on-surface font-bold">Scheduled Time</p>
                  <p className="text-body-sm text-on-surface-variant font-medium">{booking ? booking.scheduledDate : 'N/A'}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Stream Status Control Panel */}
        <div className="lg:col-span-8 bg-[#1A1A2E] rounded-xl shadow-lg border border-[#2D2D4A] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="z-10 flex flex-col items-center w-full max-w-md">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3.5 h-3.5 rounded-full ${
                streamState === 'live' 
                  ? 'bg-red-500 animate-pulse' 
                  : streamState === 'ended' 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-500'
              }`}></div>
              <span className={`font-mono text-headline-sm font-bold tracking-widest ${
                streamState === 'live' 
                  ? 'text-red-500' 
                  : streamState === 'ended' 
                    ? 'text-yellow-500' 
                    : 'text-gray-400'
              }`}>
                {streamState.toUpperCase()}
              </span>
            </div>

            {/* Timer Display */}
            <div className="font-display text-[48px] leading-[56px] text-white mb-8 font-mono tracking-wider">
              {formatTime(elapsedSeconds)}
            </div>

            {/* Live Stats */}
            <div className="flex justify-center gap-8 w-full mb-8 border-y border-[#2D2D4A] py-4 font-semibold text-white">
              <div className="text-center flex-1">
                <p className="text-label-md text-gray-400 uppercase tracking-wider">Viewers</p>
                <p className="text-headline-sm mt-1">{viewers !== null ? viewers : '—'}</p>
              </div>
              <div className="w-px bg-[#2D2D4A]"></div>
              <div className="text-center flex-1">
                <p className="text-label-md text-gray-400 uppercase tracking-wider">Health</p>
                <p className={`text-headline-sm mt-1 ${streamHealth === 'Excellent' ? 'text-green-400' : 'text-gray-400'}`}>
                  {streamHealth}
                </p>
              </div>
              <div className="w-px bg-[#2D2D4A]"></div>
              <div className="text-center flex-1">
                <p className="text-label-md text-gray-400 uppercase tracking-wider">Source</p>
                <p className="text-headline-sm mt-1">{streamState === 'live' ? 'RTMP' : '—'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-4 font-bold">
              {streamState !== 'live' ? (
                <button 
                  onClick={handleStartStream}
                  disabled={!booking || streamState === 'ended'}
                  className="w-full bg-primary hover:bg-[#b04b00] disabled:opacity-50 text-on-primary text-headline-sm py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-transform shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                  Start Broadcast Live
                </button>
              ) : (
                <button 
                  onClick={handleStopStream}
                  className="w-full bg-[#ea4335] hover:bg-[#c5221f] text-white text-headline-sm py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-transform shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[28px]">stop</span>
                  Stop Broadcast
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Stream Setup Accordion */}
      <section className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] mt-6 overflow-hidden">
        <button 
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group cursor-pointer font-bold"
        >
          <h4 className="font-display text-headline-sm text-on-surface group-hover:text-primary transition-colors">
            Stream Credentials &amp; Setup Info
          </h4>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
        
        {isAccordionOpen && (
          <div className="px-6 pb-6 pt-4 border-t border-outline-variant/30 bg-surface-bright/50 font-medium">
            <div className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                  RTMP Server URL
                </label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value="rtmp://live.doshanivarana.com/app/"
                    className="flex-1 bg-surface border border-outline-variant rounded-lg p-2.5 text-body-sm font-mono"
                  />
                  <button 
                    onClick={() => handleCopy('rtmp://live.doshanivarana.com/app/', 'RTMP URL')}
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Finished Broadcast Confirmation Dialog */}
      {showFinishedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 border border-[#F0E6D2] shadow-2xl font-sans">
            <div className="flex items-center gap-3 text-green-600 mb-4">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
              <h3 className="font-display text-headline-sm text-on-surface font-bold">Broadcast Completed</h3>
            </div>
            
            <p className="text-body-md text-on-surface-variant font-medium mb-6">
              The live stream has ended. Would you like to notify devotees that the stream has ended and the recording will be processed?
            </p>

            <div className="flex gap-3 justify-end font-semibold">
              <button 
                onClick={() => handleModalSubmit(false)}
                className="px-6 py-2 border border-outline-variant text-on-surface rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                No
              </button>
              <button 
                onClick={() => handleModalSubmit(true)}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#b04b00] transition-colors shadow-sm cursor-pointer"
              >
                Yes, Notify
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
