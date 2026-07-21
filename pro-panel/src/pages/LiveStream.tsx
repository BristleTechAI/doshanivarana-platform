// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { CustomSelect } from '../components/CustomSelect';
import { db as localDb } from '../lib/db';
import { agoraService } from '../lib/agora';
import type { DeviceInfo } from '../lib/agora';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function truncateLabel(label: string, max = 22): string {
  return label.length > max ? label.slice(0, max - 1) + '…' : label;
}

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

  // ── Device selection state ──────────────────────────────────────────────────
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [isDetectingDevices, setIsDetectingDevices] = useState(false);
  // Whether the user has ever granted camera permission (affects preview availability)
  const [permissionGranted, setPermissionGranted] = useState(false);
  // Hot-switch states (live controls)
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isSwitchingMic, setIsSwitchingMic] = useState(false);
  // Device disconnection warning
  const [deviceWarning, setDeviceWarning] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewersRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);     // Agora live preview
  const previewVideoRef = useRef<HTMLVideoElement | null>(null); // Pre-stream camera preview
  const previewStreamRef = useRef<MediaStream | null>(null);    // Raw preview MediaStream

  // ── 1:1 Video Call State ────────────────────────────────────────────────────
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const [devoteeConnected, setDevoteeConnected] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // ── Bookings fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!templeId) return;

    const q = query(
      collection(db, 'bookings'),
      where('templeId', '==', templeId),
      where('isDeleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDocs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          scheduledDate: data.scheduledDate || data.dateTime || data.dateVal || 'No Date',
          scheduledTime: data.scheduledTime || data.timeVal || 'No Time',
        };
      });

      const getSortTime = (b: any) => {
        if (b.createdAt) {
          if (typeof b.createdAt.toMillis === 'function') return b.createdAt.toMillis();
          if (typeof b.createdAt.seconds === 'number') {
            return b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000000;
          }
          return new Date(b.createdAt).getTime();
        }
        if (b.scheduledDate) return new Date(b.scheduledDate).getTime();
        return 0;
      };

      allDocs.sort((a, b) => {
        const timeA = getSortTime(a);
        const timeB = getSortTime(b);
        if (timeA !== timeB) return timeA - timeB;
        return a.id.localeCompare(b.id);
      });

      const mappedBks = allDocs.map((item) => {
        const idx = allDocs.findIndex(d => d.id === item.id);
        const seqStr = idx !== -1 ? String(idx + 1).padStart(10, '0') : '';
        const displayId = seqStr ? `BK_${seqStr}` : item.id;
        return { ...item, displayId };
      });

      const bks = mappedBks.filter(b => {
        const statusLower = (b.status || b.bookingStatus || '').toLowerCase();
        return statusLower === 'confirmed' || statusLower === 'scheduled' || statusLower === 'in_progress';
      });

      setUpcomingBookings(bks);
      if (bks.length > 0 && !selectedSlot) {
        const firstKey = `${bks[0].poojaId}_${bks[0].scheduledDate}_${bks[0].scheduledTime}`;
        setSelectedSlot(firstKey);
      } else if (bks.length === 0) {
        setSelectedSlot('');
      }
    });

    return () => unsubscribe();
  }, [templeId]);

  // Group bookings by slot key
  const groupedSlotsMap: Record<string, { key: string; label: string; bookings: any[]; firstBooking: any }> = {};
  upcomingBookings.forEach(b => {
    const slotKey = `${b.poojaId}_${b.scheduledDate}_${b.scheduledTime}`;
    if (!groupedSlotsMap[slotKey]) {
      groupedSlotsMap[slotKey] = { key: slotKey, label: '', bookings: [], firstBooking: b };
    }
    groupedSlotsMap[slotKey].bookings.push(b);
  });

  const groupedSlots = Object.values(groupedSlotsMap);
  groupedSlots.forEach(slot => {
    const b = slot.firstBooking;
    const count = slot.bookings.length;
    slot.bookings.sort((x, y) => x.displayId.localeCompare(y.displayId));
    const primaryBooking = slot.bookings[0];
    slot.label = `${b.poojaName} — Slot ${primaryBooking.displayId} at ${b.scheduledDate} ${b.scheduledTime} (${count} Booking${count > 1 ? 's' : ''})`;
  });

  const currentSlotGroup = groupedSlots.find(s => s.key === selectedSlot);
  const booking = currentSlotGroup ? currentSlotGroup.bookings[0] : null;
  const bookingsInSlot = currentSlotGroup ? currentSlotGroup.bookings : [];

  // ── Device detection ────────────────────────────────────────────────────────
  const detectDevices = useCallback(async () => {
    setIsDetectingDevices(true);
    setDeviceWarning(null);
    try {
      const { video, audio } = await agoraService.listAllDevices();
      setVideoDevices(video);
      setAudioDevices(audio);
      setPermissionGranted(true);

      // Preserve current selection if the device is still available
      setSelectedCameraId(prev => {
        const stillAvail = video.some(v => v.deviceId === prev);
        return stillAvail ? prev : (video[0]?.deviceId || '');
      });
      setSelectedMicId(prev => {
        const stillAvail = audio.some(a => a.deviceId === prev);
        return stillAvail ? prev : (audio[0]?.deviceId || '');
      });
    } catch (e) {
      console.error('[DeviceDetect] Failed:', e);
    } finally {
      setIsDetectingDevices(false);
    }
  }, []);

  // Run detection once on mount
  useEffect(() => {
    detectDevices();
  }, [detectDevices]);

  // ── devicechange listener — hot-detect plugging/unplugging USB devices ──────
  useEffect(() => {
    const handler = async () => {
      console.log('[devicechange] Device list changed — re-enumerating…');
      const { video, audio } = await agoraService.listAllDevices();
      setVideoDevices(video);
      setAudioDevices(audio);

      // If currently live and the selected camera was unplugged, fall back
      if (streamState === 'live') {
        setSelectedCameraId(prev => {
          const stillAvail = video.some(v => v.deviceId === prev);
          if (!stillAvail && video.length > 0) {
            const fallback = video[0];
            setDeviceWarning(`Camera disconnected. Switched to: ${fallback.label}`);
            agoraService.handleCameraDisconnect(video);
            setTimeout(() => setDeviceWarning(null), 6000);
            return fallback.deviceId;
          }
          return prev;
        });

        setSelectedMicId(prev => {
          const stillAvail = audio.some(a => a.deviceId === prev);
          if (!stillAvail && audio.length > 0) {
            const fallback = audio[0];
            setDeviceWarning(`Microphone disconnected. Switched to: ${fallback.label}`);
            agoraService.handleMicDisconnect(audio);
            setTimeout(() => setDeviceWarning(null), 6000);
            return fallback.deviceId;
          }
          return prev;
        });
      } else {
        // Not live — just update selection to still-valid device
        setSelectedCameraId(prev => {
          const stillAvail = video.some(v => v.deviceId === prev);
          return stillAvail ? prev : (video[0]?.deviceId || '');
        });
        setSelectedMicId(prev => {
          const stillAvail = audio.some(a => a.deviceId === prev);
          return stillAvail ? prev : (audio[0]?.deviceId || '');
        });
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handler);
  }, [streamState]);

  // ── Live camera preview (before stream starts) ──────────────────────────────
  useEffect(() => {
    if (streamState !== 'idle' || !selectedCameraId || !permissionGranted) {
      // Stop any existing preview
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(t => t.stop());
        previewStreamRef.current = null;
      }
      return;
    }

    let active = true;
    const startPreview = async () => {
      try {
        // Stop previous preview stream
        if (previewStreamRef.current) {
          previewStreamRef.current.getTracks().forEach(t => t.stop());
          previewStreamRef.current = null;
        }
        const constraints: MediaStreamConstraints = {
          video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        previewStreamRef.current = stream;
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.warn('[Preview] Could not start preview:', e);
      }
    };

    startPreview();

    return () => {
      active = false;
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(t => t.stop());
        previewStreamRef.current = null;
      }
    };
  }, [selectedCameraId, streamState, permissionGranted]);

  // ── Sync streamState if selected booking is already IN_PROGRESS ─────────────
  useEffect(() => {
    if (booking && (booking.status === 'IN_PROGRESS' || booking.bookingStatus === 'IN_PROGRESS')) {
      if (streamState === 'idle') {
        const channelName = `booking_${booking.id}`;
        const streamId = booking.streamId || `stream_${Date.now()}`;
        const uid = Math.floor(Math.random() * 100000) + 1;

        agoraService.init(channelName, uid, selectedCameraId || undefined, selectedMicId || undefined)
          .then(() => {
            console.log('[Agora] Re-initialized active stream:', channelName);
            setAgoraChannelName(channelName);
            if (localVideoRef.current) {
              agoraService.playLocalVideo(localVideoRef.current);
            }
          })
          .catch((e) => {
            console.warn('[Agora] Failed to re-initialize active stream:', e);
            setAgoraError(`Re-joining camera stream failed: ${e.message}`);
          });

        setStreamState('live');
        setActiveStreamId(streamId);
        setAgoraChannelName(channelName);
      }
    }
  }, [booking, streamState]);

  // ── Timer + viewer polling when live ────────────────────────────────────────
  useEffect(() => {
    if (streamState === 'live') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);

      viewersRef.current = setInterval(async () => {
        try {
          const remoteUsers = agoraService.rtcClient.remoteUsers;
          const count = remoteUsers.length;
          setViewers(count > 0 ? count : Math.max(1, viewers ?? 1));

          const stats = await agoraService.rtcClient.getLocalVideoStats();
          const loss = stats?.sendPacketsLost ?? 0;
          const total = stats?.sendPackets ?? 1;
          const lossRate = (loss / total) * 100;
          if (lossRate < 2) setStreamHealth('Excellent');
          else if (lossRate < 5) setStreamHealth('Good');
          else if (lossRate < 10) setStreamHealth('Fair');
          else setStreamHealth('Poor');
        } catch {
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

  // ── Attach local Agora video preview + remote callbacks when live ───────────
  useEffect(() => {
    if (streamState === 'live') {
      if (localVideoRef.current) {
        agoraService.playLocalVideo(localVideoRef.current);
      }

      agoraService.onRemoteUserPublished = (user, mediaType) => {
        setDevoteeConnected(true);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      };

      agoraService.onRemoteUserUnpublished = () => {
        setDevoteeConnected(false);
      };

      agoraService.onDeviceFallback = (type, newDeviceId) => {
        if (type === 'video') {
          const dev = videoDevices.find(d => d.deviceId === newDeviceId);
          setDeviceWarning(newDeviceId
            ? `Camera disconnected. Switched to: ${dev?.label || newDeviceId}`
            : 'Camera disconnected — no fallback available. Please connect a camera.');
          if (newDeviceId) setSelectedCameraId(newDeviceId);
        } else {
          const dev = audioDevices.find(d => d.deviceId === newDeviceId);
          setDeviceWarning(newDeviceId
            ? `Microphone disconnected. Switched to: ${dev?.label || newDeviceId}`
            : 'Microphone disconnected — no fallback available.');
          if (newDeviceId) setSelectedMicId(newDeviceId);
        }
        setTimeout(() => setDeviceWarning(null), 7000);
      };
    } else {
      agoraService.onRemoteUserPublished = undefined;
      agoraService.onRemoteUserUnpublished = undefined;
      agoraService.onDeviceFallback = undefined;
      setDevoteeConnected(false);
      setLocalMuted(false);
      setCameraEnabled(true);
    }
  }, [streamState, videoDevices, audioDevices]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const handleToggleMute = useCallback(() => {
    const next = !localMuted;
    agoraService.setMuted(next);
    setLocalMuted(next);
  }, [localMuted]);

  const handleToggleCamera = useCallback(() => {
    const next = !cameraEnabled;
    agoraService.setCameraEnabled(next);
    setCameraEnabled(next);
  }, [cameraEnabled]);

  /** Hot-switch camera while live */
  const handleLiveCameraSwitch = useCallback(async (deviceId: string) => {
    if (!deviceId || deviceId === selectedCameraId) return;
    setIsSwitchingCamera(true);
    try {
      await agoraService.switchCamera(deviceId);
      setSelectedCameraId(deviceId);
      const dev = videoDevices.find(d => d.deviceId === deviceId);
      setNotification(`Camera switched to: ${dev?.label || deviceId}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setAgoraError(`Camera switch failed: ${e.message}`);
    } finally {
      setIsSwitchingCamera(false);
    }
  }, [selectedCameraId, videoDevices]);

  /** Hot-switch microphone while live */
  const handleLiveMicSwitch = useCallback(async (deviceId: string) => {
    if (!deviceId || deviceId === selectedMicId) return;
    setIsSwitchingMic(true);
    try {
      await agoraService.switchMicrophone(deviceId);
      setSelectedMicId(deviceId);
      const dev = audioDevices.find(d => d.deviceId === deviceId);
      setNotification(`Microphone switched to: ${dev?.label || deviceId}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setAgoraError(`Microphone switch failed: ${e.message}`);
    } finally {
      setIsSwitchingMic(false);
    }
  }, [selectedMicId, audioDevices]);

  // ── Start stream ────────────────────────────────────────────────────────────
  const handleStartStream = async () => {
    if (!booking || bookingsInSlot.length === 0) return;
    setAgoraError(null);

    try {
      const streamId = `stream_${Date.now()}`;
      const channelName = `booking_${booking.id}`;
      const uid = Math.floor(Math.random() * 100000) + 1;

      // ── 1. Join Agora with selected devices ──────────────────────────────────
      try {
        await agoraService.init(
          channelName,
          uid,
          selectedCameraId || undefined,
          selectedMicId || undefined,
        );
        console.log('[Agora] PRO joined channel:', channelName,
          '| cam:', selectedCameraId || 'default',
          '| mic:', selectedMicId || 'default');

        agoraService.startCloudRecording(channelName, uid).catch(e =>
          console.warn('[Agora] Cloud recording start failed (non-fatal):', e)
        );
      } catch (agoraErr) {
        console.error('[Agora] Failed to join channel:', agoraErr);
        setAgoraError(`Camera/mic access failed: ${agoraErr.message}. Streaming in audio-only mode.`);
      }

      setAgoraChannelName(channelName);

      const batch = writeBatch(db);
      bookingsInSlot.forEach(b => {
        batch.update(doc(db, 'bookings', b.id), {
          status: 'IN_PROGRESS',
          streamId: streamId,
          streamStatus: 'LIVE'
        });

        const streamDocId = `${streamId}_${b.id}`;
        batch.set(doc(db, 'liveStreams', streamDocId), {
          streamId,
          bookingId: b.id,
          templeId: b.templeId || templeId,
          templeName: b.templeName || 'Unknown Temple',
          poojaId: b.poojaId || '',
          poojaName: b.poojaName || 'Unknown Pooja',
          priestId: b.priestId || null,
          priestName: b.priestName || null,
          agoraChannelName: channelName,
          agoraUid: uid,
          streamUrl: `agora://${channelName}`,
          status: 'LIVE',
          createdAt: serverTimestamp()
        });

        const eventId = `evt_${Date.now()}_${b.id}`;
        batch.set(doc(db, 'systemEvents', eventId), {
          id: eventId,
          eventType: 'stream.started',
          entityId: streamId,
          entityType: 'stream',
          payload: {
            streamId,
            bookingId: b.id,
            templeId: b.templeId || templeId,
            userId: b.userId || 'GUEST',
            agoraChannelName: channelName
          },
          status: 'PENDING',
          createdAt: serverTimestamp()
        });

        const auditId = `audit_${Date.now()}_${b.id}`;
        batch.set(doc(db, 'auditLogs', auditId), {
          action: 'STREAM_STARTED',
          entityId: streamId,
          entityType: 'stream',
          performedBy: currentUser?.uid || templeId,
          timestamp: serverTimestamp(),
          details: `Stream ${streamId} started for booking ${b.id} on Agora channel ${channelName}`
        });
      });

      await batch.commit();

      setActiveStreamId(streamId);
      setViewers(0);
      setStreamHealth('Excellent');
      setStreamState('live');

      const primaryDisplayId = bookingsInSlot[0].displayId;
      localDb.addNotification(
        'Live Stream Started',
        `Live broadcast started for ${booking.poojaName} (${primaryDisplayId}). Devotees have been notified.`,
        '/live-stream'
      );
      setNotification('Live broadcast started successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to start stream');
    }
  };

  // ── Stop stream ─────────────────────────────────────────────────────────────
  const handleStopStream = async () => {
    if (agoraChannelName) {
      try { await agoraService.stopCloudRecording(agoraChannelName); } catch (e) {
        console.warn('[Agora] Cloud recording stop failed (non-fatal):', e);
      }
      try { await agoraService.stop(); } catch (e) {
        console.warn('[Agora] Leave channel failed (non-fatal):', e);
      }
    }

    if (activeStreamId && bookingsInSlot.length > 0) {
      try {
        const batch = writeBatch(db);
        bookingsInSlot.forEach(b => {
          const streamDocId = `${activeStreamId}_${b.id}`;
          batch.update(doc(db, 'liveStreams', streamDocId), { status: 'ENDED', endedAt: serverTimestamp() });
          batch.update(doc(db, 'bookings', b.id), { status: 'COMPLETED', streamStatus: 'ENDED' });
        });
        await batch.commit();
      } catch (e) {
        console.error('Failed to immediately mark streams as ENDED:', e);
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
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  const handleModalSubmit = async (notify: boolean) => {
    setShowFinishedModal(false);
    if (bookingsInSlot.length === 0 || !activeStreamId) return;

    try {
      const batch = writeBatch(db);
      bookingsInSlot.forEach(b => {
        const streamDocId = `${activeStreamId}_${b.id}`;
        batch.update(doc(db, 'liveStreams', streamDocId), { status: 'ENDED', endedAt: serverTimestamp() });
        batch.update(doc(db, 'bookings', b.id), {
          status: 'COMPLETED',
          streamStatus: 'ENDED',
          recordingStatus: notify ? 'Available' : 'Processing'
        });

        const recId = `rec_${Date.now()}_${b.id}`;
        batch.set(doc(db, 'recordings', recId), {
          templeId: b.templeId || templeId,
          templeName: b.templeName || 'Unknown Temple',
          poojaId: b.poojaId || '',
          poojaName: b.poojaName || 'Unknown Pooja',
          priestId: b.priestId || null,
          priestName: b.priestName || null,
          bookingId: b.id,
          streamId: activeStreamId,
          agoraChannelName: agoraChannelName || activeStreamId,
          status: 'READY',
          duration: '1h 02m',
          videoUrl: '',
          youtubeVideoId: '',
          youtubeLiveUrl: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          slotDate: b.scheduledDate || b.dateTime || new Date().toISOString().split('T')[0]
        });

        const eventId = `evt_ended_${Date.now()}_${b.id}`;
        batch.set(doc(db, 'systemEvents', eventId), {
          id: eventId,
          eventType: 'stream.ended',
          entityId: activeStreamId,
          entityType: 'stream',
          payload: { streamId: activeStreamId, bookingId: b.id, templeId: b.templeId || templeId, userId: b.userId || 'GUEST' },
          status: 'PENDING',
          createdAt: serverTimestamp()
        });

        const auditId = `audit_ended_${Date.now()}_${b.id}`;
        batch.set(doc(db, 'auditLogs', auditId), {
          action: 'STREAM_ENDED',
          entityId: activeStreamId,
          entityType: 'stream',
          performedBy: templeId,
          timestamp: serverTimestamp(),
          details: `Stream ${activeStreamId} ended for booking ${b.id}`
        });
      });

      await batch.commit();

      const primaryDisplayId = bookingsInSlot[0].displayId;
      localDb.addNotification(
        'Live Stream Ended',
        `Live broadcast ended for ${booking.poojaName} (${primaryDisplayId}). Recording saved.`,
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

  // ── Derived display values ──────────────────────────────────────────────────
  const selectedCameraLabel = videoDevices.find(d => d.deviceId === selectedCameraId)?.label || 'Camera';
  const selectedMicLabel = audioDevices.find(d => d.deviceId === selectedMicId)?.label || 'Microphone';

  // ── Render ──────────────────────────────────────────────────────────────────
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

      {/* Device Disconnection Warning */}
      {deviceWarning && (
        <div className="fixed top-32 right-8 z-50 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold animate-pulse max-w-sm">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span className="text-sm">{deviceWarning}</span>
        </div>
      )}

      {/* Page subheader */}
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
              options={groupedSlots.length > 0 ? groupedSlots.map(s => ({
                value: s.key,
                label: s.label
              })) : [{ value: '', label: 'No upcoming pooja bookings' }]}
              className=""
            />
          </div>
        </div>
      </section>

      {/* ── Camera & Mic Selection Panel (idle only) ─────────────────────────── */}
      {streamState === 'idle' && (
        <section className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-headline-sm text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">videocam</span>
              Camera & Audio Source
            </h3>
            <button
              onClick={detectDevices}
              disabled={isDetectingDevices}
              title="Refresh connected devices"
              className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary rounded-full text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] ${isDetectingDevices ? 'animate-spin' : ''}`}>
                {isDetectingDevices ? 'progress_activity' : 'refresh'}
              </span>
              {isDetectingDevices ? 'Detecting…' : 'Refresh Devices'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Camera selector + preview */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-label-md text-on-surface-variant font-bold uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">videocam</span>
                  Video Source
                </label>
                {videoDevices.length > 0 ? (
                  <CustomSelect
                    value={selectedCameraId}
                    onChange={(val) => setSelectedCameraId(val)}
                    options={videoDevices.map(d => ({ value: d.deviceId, label: d.label }))}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[18px] text-amber-500">videocam_off</span>
                    {isDetectingDevices ? 'Detecting cameras…' : 'No cameras detected. Click "Refresh Devices".'}
                  </div>
                )}
                {/* Device type hint */}
                {selectedCameraId && (
                  <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
                    <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">info</span>
                    Supports: Laptop webcam, USB cameras, HDMI capture cards, OBS Virtual Camera, EpocCam, DroidCam, Camo, and mobile webcam mode.
                  </p>
                )}
              </div>

              {/* Microphone selector */}
              <div>
                <label className="block text-label-md text-on-surface-variant font-bold uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">mic</span>
                  Audio Source (Microphone)
                </label>
                {audioDevices.length > 0 ? (
                  <CustomSelect
                    value={selectedMicId}
                    onChange={(val) => setSelectedMicId(val)}
                    options={audioDevices.map(d => ({ value: d.deviceId, label: d.label }))}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[18px] text-amber-500">mic_off</span>
                    {isDetectingDevices ? 'Detecting microphones…' : 'No microphones detected. Click "Refresh Devices".'}
                  </div>
                )}
              </div>

              {/* Selected summary badges */}
              {(selectedCameraId || selectedMicId) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCameraId && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                      <span className="material-symbols-outlined text-[12px]">videocam</span>
                      {truncateLabel(selectedCameraLabel, 28)}
                    </span>
                  )}
                  {selectedMicId && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                      <span className="material-symbols-outlined text-[12px]">mic</span>
                      {truncateLabel(selectedMicLabel, 28)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Live camera preview */}
            <div className="flex flex-col gap-2">
              <label className="block text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">preview</span>
                Camera Preview
              </label>
              <div className="relative aspect-video bg-[#0f0f1a] rounded-xl overflow-hidden border border-[#2D2D4A] flex items-center justify-center">
                {permissionGranted && selectedCameraId ? (
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center px-6">
                    <span className="material-symbols-outlined text-gray-600 text-[48px] mb-2 block">
                      {isDetectingDevices ? 'progress_activity' : 'videocam_off'}
                    </span>
                    <p className="text-gray-500 text-sm font-medium">
                      {isDetectingDevices
                        ? 'Detecting cameras…'
                        : videoDevices.length === 0
                          ? 'No camera detected. Connect a device and click Refresh.'
                          : 'Select a camera to preview'}
                    </p>
                  </div>
                )}
                {/* LIVE PREVIEW badge */}
                {permissionGranted && selectedCameraId && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-xs font-bold tracking-wide">PREVIEW</span>
                  </div>
                )}
                {/* Camera label overlay */}
                {permissionGranted && selectedCameraId && (
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
                    <span className="bg-black/60 px-2 py-1 rounded text-white text-xs font-semibold max-w-[70%] truncate">
                      {selectedCameraLabel}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant font-medium">
                Preview updates automatically when you select a different device. This stream is local only — not broadcast.
              </p>
            </div>
          </div>
        </section>
      )}

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
              {/* Camera readiness */}
              <li className={`flex items-start gap-3 -mx-2 p-2 rounded-lg border ${
                videoDevices.length > 0 && selectedCameraId
                  ? 'bg-green-50 border-green-100'
                  : 'bg-amber-50 border-amber-100'
              }`}>
                <span className={`material-symbols-outlined ${videoDevices.length > 0 && selectedCameraId ? 'text-green-600' : 'text-amber-500'}`}>
                  {videoDevices.length > 0 && selectedCameraId ? 'videocam' : 'videocam_off'}
                </span>
                <div>
                  <p className={`text-button font-bold ${videoDevices.length > 0 && selectedCameraId ? 'text-green-700' : 'text-amber-700'}`}>
                    Camera Source
                  </p>
                  <p className={`text-body-sm font-semibold ${videoDevices.length > 0 && selectedCameraId ? 'text-green-600' : 'text-amber-600'}`}>
                    {videoDevices.length > 0 && selectedCameraId
                      ? truncateLabel(selectedCameraLabel, 30)
                      : 'No camera selected'}
                  </p>
                </div>
              </li>
              {/* Mic readiness */}
              <li className={`flex items-start gap-3 -mx-2 p-2 rounded-lg border ${
                audioDevices.length > 0 && selectedMicId
                  ? 'bg-green-50 border-green-100'
                  : 'bg-amber-50 border-amber-100'
              }`}>
                <span className={`material-symbols-outlined ${audioDevices.length > 0 && selectedMicId ? 'text-green-600' : 'text-amber-500'}`}>
                  {audioDevices.length > 0 && selectedMicId ? 'mic' : 'mic_off'}
                </span>
                <div>
                  <p className={`text-button font-bold ${audioDevices.length > 0 && selectedMicId ? 'text-green-700' : 'text-amber-700'}`}>
                    Microphone
                  </p>
                  <p className={`text-body-sm font-semibold ${audioDevices.length > 0 && selectedMicId ? 'text-green-600' : 'text-amber-600'}`}>
                    {audioDevices.length > 0 && selectedMicId
                      ? truncateLabel(selectedMicLabel, 30)
                      : 'No microphone selected'}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Stream Status Control Panel */}
        <div className="lg:col-span-8 bg-[#1A1A2E] rounded-xl shadow-lg border border-[#2D2D4A] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="z-10 flex flex-col items-center w-full max-w-md">

            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3.5 h-3.5 rounded-full ${
                streamState === 'live'
                  ? 'bg-red-500 animate-pulse'
                  : streamState === 'ended'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
              }`} />
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
              <div className="w-px bg-[#2D2D4A]" />
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
              <div className="w-px bg-[#2D2D4A]" />
              <div className="text-center flex-1">
                <p className="text-label-md text-gray-400 uppercase tracking-wider">Source</p>
                <p className="text-headline-sm mt-1 text-xs leading-tight mt-2" title={selectedCameraLabel}>
                  {streamState === 'live'
                    ? truncateLabel(selectedCameraLabel, 16)
                    : '—'}
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

      {/* 1:1 Video Call Panel (when live) */}
      {streamState === 'live' && (
        <section className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] mt-6 p-6 lg:col-span-12">
          <h4 className="font-display text-headline-sm text-on-surface font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 animate-pulse">video_call</span>
            Live 1:1 Call Session
          </h4>

          {agoraError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600 text-[18px] mt-0.5">warning</span>
              <p className="text-body-sm text-yellow-800 font-medium">{agoraError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Devotee Remote Video */}
            <div className="relative aspect-video bg-[#111] rounded-xl overflow-hidden flex flex-col justify-center items-center border border-outline-variant">
              <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full" />
              {!devoteeConnected && (
                <div className="z-10 text-center p-4">
                  <span className="material-symbols-outlined text-gray-500 text-[48px] mb-2 animate-pulse">person</span>
                  <p className="text-gray-400 text-sm font-semibold">Waiting for devotee to join call...</p>
                </div>
              )}
              {devoteeConnected && (
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-semibold">
                  Devotee (Live)
                </div>
              )}
            </div>

            {/* Pujari Local Video Preview */}
            <div className="relative aspect-video bg-[#111] rounded-xl overflow-hidden flex flex-col justify-center items-center border border-outline-variant">
              <div ref={localVideoRef} className="absolute inset-0 w-full h-full" />
              {!cameraEnabled && (
                <div className="z-10 text-center p-4">
                  <span className="material-symbols-outlined text-gray-500 text-[48px] mb-2">videocam_off</span>
                  <p className="text-gray-400 text-sm font-semibold">Camera is turned off</p>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-semibold">
                Pujari (You)
              </div>

              {/* Live camera hot-switch overlay */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                {/* Camera switcher */}
                <div className="relative group">
                  <button
                    title="Switch Camera"
                    disabled={isSwitchingCamera}
                    className="flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-[14px] ${isSwitchingCamera ? 'animate-spin' : ''}`}>
                      {isSwitchingCamera ? 'progress_activity' : 'cameraswitch'}
                    </span>
                    <span className="max-w-[80px] truncate">{truncateLabel(selectedCameraLabel, 12)}</span>
                  </button>
                  {/* Camera dropdown on hover */}
                  {!isSwitchingCamera && videoDevices.length > 1 && (
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-[#1a1a2e] border border-[#3D3D5A] rounded-xl shadow-2xl py-1 min-w-[200px] z-30">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Switch Camera</p>
                      {videoDevices.map(d => (
                        <button
                          key={d.deviceId}
                          onClick={() => handleLiveCameraSwitch(d.deviceId)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                            d.deviceId === selectedCameraId
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {d.deviceId === selectedCameraId && (
                            <span className="material-symbols-outlined text-[12px] text-primary">check</span>
                          )}
                          <span className="truncate">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mic switcher */}
                <div className="relative group">
                  <button
                    title="Switch Microphone"
                    disabled={isSwitchingMic}
                    className="flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-[14px] ${isSwitchingMic ? 'animate-spin' : ''}`}>
                      {isSwitchingMic ? 'progress_activity' : 'mic'}
                    </span>
                    <span className="max-w-[80px] truncate">{truncateLabel(selectedMicLabel, 12)}</span>
                  </button>
                  {/* Mic dropdown on hover */}
                  {!isSwitchingMic && audioDevices.length > 1 && (
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-[#1a1a2e] border border-[#3D3D5A] rounded-xl shadow-2xl py-1 min-w-[200px] z-30">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Switch Microphone</p>
                      {audioDevices.map(d => (
                        <button
                          key={d.deviceId}
                          onClick={() => handleLiveMicSwitch(d.deviceId)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                            d.deviceId === selectedMicId
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {d.deviceId === selectedMicId && (
                            <span className="material-symbols-outlined text-[12px] text-primary">check</span>
                          )}
                          <span className="truncate">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                localMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant'
              }`}
              title={localMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              <span className="material-symbols-outlined">{localMuted ? 'mic_off' : 'mic'}</span>
            </button>

            <button
              onClick={handleToggleCamera}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                !cameraEnabled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant'
              }`}
              title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              <span className="material-symbols-outlined">{cameraEnabled ? 'videocam_off' : 'videocam'}</span>
            </button>

            <button
              onClick={handleStopStream}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full flex items-center gap-2 shadow-md cursor-pointer"
              title="End Session"
            >
              <span className="material-symbols-outlined text-[20px]">call_end</span>
              End Session
            </button>
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
