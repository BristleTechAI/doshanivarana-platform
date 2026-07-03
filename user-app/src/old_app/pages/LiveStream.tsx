// @ts-nocheck
/**
 * LiveStream — User-side live audience view.
 *
 * This screen:
 *   1. Fetches the liveStream document from Firestore via subscribeToLiveStreamByBooking.
 *   2. Joins the Agora channel as an AUDIENCE using react-native-agora.
 *   3. If the stream has ended and a recording is available, shows the recording playback instead.
 *   4. Keeps the Agora connection alive while the screen is mounted and cleans up on unmount.
 */
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Eye, Wifi } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { LiveStreamsService } from '../../services/firebase/liveStreams';
import { RecordingsService } from '../../services/firebase/recordings';

// ─── Agora constants ──────────────────────────────────────────────────────────
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
  || import.meta.env.EXPO_PUBLIC_AGORA_APP_ID
  || '309d332dda7b4e9fbb3b7f557545a7c0';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  || import.meta.env.EXPO_PUBLIC_BACKEND_URL
  || 'http://localhost:3001';

// ─── Agora Web SDK (old_app is web-only so we import directly) ───────────────
import AgoraRTC from 'agora-rtc-sdk-ng';

async function fetchAgoraToken(
  channelName: string,
  uid: number
): Promise<string> {
  try {
    const url = `${BACKEND_URL}/api/agora/token?channelName=${encodeURIComponent(channelName)}&uid=${uid}&role=subscriber`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.token) return data.token;
  } catch (e) {
    console.warn('[Agora] Token fetch failed, using null token:', e);
  }
  return null; // null token works in test mode
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function LiveStream() {
  const navigate = useNavigate();
  const { id: bookingId } = useParams<{ id: string }>();

  // ── Firestore state ───────────────────────────────────────────────────────
  const [stream, setStream] = useState<any>(null);
  const [recording, setRecording] = useState<any>(null);
  const [loadingStream, setLoadingStream] = useState(true);

  // ── Agora state ───────────────────────────────────────────────────────────
  const [agoraClient, setAgoraClient] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [agoraJoined, setAgoraJoined] = useState(false);
  const [agoraError, setAgoraError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [streamHealth, setStreamHealth] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor' | '—'>('—');

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(() => {});

  // ── Subscribe to Live Stream (Firestore) ──────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    setLoadingStream(true);
    const unsub = LiveStreamsService.subscribeToLiveStreamByBooking(bookingId, (s) => {
      setStream(s);
      setLoadingStream(false);
    });
    return () => unsub();
  }, [bookingId]);

  // ── Subscribe to Recording ────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    const unsub = RecordingsService.subscribeToRecordingByBooking(bookingId, setRecording);
    return () => unsub();
  }, [bookingId]);

  // ── Join Agora Channel as Audience when stream becomes Live ───────────────
  useEffect(() => {
    const channelName = stream?.channelId || stream?.agoraChannelName || stream?.id;
    const streamStatus = stream?.streamStatus || stream?.status || '';
    const isLive = streamStatus === 'Live' || streamStatus === 'LIVE';

    if (!isLive || !channelName || !AgoraRTC) return;
    if (agoraJoined) return; // Already joined

    let client: any;
    let cancelled = false;

    const joinChannel = async () => {
      try {
        client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        client.setClientRole('audience');

        // Handle remote user streams
        client.on('user-published', async (user: any, mediaType: string) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') {
            setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
            // Play video
            setTimeout(() => {
              const el = document.getElementById(`agora-remote-${user.uid}`);
              if (el) user.videoTrack?.play(el);
            }, 300);
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (user: any) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        client.on('user-left', (user: any) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        const uid = Math.floor(Math.random() * 100000);
        const token = await fetchAgoraToken(channelName, uid);

        if (cancelled) return;

        await client.join(AGORA_APP_ID, channelName, token, uid);

        if (cancelled) {
          client.leave();
          return;
        }

        setAgoraClient(client);
        setAgoraJoined(true);
        setAgoraError(null);

        // Periodic stats polling
        const statsInterval = setInterval(async () => {
          if (!client) return;
          const count = client.remoteUsers?.length || 0;
          setViewerCount(count);
          try {
            const stats = client.getRTCStats?.();
            const rtt = stats?.RTT || 0;
            if (rtt < 100) setStreamHealth('Excellent');
            else if (rtt < 200) setStreamHealth('Good');
            else if (rtt < 400) setStreamHealth('Fair');
            else setStreamHealth('Poor');
          } catch {}
        }, 5000);

        cleanupRef.current = () => {
          clearInterval(statsInterval);
          client?.leave?.().catch(() => {});
        };

      } catch (e: any) {
        if (!cancelled) {
          setAgoraError(e.message || 'Failed to join the live stream.');
        }
      }
    };

    joinChannel();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      setAgoraJoined(false);
      setAgoraClient(null);
      setRemoteUsers([]);
    };
  }, [stream?.channelId, stream?.agoraChannelName, stream?.id, stream?.streamStatus, stream?.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  // ── Derived flags ─────────────────────────────────────────────────────────
  const streamStatus = stream?.streamStatus || stream?.status || '';
  const isLive = streamStatus === 'Live' || streamStatus === 'LIVE';
  const streamEnded = streamStatus === 'Ended' || streamStatus === 'ENDED' || streamStatus === 'Archived';
  const recordingPublished =
    recording?.status === 'Published' || recording?.status === 'PUBLISHED';
  const channelName = stream?.channelId || stream?.agoraChannelName || '';

  const poojaName = stream?.poojaName || '—';
  const templeName = stream?.templeName || '';

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingStream) {
    return (
      <div className="h-screen bg-[#1A0A00] flex items-center justify-center">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Connecting to stream…
        </p>
      </div>
    );
  }

  if (!stream && !loadingStream) {
    return (
      <div className="h-screen bg-[#1A0A00] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          The live stream for this booking hasn't started yet. Please check back when the Pooja is scheduled to begin.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-xl border border-primary text-primary text-sm font-medium"
          style={{ fontFamily: "'Noto Sans', sans-serif" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1A0A00] flex flex-col">
      {/* Video Area */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── Live Agora Video Feed ─────────────────────────────────────────── */}
        {isLive && !streamEnded && (
          <div
            ref={videoContainerRef}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >
            {remoteUsers.length > 0 ? (
              // Show the first remote (broadcaster's) video
              <div
                id={`agora-remote-${remoteUsers[0].uid}`}
                className="w-full h-full"
              />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                  Waiting for broadcast to begin…
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Recording Playback ────────────────────────────────────────────── */}
        {(streamEnded || !isLive) && recordingPublished && recording?.recordingUrl && (
          <div className="absolute inset-0 bg-black">
            <video
              src={recording.recordingUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* ── Stream Ended — No Recording Yet ──────────────────────────────── */}
        {streamEnded && !recordingPublished && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#2D0A2E] p-8 text-center">
            <div>
              <span className="text-5xl mb-4 block">🙏</span>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}>
                Pooja Has Completed
              </h3>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
                The recording will be available shortly once the temple uploads it.
              </p>
            </div>
          </div>
        )}

        {/* ── Agora Error ───────────────────────────────────────────────────── */}
        {agoraError && (
          <div className="absolute bottom-20 left-4 right-4 bg-red-900/80 border border-red-500 text-red-200 text-sm p-3 rounded-xl" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            ⚠️ {agoraError}
          </div>
        )}

        {/* ── Top Overlay ──────────────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between p-4"
          style={{ background: 'linear-gradient(to bottom, rgba(26,10,0,0.85), transparent)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex-1 mx-4 text-center">
            <p className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
              {poojaName}
              {templeName ? ` — ${templeName}` : ''}
            </p>
          </div>

          {isLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-bold text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>LIVE</span>
            </div>
          ) : recordingPublished ? (
            <div className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary">
              <span className="text-xs font-bold text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>RECORDING</span>
            </div>
          ) : null}
        </div>

        {/* ── Bottom Overlay ────────────────────────────────────────────────── */}
        {stream?.devoteeName && (
          <div
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{ background: 'linear-gradient(to top, rgba(26,10,0,0.9), transparent)' }}
          >
            <p className="text-xs text-center" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
              This pooja is being offered for {stream.devoteeName} and family
            </p>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="px-6 py-5 space-y-4 flex-shrink-0">
        {/* Stream Quality & Viewer Count */}
        {isLive && (
          <div className="flex items-center justify-between text-xs" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span>{streamHealth}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{viewerCount > 0 ? `${viewerCount} watching` : 'Connecting…'}</span>
            </div>
            {agoraJoined && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Connected</span>
              </div>
            )}
          </div>
        )}

        {/* Channel Debug Info (dev only) */}
        {channelName && process.env.NODE_ENV === 'development' && (
          <p className="text-[10px] text-muted-foreground text-center" style={{ fontFamily: "'Noto Sans Mono', monospace" }}>
            Channel: {channelName}
          </p>
        )}

        {/* Description */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {isLive
              ? 'Chant along if you know the mantras. Light a diya at home during the aarti.'
              : streamEnded && recordingPublished
              ? 'Replay your dedicated Pooja recording anytime.'
              : 'The live broadcast will begin at the scheduled time.'}
          </p>
        </div>
      </div>
    </div>
  );
}
