// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StatusBar, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX, Lock, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { safeStorage } from '../../src/old_app/lib/storage';
import { firestore } from '../../src/lib/firebase';

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
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Auth lookup
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

  const isAvailable    =
    booking &&
    (booking.recordingStatus === 'Available' || booking.streamStatus === 'LIVE' || booking.streamStatus === 'In Progress' || recording?.status === 'PUBLISHED');

  const videoSource = recording?.status === 'PUBLISHED' && recording?.videoUrl
    ? recording.videoUrl
    : booking
      ? getVideoUrl(booking.poojaName, stream?.streamUrl || booking.recordingUrl)
      : DEMO_VIDEOS.default;

  const player = useVideoPlayer({ uri: videoSource }, (p) => {
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
    return (
      <View style={styles.center}>
        <View style={[styles.iconBox, { borderColor: '#F59E0B33', backgroundColor: '#F59E0B1A' }]}>
          <Lock size={32} color="#F59E0B" />
        </View>
        <Text style={styles.title}>Recording Unavailable</Text>
        <Text style={styles.subtitle}>
          The video recording is being prepared or has not been published yet by the PRO team.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const isLive       = booking.streamStatus === 'LIVE' || booking.streamStatus === 'In Progress' || (stream?.status === 'LIVE');
  const isFinished   = !isLive && duration > 0 && currentTime >= duration - 1;
  const progress     = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowControls((c) => !c)}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />

        {isLoading && (
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

              {!isLive && duration > 0 && (
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
                  {isLive
                    ? '🔴 Live Broadcast'
                    : isFinished
                    ? '✓ Broadcast Concluded'
                    : '📹 Recording Playback'}
                </Text>

                {!isLive && (
                  <Pressable onPress={replay} style={styles.iconBtn}>
                    <RotateCcw size={18} color="#F5F5F0" />
                  </Pressable>
                )}
              </View>
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
