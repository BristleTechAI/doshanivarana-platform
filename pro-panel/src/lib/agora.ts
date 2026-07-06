/**
 * Agora RTC service for the PRO Panel (broadcaster/publisher side).
 *
 * Usage:
 *   const agora = new AgoraService();
 *   await agora.init(channelName, uid);   // join + publish local tracks
 *   await agora.startCloudRecording();     // start Agora Cloud Recording
 *   await agora.stop();                    // leave + stop recording
 */

import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AgoraTokenResponse {
  token: string;
  appId: string;
  channelName: string;
  uid: string;
  expiresAt: number;
}

export interface CloudRecordingInfo {
  resourceId: string;
  sid: string;
  uid: string;
}

// ─── Agora Service Class ───────────────────────────────────────────────────────
export class AgoraService {
  private client: IAgoraRTCClient;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private cloudRecording: CloudRecordingInfo | null = null;

  // Base URL for the token/recording backend
  private readonly backendUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Callbacks for remote video/audio streams (1:1 calling)
  public onRemoteUserPublished?: (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => void;
  public onRemoteUserUnpublished?: (user: IAgoraRTCRemoteUser) => void;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Log & Subscribe to remote user events for 1:1 call
    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
      console.log('[Agora] Remote user published:', user.uid, mediaType);
      try {
        await this.client.subscribe(user, mediaType);
        console.log('[Agora] Subscribed to remote user:', user.uid, mediaType);
        if (this.onRemoteUserPublished) {
          this.onRemoteUserPublished(user, mediaType);
        }
      } catch (err) {
        console.error('[Agora] Failed to subscribe to remote user:', err);
      }
    });

    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
      console.log('[Agora] Remote user unpublished:', user.uid);
      if (this.onRemoteUserUnpublished) {
        this.onRemoteUserUnpublished(user);
      }
    });
  }

  // ─── Token fetch ────────────────────────────────────────────────────────────
  async fetchToken(channelName: string, uid: number, role: 'publisher' | 'subscriber'): Promise<AgoraTokenResponse> {
    const res = await fetch(
      `${this.backendUrl}/api/agora/token?channelName=${encodeURIComponent(channelName)}&uid=${uid}&role=${role}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch Agora token: ${err.error || res.statusText}`);
    }
    return res.json();
  }

  // ─── Init & Publish ─────────────────────────────────────────────────────────
  /**
   * Join the channel as a broadcaster and publish local camera + mic.
   * @param channelName  Agora channel name (use bookingId or streamId)
   * @param uid          Numeric UID for this user
   * @returns            The resolved token data
   */
  async init(channelName: string, uid: number): Promise<AgoraTokenResponse> {
    const tokenData = await this.fetchToken(channelName, uid, 'publisher');

    // Create local tracks
    [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
      { encoderConfig: 'high_quality_stereo' },
      { encoderConfig: '1080p_1' }
    );

    // Join channel
    await this.client.join(tokenData.appId, channelName, tokenData.token, uid);

    // Publish local tracks
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

    console.log('[Agora] Joined and published to channel:', channelName);
    return tokenData;
  }

  // ─── Video element binding ───────────────────────────────────────────────────
  /** Play local video preview inside the given HTML element container */
  playLocalVideo(container: HTMLElement) {
    this.localVideoTrack?.play(container);
  }

  /** Mute/unmute local audio */
  setMuted(muted: boolean) {
    this.localAudioTrack?.setMuted(muted);
  }

  /** Enable/disable local video */
  setCameraEnabled(enabled: boolean) {
    this.localVideoTrack?.setEnabled(enabled);
  }

  // ─── Cloud Recording ────────────────────────────────────────────────────────
  /**
   * Start Agora Cloud Recording via the backend proxy.
   * Requires AGORA_CUSTOMER_KEY & AGORA_CUSTOMER_SECRET set on server.
   */
  async startCloudRecording(channelName: string, uid: number): Promise<CloudRecordingInfo | null> {
    try {
      const res = await fetch(`${this.backendUrl}/api/agora/recording/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[Agora] Cloud recording start failed:', err.error);
        return null;
      }
      this.cloudRecording = await res.json();
      console.log('[Agora] Cloud recording started:', this.cloudRecording);
      return this.cloudRecording;
    } catch (e) {
      console.error('[Agora] Cloud recording start error:', e);
      return null;
    }
  }

  /**
   * Stop Agora Cloud Recording and return the recording download URL.
   */
  async stopCloudRecording(channelName: string): Promise<{ recordingUrl?: string } | null> {
    if (!this.cloudRecording) return null;
    try {
      const res = await fetch(`${this.backendUrl}/api/agora/recording/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          resourceId: this.cloudRecording.resourceId,
          sid: this.cloudRecording.sid,
          uid: this.cloudRecording.uid,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[Agora] Cloud recording stop failed:', err.error);
        return null;
      }
      const result = await res.json();
      console.log('[Agora] Cloud recording stopped:', result);
      this.cloudRecording = null;
      return result;
    } catch (e) {
      console.error('[Agora] Cloud recording stop error:', e);
      return null;
    }
  }


  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  /** Leave the channel and release all local tracks */
  async stop() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.client.leave();
    console.log('[Agora] Left channel and released tracks.');
  }

  /** Expose the raw client for external stat subscriptions */
  get rtcClient(): IAgoraRTCClient {
    return this.client;
  }
}

// Singleton instance for the PRO panel
export const agoraService = new AgoraService();
