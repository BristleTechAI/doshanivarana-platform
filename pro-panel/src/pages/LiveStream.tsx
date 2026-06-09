import { useState, useEffect, useRef } from 'react';
import { db, type Booking, type Recording } from '../lib/db';

export function LiveStream() {
  const initialBookings = db.getBookings().filter(b => b.tab === 'upcoming');
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>(initialBookings);
  const [selectedSlot, setSelectedSlot] = useState(initialBookings[0]?.id || '');
  const [streamState, setStreamState] = useState<'idle' | 'live' | 'ended'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [viewers, setViewers] = useState<number | null>(null);
  const [streamHealth, setStreamHealth] = useState<string>('—');
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewersRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const booking = upcomingBookings.find(b => b.id === selectedSlot) || upcomingBookings[0];

  useEffect(() => {
    if (streamState === 'live') {
      // Start duration timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);

      // Start viewers simulation
      const baseViewers = booking ? booking.currentBookings : 12;
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

  const handleStartStream = () => {
    if (booking) {
      db.updateBooking({ ...booking, streamStatus: 'In Progress' });
    }
    const baseViewers = booking ? booking.currentBookings : 12;
    setViewers(baseViewers);
    setStreamHealth('Excellent');
    setStreamState('live');
    setNotification('Live broadcast started successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStopStream = () => {
    if (booking) {
      db.updateBooking({ ...booking, streamStatus: 'Ended', recordingStatus: 'Processing' });
    }
    setStreamState('ended');
    setShowFinishedModal(true);
  };

  const handleRestartStream = () => {
    if (booking) {
      db.updateBooking({ ...booking, streamStatus: 'Not Started' });
    }
    setStreamState('idle');
    setElapsedSeconds(0);
    setViewers(null);
    setStreamHealth('—');
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

  const handleModalSubmit = (notify: boolean) => {
    setShowFinishedModal(false);
    if (booking) {
      db.updateBooking({ 
        ...booking, 
        recordingStatus: notify ? 'Available' : 'Processing',
        tab: 'completed'
      });

      // Save recording to database
      const newRec = {
        id: String(db.getRecordings().length + 1),
        poojaName: booking.poojaName,
        slotDate: booking.dateTime.split(',')[0],
        duration: formatTime(elapsedSeconds),
        autoSaved: 'Yes' as const,
        status: (notify ? 'Published' : 'Ready to Publish') as Recording['status'],
        bookingsCount: booking.currentBookings
      };
      const updatedRecordings = [newRec, ...db.getRecordings()];
      db.saveRecordings(updatedRecordings);
    }

    if (notify) {
      setNotification('Devotees notified with the recording link!');
    } else {
      setNotification('Recording saved for review.');
    }
    setTimeout(() => setNotification(null), 3500);
    setStreamState('idle');
    setElapsedSeconds(0);
    
    // Refresh list of upcoming bookings since this one is now completed
    const list = db.getBookings().filter(b => b.tab === 'upcoming');
    setUpcomingBookings(list);
    if (list.length > 0) {
      setSelectedSlot(list[0].id);
    } else {
      setSelectedSlot('');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-headline-lg text-on-surface font-semibold">Live Stream Control</h1>
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
              className="w-full appearance-none bg-surface border border-primary/30 rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 font-semibold cursor-pointer"
            >
              {upcomingBookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.poojaName} — {b.id} at {b.dateTime} ({b.currentBookings} Bookings)
                </option>
              ))}
              {upcomingBookings.length === 0 && (
                <option value="">No upcoming pooja bookings</option>
              )}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap font-semibold">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-800 text-[11px] border border-yellow-200">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Auto-selected: Next scheduled slot
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-[11px] border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px]">info</span>
              {booking ? booking.currentBookings : 0} devotees will be notified
            </span>
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
                  <p className="text-body-sm text-on-surface-variant font-medium">{booking ? booking.pujari : 'None'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <p className="text-button text-on-surface font-bold">Confirmed Bookings</p>
                  <p className="text-body-sm text-on-surface-variant font-medium">
                    {booking ? `${booking.currentBookings} devotees booked` : '0 devotees booked'}
                  </p>
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
                  <p className="text-body-sm text-on-surface-variant font-medium">{booking ? booking.dateTime : 'N/A'}</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="mt-6 bg-red-50 text-red-800 p-3 rounded-lg flex items-start gap-2 border border-red-100 font-medium">
            <span className="material-symbols-outlined text-red-600 shrink-0">warning</span>
            <p className="text-body-sm">Your internet connection speed fluctuates. Quality may be affected.</p>
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
                  className="w-full bg-primary hover:bg-[#b04b00] text-on-primary text-headline-sm py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                  Start Broadcast Live
                </button>
              ) : (
                <button 
                  onClick={handleStopStream}
                  className="w-full bg-[#ea4335] hover:bg-[#c5221f] text-white text-headline-sm py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[28px]">stop</span>
                  Stop Broadcast
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 mt-2">
                <button 
                  disabled={streamState !== 'live'}
                  onClick={handleStopStream}
                  className={`py-3 px-4 rounded-full flex items-center justify-center gap-2 border border-transparent font-medium ${
                    streamState === 'live' 
                      ? 'bg-[#2D2D4A] text-white hover:bg-[#3d3d5c] cursor-pointer' 
                      : 'bg-[#1A1A2E] text-gray-600 border-[#2D2D4A] cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="material-symbols-outlined">stop</span>
                  Stop Stream
                </button>
                <button 
                  disabled={streamState === 'idle'}
                  onClick={handleRestartStream}
                  className={`py-3 px-4 rounded-full flex items-center justify-center gap-2 border font-medium ${
                    streamState !== 'idle'
                      ? 'bg-transparent text-white border-[#2D2D4A] hover:bg-[#2D2D4A]/30 cursor-pointer'
                      : 'bg-transparent text-gray-600 border-[#2D2D4A] cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Reset Stream
                </button>
              </div>
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
            <p className="text-body-sm text-on-surface-variant mb-4">
              Enter these settings in your RTMP Encoder (OBS, vMix, or mobile streaming application) to broadcast.
            </p>
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
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span> Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-label-md text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                  Stream Key (Private)
                </label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    type="password"
                    value="live_2901385_svt_satya"
                    className="flex-1 bg-surface border border-outline-variant rounded-lg p-2.5 text-body-sm font-mono"
                  />
                  <button 
                    onClick={() => handleCopy('live_2901385_svt_satya', 'Stream Key')}
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span> Copy
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/30 text-xs space-y-2 mt-2">
                <p className="font-bold text-on-surface uppercase tracking-wider">Recommended Encoder Settings</p>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant font-semibold">
                  <li>Resolution: 1920x1080 (1080p) or 1280x720 (720p)</li>
                  <li>Video Bitrate: 3500 - 4500 Kbps</li>
                  <li>Audio Bitrate: 128 Kbps (Stereo)</li>
                  <li>Keyframe Interval: 2 seconds</li>
                  <li>Rate Control: CBR</li>
                </ul>
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
              The live stream has ended. The system has successfully saved the high-definition recording file. Would you like to publish and notify the devotees immediately?
            </p>

            <div className="flex gap-3 justify-end font-semibold">
              <button 
                onClick={() => handleModalSubmit(false)}
                className="px-6 py-2 border border-outline-variant text-on-surface rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                No, Review Recording First
              </button>
              <button 
                onClick={() => handleModalSubmit(true)}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#b04b00] transition-colors shadow-sm cursor-pointer"
              >
                Yes, Notify Devotees
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
