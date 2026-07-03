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

import { useState, useEffect, useCallback } from 'react';

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
  leave: () => void;
}

// Lazily resolve the Agora SDK so that missing native modules don't crash the
// JS bundle on load (e.g. in Expo Go or simulators without a dev-client build).
function tryRequireAgora() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-agora');
  } catch {
    return null;
  }
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

  const leave = useCallback(() => {
    engine?.leaveChannel();
    engine?.release();
    setEngine(null);
    setRemoteUid(null);
    setIsConnected(false);
  }, [engine]);

  useEffect(() => {
    if (!channelName || !appId || !token) return;

    const agora = tryRequireAgora();
    if (!agora) {
      console.warn('[Agora Viewer] react-native-agora is not available (Expo Go / missing native module). Live stream viewing requires a custom dev build.');
      setError('react-native-agora is not linked. Use a custom dev build to watch live streams.');
      return;
    }

    const {
      createAgoraRtcEngine,
      ChannelProfileType,
      ClientRoleType,
    } = agora;

    let rtcEngine: any;

    const setup = async () => {
      try {
        rtcEngine = createAgoraRtcEngine();
        await rtcEngine.initialize({ appId });

        await rtcEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
        await rtcEngine.setClientRole(ClientRoleType.ClientRoleAudience);

        // Event handlers
        const handler = {
          onJoinChannelSuccess: (_connection: any, elapsed: number) => {
            console.log('[Agora Viewer] Joined channel in', elapsed, 'ms');
            setIsConnected(true);
            setError(null);
          },
          onUserJoined: (_connection: any, newUid: number) => {
            console.log('[Agora Viewer] Remote user joined:', newUid);
            setRemoteUid(newUid);
          },
          onUserOffline: (_connection: any, offlineUid: number) => {
            console.log('[Agora Viewer] Remote user left:', offlineUid);
            setRemoteUid((prev) => (prev === offlineUid ? null : prev));
          },
          onError: (errCode: number, msg: string) => {
            console.error('[Agora Viewer] Error:', errCode, msg);
            setError(`Agora error ${errCode}: ${msg}`);
          },
          onConnectionStateChanged: (_connection: any, state: any, reason: any) => {
            console.log('[Agora Viewer] Connection state:', state, reason);
          },
        };

        rtcEngine.registerEventHandler(handler);

        await rtcEngine.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleAudience,
        });

        setEngine(rtcEngine);
      } catch (e: any) {
        console.error('[Agora Viewer] Setup error:', e);
        setError(`Failed to join live stream: ${e.message}`);
      }
    };

    setup();

    return () => {
      rtcEngine?.leaveChannel();
      rtcEngine?.release();
    };
  }, [channelName, appId, token]);

  return { remoteUid, isConnected, error, leave };
}
