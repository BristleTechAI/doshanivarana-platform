/**
 * useAgoraViewer — React Native hook for joining an Agora channel as a subscriber (viewer).
 *
 * Usage:
 *   const { remoteUid, leave, error } = useAgoraViewer({ channelName, appId, token });
 *
 * Render the remote video:
 *   <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.video} />
 *
 * NOTE: react-native-agora is lazily required to avoid crashing in Expo Go or
 * environments where the native module is not linked. The hook is a no-op when
 * the package is unavailable.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface UseAgoraViewerOptions {
  channelName: string | null;
  appId: string;
  token: string | null;
  uid?: number;
}

interface AgoraViewerState {
  remoteUid: number | null;
  isConnected: boolean;
  error: string | null;
  isMuted: boolean;
  isCameraOn: boolean;
  toggleMute: () => void;
  toggleCamera: () => void;
  leave: () => void;
}

import { createAgoraRtcEngine, ChannelProfileType } from '../lib/agora-native';

// Try to use the native Agora methods
function hasNativeAgora() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  if (isExpoGo || isWeb) {
    return false;
  }
  // Check if our native exports actually exist (they will be null if on Web, or if unlinked)
  if (!createAgoraRtcEngine) {
    return false;
  }
  return true;
}

export function useAgoraViewer({
  channelName,
  appId,
  token,
  uid = 0,
}: UseAgoraViewerOptions): AgoraViewerState {
  const [engine, setEngine] = useState<any>(null);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const engineRef = useRef<any>(null);

  const leave = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.leaveChannel();
      engineRef.current.release();
      engineRef.current = null;
      setEngine(null);
    }
    setRemoteUid(null);
    setIsConnected(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (engineRef.current) {
      const nextMuted = !isMuted;
      engineRef.current.muteLocalAudioStream(nextMuted);
      setIsMuted(nextMuted);
    }
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (engineRef.current) {
      const nextCamera = !isCameraOn;
      engineRef.current.muteLocalVideoStream(!nextCamera);
      setIsCameraOn(nextCamera);
    }
  }, [isCameraOn]);

  useEffect(() => {
    if (!channelName || !appId || !token) return;

    if (!hasNativeAgora()) {
      console.warn('[Agora Call] react-native-agora is not available (Expo Go / missing native module). Call requires a custom dev build.');
      setError('react-native-agora is not linked. Use a custom dev build to make 1:1 calls.');
      return;
    }

    let rtcEngine: any;

    const setup = async () => {
      try {
        rtcEngine = createAgoraRtcEngine();
        await rtcEngine.initialize({ appId });
        engineRef.current = rtcEngine;
        setEngine(rtcEngine);

        // Switch to communication channel profile for 1:1 call
        await rtcEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

        // Enable video & audio modules + start local preview
        await rtcEngine.enableVideo();
        await rtcEngine.enableAudio();
        await rtcEngine.startPreview();

        // Event handlers
        const handler = {
          onJoinChannelSuccess: (_connection: any, elapsed: number) => {
            console.log('[Agora Call] Joined channel in', elapsed, 'ms');
            setIsConnected(true);
            setError(null);
          },
          onUserJoined: (_connection: any, newUid: number) => {
            console.log('[Agora Call] Pujari joined:', newUid);
            setRemoteUid(newUid);
          },
          onUserOffline: (_connection: any, offlineUid: number) => {
            console.log('[Agora Call] Pujari left:', offlineUid);
            setRemoteUid((prev) => (prev === offlineUid ? null : prev));
          },
          onError: (errCode: number, msg: string) => {
            console.error('[Agora Call] Error:', errCode, msg);
            setError(`Agora error ${errCode}: ${msg}`);
          },
          onConnectionStateChanged: (_connection: any, state: any, reason: any) => {
            console.log('[Agora Call] Connection state:', state, reason);
          },
        };

        rtcEngine.registerEventHandler(handler);

        // Join channel as a broadcaster in communication mode
        await rtcEngine.joinChannel(token, channelName, uid, {});
      } catch (e: any) {
        console.error('[Agora Call] Setup error:', e);
        setError(`Failed to join 1:1 call: ${e.message}`);
      }
    };

    setup();

    return () => {
      if (rtcEngine) {
        rtcEngine.leaveChannel();
        rtcEngine.release();
        engineRef.current = null;
        setEngine(null);
      }
    };
  }, [channelName, appId, token]);

  return { remoteUid, isConnected, error, isMuted, isCameraOn, toggleMute, toggleCamera, leave };
}
