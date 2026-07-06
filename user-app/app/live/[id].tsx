// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, StatusBar, StyleSheet, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX, Lock, Play, Pause, RotateCcw, Radio, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import Constants from 'expo-constants';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { safeStorage } from '../../src/old_app/lib/storage';
import { firestoreProvider as firestore } from '../../src/lib/firebaseProvider';
import { useAgoraViewer } from '../../hooks/useAgoraViewer';

const DEMO_VIDEOS: Record<string, string> = {
  default:     'https://www.w3schools.com/html/mov_bbb.mp4',
  rudra:       'https://media.w3.org/2010/05/sintel/trailer.mp4',
  satyanarayana: 'https://media.w3.org/2010/05/video/movie_300.mp4',
  ganapathi:   'https://www.w3schools.com/html/mov_bbb.mp4',
};

function getVideoUrl(poojaName: string, storedUrl?: string): string {
  if (storedUrl && storedUrl.startsWith('http')) return storedUrl;
  const lower = (poojaName ?? '').toLowerCase();
  if (lower.includes('rudra'))                                    return DEMO_VIDEOS.rudra;
  if (lower.includes('satyanarayana') || lower.includes('satyanaraya')) return DEMO_VIDEOS.satyanarayana;
  if (lower.includes('ganapathi') || lower.includes('ganesha'))  return DEMO_VIDEOS.ganapathi;
  return DEMO_VIDEOS.default;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LiveStreamScreen() {
  const router        = useRouter();
  const { id }        = useLocalSearchParams();
  const insets        = useSafeAreaInsets();
  const { t }         = useLanguage();

  const [isMuted,       setIsMuted]       = useState(false);
  const [showControls,  setShowControls]  = useState(true);
  const [isLoading,     setIsLoading]     = useState(true);
  const [hasError,      setHasError]      = useState(false);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [isPlaying,     setIsPlaying]     = useState(false);

  const [booking, setBooking] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [recording, setRecording] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Agora live viewing state
  const [agoraToken, setAgoraToken] = useState<string | null>(null);
  const [agoraTokenLoading, setAgoraTokenLoading] = useState(false);
  const getDynamicBackendUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      const manifest = Constants.expoConfig || Constants.manifest;
      const debuggerHost = manifest?.debuggerHost || manifest?.hostUri;
      if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:3001`;
      }
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3001';
      }
    }
    return envUrl;
  };
  const BACKEND_URL = getDynamicBackendUrl();
  const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || '';

  // Auth lookup — derive userId from stored session
  const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
  const userId = userSession ? JSON.parse(userSession).id : null;

  useEffect(() => {
    if (!id || !userId) {
      setIsAuthorized(false);
      setLoadingData(false);
      return;
    }

    const bookingId = id.toString();
    
    // Subscribe to Booking
    const unsubscribeBooking = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data.userId !== userId) {
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
            setBooking({ id: doc.id, ...data });
          }
        } else {
          setBooking(null);
        }
        setLoadingData(false);
      });

    // Subscribe to Live Stream if active
    const unsubscribeStream = firestore()
      .collection('liveStreams')
      .where('bookingId', '==', bookingId)
      .onSnapshot((snapshot) => {
        if (snapshot && !snapshot.empty) {
          // Get most recent stream doc
          const sDocs = snapshot.docs.map(d => d.data());
          sDocs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          setStream(sDocs[0]);
        }
      });

    // Subscribe to Recording
    const unsubscribeRecording = firestore()
      .collection('recordings')
      .where('bookingId', '==', bookingId)
      .onSnapshot((snapshot) => {
        if (snapshot && !snapshot.empty) {
          const rDocs = snapshot.docs.map(d => d.data());
          rDocs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          setRecording(rDocs[0]);
        }
      });

    return () => {
      unsubscribeBooking();
      unsubscribeStream();
      unsubscribeRecording();
    };
  }, [id, userId]);

  // ── Agora: fetch publisher token when a live stream is detected ────────────
  const isBookingLiveState = booking?.streamStatus === 'LIVE' || booking?.streamStatus === 'IN_PROGRESS';
  const isStreamEnded = stream?.status === 'ENDED';
  const isLive = isBookingLiveState && !isStreamEnded;
  const agoraChannel = booking ? `booking_${booking.id}` : (stream?.agoraChannelName || null);

  useEffect(() => {
    if (!isLive || !agoraChannel || agoraToken) return;
    const fetchToken = async () => {
      setAgoraTokenLoading(true);
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/agora/token?channelName=${encodeURIComponent(agoraChannel)}&uid=0&role=publisher`
        );
        const data = await res.json();
        if (data.token) {
          setAgoraToken(data.token);
        }
      } catch (e) {
        console.warn('[Agora Viewer] Token fetch failed:', e);
      } finally {
        setAgoraTokenLoading(false);
      }
    };
    fetchToken();
  }, [isLive, agoraChannel]);

  // Use Agora SDK for live viewing/broadcasting
  const {
    remoteUid: agoraRemoteUid,
    isConnected: agoraConnected,
    error: agoraViewError,
    isMuted: agoraMuted,
    isCameraOn: agoraCameraOn,
    toggleMute: agoraToggleMute,
    toggleCamera: agoraToggleCamera,
    leave: agoraLeave
  } = useAgoraViewer({
    channelName: isLive && agoraToken ? agoraChannel : null,
    appId: AGORA_APP_ID,
    token: agoraToken,
    uid: 0,
  });

  const isRecordingReadyToPlay = recording?.status === 'PUBLISHED' || booking?.recordingStatus === 'Available';
  
  const isAvailable =
    booking &&
    (
      isRecordingReadyToPlay ||
      isLive
    );

  const isFinished = !isLive && duration > 0 && currentTime >= duration - 1;

  // Only use video player for recordings (not live Agora streams)
  const videoSource = recording?.status === 'PUBLISHED' && recording?.videoUrl
    ? recording.videoUrl
    : booking && !isLive
      ? getVideoUrl(booking.poojaName, booking.recordingUrl)
      : null; // null = using Agora, not video player

  const player = useVideoPlayer(videoSource ? { uri: videoSource } : null, (p) => {
    if (!p) return;
    p.loop       = false;
    p.muted      = false;
    p.play();
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (e) => {
      const s = e.status;
      if (s === 'readyToPlay') {
        setIsLoading(false);
        setHasError(false);
      } else if (s === 'error') {
        setIsLoading(false);
        setHasError(true);
      } else if (s === 'loading') {
        setIsLoading(true);
      }
    });

    const timer = setInterval(() => {
      setCurrentTime(player.currentTime ?? 0);
      setDuration(player.duration ?? 0);
      setIsPlaying(player.playing ?? false);
    }, 500);

    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [player]);

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const replay = () => {
    player.seekBy(-player.currentTime);
    player.play();
  };

  const toggleMute = () => {
    player.muted = !player.muted;
    setIsMuted(player.muted);
  };


  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <View style={styles.iconBox}>
          <Lock size={32} color="#EF4444" />
        </View>
        <Text style={styles.title}>Broadcast Not Found</Text>
        <Text style={styles.subtitle}>
          The requested pooja slot or booking reference does not exist.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.center}>
        <View style={styles.iconBox}>
          <Lock size={32} color="#EF4444" />
        </View>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.subtitle}>
          This recording is private and only accessible to the devotee who booked this Seva.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!isAvailable) {
    const streamHasEnded = isStreamEnded || booking?.streamStatus === 'ENDED';
    
    return (
      <View style={styles.center}>
        <View style={[styles.iconBox, { borderColor: '#F59E0B33', backgroundColor: '#F59E0B1A' }]}>
          <Lock size={32} color="#F59E0B" />
        </View>
        <Text style={styles.title}>
          {streamHasEnded ? 'Live Session Concluded' : 'Recording Unavailable'}
        </Text>
        <Text style={styles.subtitle}>
          {streamHasEnded 
            ? 'The live pooja has concluded. The recording is currently being processed and will be available here shortly.'
            : 'The video recording is being prepared or has not been published yet by the PRO team.'}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  // ── Live Agora path — use our platform-specific module to avoid Webpack errors on web
  let AgoraSurfaceView: any = null;
  let WebViewComponent: any = null;
  const isExpoGo = Constants?.appOwnership === 'expo' || Constants?.executionEnvironment === 'storeClient';
  const isWeb = Platform.OS === 'web';
  if (!isExpoGo && !isWeb) {
    // Our local platform-specific module returns null on Web
    const NativeAgora = require('../../lib/agora-native');
    if (NativeAgora && NativeAgora.RtcSurfaceView) {
      AgoraSurfaceView = NativeAgora.RtcSurfaceView;
    }
  } else if (isExpoGo && !isWeb) {
    try {
      WebViewComponent = require('react-native-webview').WebView;
    } catch (_) {
      // WebView not available
    }
  }

  // HTML content for WebView-based Agora Web SDK audience fallback
  const agoraHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          overflow: hidden;
          position: relative;
        }
        #remote-player {
          width: 100%;
          height: 100%;
          background-color: #000;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }
        #local-player {
          width: 100px;
          height: 130px;
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 8px;
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          background-color: #111;
          overflow: hidden;
        }
        #status {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #F97316;
          font-family: sans-serif;
          font-size: 14px;
          z-index: 20;
          text-align: center;
          background: rgba(0,0,0,0.6);
          padding: 8px 16px;
          border-radius: 20px;
        }
      </style>
      <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
    </head>
    <body>
      <div id="status">Connecting to call...</div>
      <div id="remote-player"></div>
      <div id="local-player"></div>
      
      <!-- Local Web Controls -->
      <div id="web-controls" style="display: none; position: absolute; bottom: 30px; left: 0; right: 0; justify-content: center; gap: 20px; z-index: 50;">
        <button id="mic-btn" style="width: 54px; height: 54px; border-radius: 27px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); font-size: 24px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">🎙️</button>
        <button id="cam-btn" style="width: 54px; height: 54px; border-radius: 27px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); font-size: 24px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">📷</button>
      </div>

      <script>
        const appId = "${AGORA_APP_ID}";
        const channel = "${agoraChannel}";
        const token = "${agoraToken}";

        async function startCall() {
          const statusEl = document.getElementById("status");
          if (typeof AgoraRTC === "undefined") {
            statusEl.innerText = "Error: Agora Web SDK failed to load. Check your internet connection.";
            return;
          }

          let client = null;
          let isViewerOnly = false;
          let localAudio = null;
          let localVideo = null;

          try {
            // 1. Try to grab local media tracks first. This is the true test of getUserMedia support.
            try {
              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                [localAudio, localVideo] = await AgoraRTC.createMicrophoneAndCameraTracks();
                const localDiv = document.getElementById("local-player");
                localVideo.play(localDiv);
              } else {
                throw new Error("No mediaDevices.getUserMedia support");
              }
            } catch (mediaErr) {
              console.warn("Media capture failed, switching to audience mode:", mediaErr);
              isViewerOnly = true;
              document.getElementById("local-player").style.display = "none";
            }

            // 2. Initialize the client based on media capability.
            if (isViewerOnly) {
              client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
              await client.setClientRole("audience");
            } else {
              client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            }

            // 3. Set up event listeners for the remote stream
            client.on("user-published", async (user, mediaType) => {
              await client.subscribe(user, mediaType);
              statusEl.style.display = "none";
              if (mediaType === "video") {
                const playerDiv = document.getElementById("remote-player");
                user.videoTrack.play(playerDiv, { fit: "contain" });
              }
              if (mediaType === "audio") {
                user.audioTrack.play();
              }
            });

            client.on("user-unpublished", (user, mediaType) => {
              if (mediaType === "video") {
                statusEl.style.display = "block";
                statusEl.innerText = "Pujari offline...";
              }
            });

            // 4. Join the channel and publish if possible
            await client.join(appId, channel, token, null);

            if (!isViewerOnly && (localAudio || localVideo)) {
              const tracks = [];
              if (localAudio) tracks.push(localAudio);
              if (localVideo) tracks.push(localVideo);
              await client.publish(tracks);
              statusEl.innerText = "Connected! You are live with Pujari.";
              setTimeout(() => { statusEl.style.display = 'none'; }, 3000);

              // Show Web Controls
              document.getElementById("web-controls").style.display = "flex";
              let micOn = true;
              let camOn = true;

              document.getElementById("mic-btn").onclick = async () => {
                micOn = !micOn;
                await localAudio.setMuted(!micOn);
                document.getElementById("mic-btn").style.background = micOn ? "rgba(255,255,255,0.2)" : "#EF4444";
              };

              document.getElementById("cam-btn").onclick = async () => {
                camOn = !camOn;
                await localVideo.setMuted(!camOn);
                document.getElementById("cam-btn").style.background = camOn ? "rgba(255,255,255,0.2)" : "#EF4444";
              };
            } else {
              statusEl.innerHTML = "Connected in viewer mode.<br/><small>Camera/mic blocked by Expo Go WebView.</small>";
            }

          } catch (err) {
            statusEl.innerText = "Call initialization failed: " + err.message;
            console.error("Agora Error:", err);
          }
        }

        startCall();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowControls((c) => !c)}
      >
        {/* ── Live stream: Agora RTC view ──────────────────────────────────── */}
        {isLive && !isExpoGo && !isWeb && AgoraSurfaceView && agoraConnected && agoraRemoteUid !== null ? (
          <View style={StyleSheet.absoluteFill}>
            {/* Main remote video from Pujari */}
            <AgoraSurfaceView
              canvas={{ uid: agoraRemoteUid }}
              style={StyleSheet.absoluteFill}
            />
            {/* Small local devotee video container */}
            {agoraCameraOn && (
              <View style={styles.localVideoContainer}>
                <AgoraSurfaceView
                  canvas={{ uid: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )}
          </View>
        ) : isLive && (isExpoGo || isWeb) && agoraToken ? (
          /* WebView/Iframe fallback for Expo Go and Web */
          isWeb ? (
            <iframe
              srcDoc={agoraHtml}
              style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
              allow="autoplay; camera; microphone"
            />
          ) : WebViewComponent ? (
            <WebViewComponent
              originWhitelist={['*']}
              source={{ html: agoraHtml }}
              style={StyleSheet.absoluteFill}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          ) : (
            <View style={[styles.overlay, { backgroundColor: '#000' }]}>
              <ActivityIndicator size="large" color="#F97316" />
              <Text style={styles.loadingText}>Initializing video call fallback…</Text>
            </View>
          )
        ) : isLive && (agoraTokenLoading || (!isExpoGo && !isWeb && !agoraConnected)) ? (
          <View style={[styles.overlay, { backgroundColor: '#000' }]}>
            <ActivityIndicator size="large" color="#F97316" />
            <Radio size={32} color="#F97316" style={{ marginTop: 16 }} />
            <Text style={[styles.loadingText, { marginTop: 8 }]}>
              {agoraTokenLoading ? 'Connecting to live call…' : 'Waiting for Pujari…'}
            </Text>
          </View>
        ) : !isLive ? (
          /* ── Recording: expo-video ─────────────────────────────────────── */
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />
        ) : (
          /* Agora not available (Expo Go) and no token yet — show placeholder */
          <View style={[styles.overlay, { backgroundColor: '#111' }]}>
            <Radio size={48} color="#F97316" />
            <Text style={[styles.title, { marginTop: 16 }]}>1:1 Call Session Active</Text>
            <Text style={styles.subtitle}>
              Initializing connection to Agora live call.{'\n'}
              Channel: {agoraChannel}
            </Text>
          </View>
        )}

        {isLive && agoraConnected && (
          <View style={{ position: 'absolute', top: 16, left: 16, backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>1:1 CALL</Text>
          </View>
        )}

        {!isLive && isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Loading Pooja Recording…</Text>
          </View>
        )}

        {hasError && (
          <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)', padding: 32 }]}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🙏</Text>
            <Text style={[styles.title, { marginBottom: 8 }]}>Unable to Load Video</Text>
            <Text style={[styles.subtitle, { marginBottom: 24 }]}>
              Check your internet connection and try again.
            </Text>
            <Pressable
              onPress={() => {
                setHasError(false);
                setIsLoading(true);
                player.play();
              }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {showControls && !isLoading && !hasError && (
          <>
            <View
              style={[
                styles.topBar,
                { paddingTop: insets.top > 0 ? insets.top + 8 : 20 },
              ]}
            >
              <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                <ArrowLeft size={20} color="#F5F5F0" />
              </Pressable>

              <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 12 }}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {booking.poojaName}
                </Text>
                <Text style={styles.videoSubtitle} numberOfLines={1}>
                  {booking.templeName || 'Temple'}
                </Text>
              </View>

              {isLive ? (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              ) : (
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>REC</Text>
                </View>
              )}
            </View>

            {!isLive && (
              <View style={styles.centerBtn} pointerEvents="box-none">
                <Pressable onPress={isFinished ? replay : togglePlay} style={styles.playBtn}>
                  {isFinished ? (
                    <RotateCcw size={30} color="#F5F5F0" />
                  ) : isPlaying ? (
                    <Pause size={30} color="#F5F5F0" />
                  ) : (
                    <Play size={30} color="#F5F5F0" />
                  )}
                </Pressable>
              </View>
            )}

            <View
              style={[
                styles.bottomBar,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 },
              ]}
            >
              <Text style={styles.dedicationLabel}>On behalf of</Text>
              <Text style={styles.dedicationName}>
                {booking.devoteeDetails?.name || booking.devoteeName} &amp; Family
              </Text>

              {isLive ? (
                /* 1:1 Video Call controls */
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 12, marginBottom: 8 }}>
                  <Pressable
                    onPress={agoraToggleMute}
                    style={{
                      width: 46, height: 46, borderRadius: 23,
                      backgroundColor: agoraMuted ? '#EF4444' : 'rgba(255,255,255,0.15)',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {agoraMuted ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
                  </Pressable>

                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      width: 54, height: 54, borderRadius: 27,
                      backgroundColor: '#EF4444',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <PhoneOff size={24} color="#fff" />
                  </Pressable>

                  <Pressable
                    onPress={agoraToggleCamera}
                    style={{
                      width: 46, height: 46, borderRadius: 23,
                      backgroundColor: !agoraCameraOn ? '#EF4444' : 'rgba(255,255,255,0.15)',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {!agoraCameraOn ? <VideoOff size={20} color="#fff" /> : <Video size={20} color="#fff" />}
                  </Pressable>
                </View>
              ) : (
                /* Regular playback progress bar and controls */
                <>
                  {duration > 0 && (
                    <View style={{ marginBottom: 12, marginTop: 8 }}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                      </View>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Pressable onPress={toggleMute} style={styles.iconBtn}>
                      {isMuted
                        ? <VolumeX size={18} color="#F97316" />
                        : <Volume2 size={18} color="#F97316" />}
                    </Pressable>

                    <Text style={styles.statusText}>
                      {isFinished ? '✓ Broadcast Concluded' : '📹 Recording Playback'}
                    </Text>

                    <Pressable onPress={replay} style={styles.iconBtn}>
                      <RotateCcw size={18} color="#F5F5F0" />
                    </Pressable>
                  </View>
                </>
              )}

              {/* YouTube link — shown when recording has been uploaded to YouTube */}
              {!isLive && (recording?.youtubeLiveUrl || booking?.youtubeLiveUrl) && (
                <Pressable
                  onPress={() => {
                    const { Linking } = require('react-native');
                    Linking.openURL(recording?.youtubeLiveUrl || booking?.youtubeLiveUrl);
                  }}
                  style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#FF000020',
                    borderWidth: 1,
                    borderColor: '#FF000040',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    alignSelf: 'center',
                  }}
                >
                  <Radio size={14} color="#FF4444" />
                  <Text style={{ color: '#FF6666', fontSize: 13, fontWeight: '600' }}>
                    Watch on YouTube
                  </Text>
                </Pressable>
              )}

            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  localVideoContainer: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    backgroundColor: '#000',
    zIndex: 10,
  },
  center: {
    flex: 1, backgroundColor: '#1A0A00',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EF44441A', borderWidth: 1, borderColor: '#EF444433',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#F5F5F0', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#78716C', textAlign: 'center', lineHeight: 20, maxWidth: 280, marginBottom: 24 },
  btnPrimary: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#F97316', borderRadius: 12 },
  btnPrimaryText: { color: '#1A0A00', fontWeight: '600', fontSize: 14 },
  btnOutline: { paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: '#F9731640', borderRadius: 12, backgroundColor: '#2D0A2E' },
  btnOutlineText: { color: '#F97316', fontWeight: '600', fontSize: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  loadingText: { color: '#78716C', fontSize: 13, marginTop: 12 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  videoTitle:    { color: '#F5F5F0', fontWeight: '700', fontSize: 13 },
  videoSubtitle: { color: '#78716C', fontSize: 10 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    backgroundColor: '#DC2626',
  },
  liveDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeText:{ color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  recBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)',
  },
  recBadgeText: { color: '#F97316', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  centerBtn: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  dedicationLabel: { color: '#78716C', fontSize: 10, textAlign: 'center' },
  dedicationName:  { color: '#F97316', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  progressTrack: {
    height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden',
  },
  progressFill:  { height: '100%', backgroundColor: '#F97316', borderRadius: 2 },
  timeText:      { color: '#78716C', fontSize: 9 },
  statusText:    { color: '#78716C', fontSize: 11 },
});
