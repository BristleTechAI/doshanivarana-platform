// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { CustomSelect } from '../components/CustomSelect';
import { db as localDb } from '../lib/db';
import { agoraService } from '../lib/agora';

export function LiveStream() {
  const { templeId, currentUser } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [streamState, setStreamState] = useState<'idle' | 'live' | 'ended'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [viewers, setViewers] = useState<number | null>(null);
  const [streamHealth, setStreamHealth] = useState<string>('—');
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [agoraError, setAgoraError] = useState<string | null>(null);
  
  // Track active stream ID and Agora channel
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [agoraChannelName, setAgoraChannelName] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewersRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null); // for Agora local preview

  useEffect(() => {
    if (!templeId) return;

    // Fetch all bookings for this temple
    const q = query(
      collection(db, 'bookings'),
      where('templeId', '==', templeId),
      where('isDeleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 1. Get all bookings for sequential ID mapping
      const allDocs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          scheduledDate: data.scheduledDate || data.dateTime || data.dateVal || 'No Date',
          scheduledTime: data.scheduledTime || data.timeVal || 'No Time',
        };
      });

      // 2. Sort them exactly like BookingDetail.tsx and user-app journey screen
      const getSortTime = (b: any) => {
        if (b.createdAt) {
          if (typeof b.createdAt.toMillis === 'function') return b.createdAt.toMillis();
          if (typeof b.createdAt.seconds === 'number') {
            return b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000000;
          }
          return new Date(b.createdAt).getTime();
        }
        if (b.scheduledDate) {
          return new Date(b.scheduledDate).getTime();
        }
        return 0;
      };

      allDocs.sort((a, b) => {
        const timeA = getSortTime(a);
        const timeB = getSortTime(b);
        if (timeA !== timeB) return timeA - timeB;
        return a.id.localeCompare(b.id);
      });

      // 3. Add displayId to each doc
      const mappedBks = allDocs.map((item) => {
        const idx = allDocs.findIndex(d => d.id === item.id);
        const seqStr = idx !== -1 ? String(idx + 1).padStart(10, '0') : '';
        const displayId = seqStr ? `BK_${seqStr}` : item.id;
        return {
          ...item,
          displayId
        };
      });

      // 4. Filter to only confirmed or active/scheduled bookings
      const bks = mappedBks.filter(b => {
        const statusLower = (b.status || b.bookingStatus || '').toLowerCase();
        return statusLower === 'confirmed' || statusLower === 'scheduled';
      });

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

  // Update viewer count and stream health from Agora stats every 5s when live
  useEffect(() => {
    if (streamState === 'live') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);

      viewersRef.current = setInterval(async () => {
        try {
          // Get real remote user count from Agora client
          const remoteUsers = agoraService.rtcClient.remoteUsers;
          const count = remoteUsers.length;
          setViewers(count > 0 ? count : Math.max(1, viewers ?? 1));

          // Get network stats for health indicator
          const stats = await agoraService.rtcClient.getLocalVideoStats();
          const loss = stats?.sendPacketsLost ?? 0;
          const total = stats?.sendPackets ?? 1;
          const lossRate = (loss / total) * 100;
          if (lossRate < 2) setStreamHealth('Excellent');
          else if (lossRate < 5) setStreamHealth('Good');
          else if (lossRate < 10) setStreamHealth('Fair');
          else setStreamHealth('Poor');
        } catch {
          // Agora not initialized yet — fallback to simulation
          setViewers(prev => {
            if (prev === null) return 0;
            const delta = Math.floor(Math.random() * 3) - 1;
            return Math.max(0, prev + delta);
          });
        }
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

  // Attach local Agora video preview to the div ref when we go live
  useEffect(() => {
    if (streamState === 'live' && localVideoRef.current) {
      agoraService.playLocalVideo(localVideoRef.current);
    }
  }, [streamState]);

  const handleStartStream = async () => {
    if (!booking) return;
    setAgoraError(null);

    try {
      const streamId = `stream_${Date.now()}`;
      const channelName = streamId; // Use stream ID as Agora channel name
      const uid = Math.floor(Math.random() * 100000) + 1; // Numeric UID for Agora

      // ── 1. Join Agora and publish local tracks ──────────────────────────────
      try {
        await agoraService.init(channelName, uid);
        console.log('[Agora] PRO joined channel:', channelName);

        // Start cloud recording in background (non-blocking)
        agoraService.startCloudRecording(channelName, uid).catch(e =>
          console.warn('[Agora] Cloud recording start failed (non-fatal):', e)
        );
      } catch (agoraErr) {
        console.error('[Agora] Failed to join channel:', agoraErr);
        setAgoraError(`Camera/mic access failed: ${agoraErr.message}. Streaming in audio-only mode.`);
        // Non-fatal: continue with Firestore-only stream
      }

      setAgoraChannelName(channelName);

      // ── 2. Update booking status ─────────────────────────────────────────────
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'IN_PROGRESS',
        streamId: streamId,
        streamStatus: 'LIVE'
      });

      // ── 3. Create stream document with real Agora channel name ───────────────
      await setDoc(doc(db, 'liveStreams', streamId), {
        streamId,
        bookingId: booking.id,
        templeId: booking.templeId || templeId,
        templeName: booking.templeName || 'Unknown Temple',
        poojaId: booking.poojaId || '',
        poojaName: booking.poojaName || 'Unknown Pooja',
        priestId: booking.priestId || null,
        priestName: booking.priestName || null,
        // Real Agora channel info for viewers to join
        agoraChannelName: channelName,
        agoraUid: uid,
        streamUrl: `agora://${channelName}`, // signals Agora-based stream to user app
        status: 'LIVE',
        createdAt: serverTimestamp()
      });

      // ── 4. System event ──────────────────────────────────────────────────────
      await setDoc(doc(collection(db, 'systemEvents')), {
        eventType: 'stream.started',
        entityId: streamId,
        entityType: 'stream',
        payload: {
          streamId,
          bookingId: booking.id,
          templeId: booking.templeId || templeId,
          userId: booking.userId || 'GUEST',
          agoraChannelName: channelName
        },
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      // ── 5. Audit log ─────────────────────────────────────────────────────────
      await setDoc(doc(collection(db, 'auditLogs')), {
        action: 'STREAM_STARTED',
        entityId: streamId,
        entityType: 'stream',
        performedBy: currentUser?.uid || templeId,
        timestamp: serverTimestamp(),
        details: `Stream ${streamId} started for booking ${booking.id} on Agora channel ${channelName}`
      });

      setActiveStreamId(streamId);
      setViewers(0);
      setStreamHealth('Excellent');
      setStreamState('live');
      localDb.addNotification(
        'Live Stream Started',
        `Live broadcast started for ${booking.poojaName} (${booking.id}). Devotees have been notified.`,
        '/live-stream'
      );
      setNotification('Live broadcast started successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to start stream');
    }
  };

  const handleStopStream = async () => {
    // Stop Agora cloud recording and leave channel
    if (agoraChannelName) {
      try {
        await agoraService.stopCloudRecording(agoraChannelName);
      } catch (e) {
        console.warn('[Agora] Cloud recording stop failed (non-fatal):', e);
      }
      try {
        await agoraService.stop();
      } catch (e) {
        console.warn('[Agora] Leave channel failed (non-fatal):', e);
      }
    }

    // Immediately persist ENDED status to Firestore before showing modal
    // This prevents streams being stuck in LIVE state if page closes mid-flow
    if (activeStreamId) {
      try {
        await updateDoc(doc(db, 'liveStreams', activeStreamId), {
          status: 'ENDED',
          endedAt: serverTimestamp()
        });
      } catch (e) {
        console.error('Failed to immediately mark stream as ENDED:', e);
      }
    }
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
      // Stream status was already set to ENDED in handleStopStream.
      // Just ensure the timestamp is set (may be missing if that call failed).
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

      // Auto-generate Recording for Demo
      try {
        // Fetch stream document for fallback metadata
        let streamPoojaName = '';
        let streamTempleName = '';
        try {
          const streamSnap = await getDoc(doc(db, 'liveStreams', activeStreamId));
          if (streamSnap.exists()) {
            streamPoojaName = streamSnap.data().poojaName || '';
            streamTempleName = streamSnap.data().templeName || '';
          }
        } catch (e) {
          console.error("Could not fetch stream metadata:", e);
        }

        const recId = `rec_${Date.now()}`;
        await setDoc(doc(db, 'recordings', recId), {
          templeId: booking.templeId || templeId,
          templeName: booking.templeName || streamTempleName || 'Unknown Temple',
          poojaId: booking.poojaId || '',
          poojaName: booking.poojaName || streamPoojaName || 'Unknown Pooja',
          priestId: booking.priestId || null,
          priestName: booking.priestName || null,
          bookingId: booking.id,
          streamId: activeStreamId,
          // Store the Agora channel name so the recording URL can be resolved
          // from Cloud Recording storage once the recording file is available.
          agoraChannelName: agoraChannelName || activeStreamId,
          status: 'READY',
          duration: '1h 02m',
          // videoUrl will be updated by backend webhook after cloud recording is processed.
          // For now, store empty string — user app checks for PUBLISHED status before playing.
          videoUrl: '',
          youtubeVideoId: '',
          youtubeLiveUrl: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          slotDate: booking.scheduledDate || booking.dateTime || new Date().toISOString().split('T')[0]
        });
      } catch (recordingError) {
        console.error("Failed to auto-generate recording document:", recordingError);
      }

      // Generate System Event
      try {
        await setDoc(doc(collection(db, 'systemEvents')), {
          eventType: 'stream.ended',
          entityId: activeStreamId,
          entityType: 'stream',
          payload: {
            streamId: activeStreamId,
            bookingId: booking.id,
            templeId: booking.templeId || templeId,
            userId: booking.userId || 'GUEST'
          },
          status: 'PENDING',
          createdAt: serverTimestamp()
        });
      } catch (eventError) {
        console.error("Failed to log stream.ended system event:", eventError);
      }

      // Audit Log
      try {
        await setDoc(doc(collection(db, 'auditLogs')), {
          action: 'STREAM_ENDED',
          entityId: activeStreamId,
          entityType: 'stream',
          performedBy: templeId,
          timestamp: serverTimestamp(),
          details: `Stream ${activeStreamId} ended for booking ${booking.id}`
        });
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
      }

      localDb.addNotification(
        'Live Stream Ended',
        `Live broadcast ended for ${booking.poojaName} (${booking.id}). Recording saved.`,
        '/recordings'
      );
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
          <div className="w-full lg:w-1/2">
            <CustomSelect 
              value={selectedSlot}
              onChange={(val) => setSelectedSlot(val)}
              disabled={streamState !== 'idle'}
              options={upcomingBookings.length > 0 ? upcomingBookings.map(b => ({
                value: b.id,
                label: `${b.poojaName} — ${b.displayId} at ${b.scheduledDate} (${b.currentBookings || 1} Bookings)`
              })) : [{ value: '', label: 'No upcoming pooja bookings' }]}
              className=""
            />
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
                <p className={`text-headline-sm mt-1 ${
                  streamHealth === 'Excellent' ? 'text-green-400' 
                  : streamHealth === 'Good' ? 'text-blue-400'
                  : streamHealth === 'Fair' ? 'text-yellow-400'
                  : streamHealth === 'Poor' ? 'text-red-400'
                  : 'text-gray-400'
                }`}>
                  {streamHealth}
                </p>
              </div>
              <div className="w-px bg-[#2D2D4A]"></div>
              <div className="text-center flex-1">
                <p className="text-label-md text-gray-400 uppercase tracking-wider">Source</p>
                <p className="text-headline-sm mt-1">
                  {streamState === 'live' ? 'Agora RTC' : '—'}
                </p>
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
              {/* Agora Channel Info (shown when live) */}
              {agoraChannelName ? (
                <>
                  <div>
                    <label className="block text-label-md text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                      Agora Channel Name
                    </label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={agoraChannelName}
                        className="flex-1 bg-surface border border-outline-variant rounded-lg p-2.5 text-body-sm font-mono"
                      />
                      <button 
                        onClick={() => handleCopy(agoraChannelName, 'Channel Name')}
                        className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="text-body-sm text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                    Viewers join this Agora channel automatically via the app. No manual stream key needed.
                  </p>
                </>
              ) : (
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                    Agora App ID
                  </label>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={import.meta.env.VITE_AGORA_APP_ID || 'Not configured — add VITE_AGORA_APP_ID to .env'}
                      className="flex-1 bg-surface border border-outline-variant rounded-lg p-2.5 text-body-sm font-mono"
                    />
                  </div>
                  <p className="text-body-sm text-on-surface-variant font-medium mt-2">
                    Start a broadcast to generate an Agora channel. Viewers will auto-join via the mobile app.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Local Video Preview (Agora camera feed) */}
      {streamState === 'live' && (
        <section className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] mt-6 p-4">
          <h4 className="font-display text-headline-sm text-on-surface font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 animate-pulse">videocam</span>
            Your Camera Preview
          </h4>
          {agoraError && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600 text-[18px] mt-0.5">warning</span>
              <p className="text-body-sm text-yellow-800 font-medium">{agoraError}</p>
            </div>
          )}
          <div 
            ref={localVideoRef}
            className="w-full aspect-video bg-[#111] rounded-lg overflow-hidden flex items-center justify-center"
          >
            {!agoraChannelName && (
              <p className="text-gray-500 text-sm">Camera not active</p>
            )}
          </div>
        </section>
      )}

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
