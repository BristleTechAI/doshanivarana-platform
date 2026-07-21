/**
 * Agora RTC service for the PRO Panel (broadcaster/publisher side).
 *
 * Supports:
 *  - All browser-detectable video/audio input devices (webcam, USB, HDMI capture,
 *    OBS Virtual Camera, EpocCam, DroidCam, Camo, mobile webcam mode, etc.)
 *  - Automatic device enumeration with permission handling
 *  - Device-specific stream initialisation (pass cameraDeviceId + micDeviceId)
 *  - Hot switching camera / microphone while live (no channel rejoin)
 *  - Graceful fallback when a device is disconnected mid-stream
 *  - Cloud recording start / stop via backend proxy
 *
 * Usage:
 *   await agoraService.listVideoDevices();          // enumerate cameras
 *   await agoraService.listAudioDevices();          // enumerate mics
 *   await agoraService.init(ch, uid, camId, micId); // join + publish
 *   await agoraService.switchCamera(newCamId);      // hot-switch camera
 *   await agoraService.switchMicrophone(newMicId);  // hot-switch mic
 *   await agoraService.stop();                       // leave + release tracks
 */

import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
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

export interface DeviceInfo {
  deviceId: string;
  label: string;
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

  // Callback fired when a device is lost and the service auto-falls back
  public onDeviceFallback?: (type: 'video' | 'audio', newDeviceId: string | null) => void;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Log & Subscribe to remote user events for 1:1 call
    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
      console.log('[Agora] Remote user published:', user.uid, mediaType);
      try {
        await this.client.subscribe(user, mediaType);
        console.log('[Agora] Subscribed to remote user:', user.uid, mediaType);
        // Agora may emit 'datachannel' — only forward 'video' and 'audio' to our callback
        if (this.onRemoteUserPublished && (mediaType === 'video' || mediaType === 'audio')) {
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

  // ─── Device Enumeration ──────────────────────────────────────────────────────

  /**
   * Request camera + mic permission first (needed for labels to be populated),
   * then enumerate all video input devices.
   * Works for: laptop webcam, USB webcam, HDMI capture, OBS Virtual Camera,
   * EpocCam, DroidCam, Camo, mobile devices in webcam mode, etc.
   */
  async listVideoDevices(): Promise<DeviceInfo[]> {
    await this._ensurePermission('video');
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(d => d.kind === 'videoinput')
      .map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${i + 1}`,
      }));
  }

  /**
   * Request mic permission first then enumerate all audio input devices.
   */
  async listAudioDevices(): Promise<DeviceInfo[]> {
    await this._ensurePermission('audio');
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(d => d.kind === 'audioinput')
      .map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${i + 1}`,
      }));
  }

  /**
   * Enumerate both video and audio input devices in a single permission request.
   */
  async listAllDevices(): Promise<{ video: DeviceInfo[]; audio: DeviceInfo[] }> {
    try {
      // A single getUserMedia call that grants both permissions at once
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch {
      // Fall back to individual permission requests
      try { await this._ensurePermission('video'); } catch { /* ignored */ }
      try { await this._ensurePermission('audio'); } catch { /* ignored */ }
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    let vidIdx = 0, audIdx = 0;
    const video: DeviceInfo[] = [];
    const audio: DeviceInfo[] = [];

    devices.forEach(d => {
      if (d.kind === 'videoinput') {
        video.push({ deviceId: d.deviceId, label: d.label || `Camera ${++vidIdx}` });
      } else if (d.kind === 'audioinput') {
        audio.push({ deviceId: d.deviceId, label: d.label || `Microphone ${++audIdx}` });
      }
      // 'audiooutput' devices are intentionally skipped
    });

    return { video, audio };
  }

  /** Ensure permission is granted so that device labels are populated. */
  private async _ensurePermission(type: 'video' | 'audio'): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        type === 'video' ? { video: true } : { audio: true }
      );
      stream.getTracks().forEach(t => t.stop());
    } catch {
      // Permission denied or device unavailable — enumeration will still work
      // but labels may be redacted by the browser.
    }
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
   *
   * @param channelName    Agora channel name (use bookingId or streamId)
   * @param uid            Numeric UID for this user
   * @param cameraDeviceId Optional device ID for the video source. When omitted
   *                       Agora picks the system default. Pass the deviceId from
   *                       listVideoDevices() to target a specific USB camera,
   *                       capture card, virtual camera, etc.
   * @param micDeviceId    Optional device ID for the audio source.
   */
  async init(
    channelName: string,
    uid: number,
    cameraDeviceId?: string,
    micDeviceId?: string,
  ): Promise<AgoraTokenResponse> {
    const tokenData = await this.fetchToken(channelName, uid, 'publisher');

    // Build per-device configs — only set cameraId/microphoneId when provided
    const micConfig: Parameters<typeof AgoraRTC.createMicrophoneAndCameraTracks>[0] = {
      encoderConfig: 'high_quality_stereo',
      ...(micDeviceId ? { microphoneId: micDeviceId } : {}),
    };

    const camConfig: Parameters<typeof AgoraRTC.createMicrophoneAndCameraTracks>[1] = {
      encoderConfig: '1080p_1',
      ...(cameraDeviceId ? { cameraId: cameraDeviceId } : {}),
    };

    // Create local tracks with the chosen devices
    [this.localAudioTrack, this.localVideoTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks(micConfig, camConfig);

    // Join channel
    await this.client.join(tokenData.appId, channelName, tokenData.token, uid);

    // Publish local tracks
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

    console.log('[Agora] Joined and published to channel:', channelName,
      '| cam:', cameraDeviceId || 'default',
      '| mic:', micDeviceId || 'default');

    return tokenData;
  }

  // ─── Video element binding ───────────────────────────────────────────────────
  /** Play local video preview inside the given HTML element container */
  playLocalVideo(container: HTMLElement) {
    this.localVideoTrack?.play(container);
  }

  /** Stop local video preview */
  stopLocalVideo() {
    this.localVideoTrack?.stop();
  }

  /** Mute/unmute local audio */
  setMuted(muted: boolean) {
    this.localAudioTrack?.setMuted(muted);
  }

  /** Enable/disable local video */
  setCameraEnabled(enabled: boolean) {
    this.localVideoTrack?.setEnabled(enabled);
  }

  // ─── Hot-Switch Camera & Mic ─────────────────────────────────────────────────

  /**
   * Switch to a different camera while the stream is live.
   * Does NOT rejoin the channel — Agora replaces the published video track.
   *
   * Compatible with: USB webcams, HDMI capture cards, OBS Virtual Camera,
   * EpocCam, DroidCam, Camo, mobile webcam mode, etc.
   *
   * @param deviceId  The deviceId from listVideoDevices()
   */
  async switchCamera(deviceId: string): Promise<void> {
    if (!this.localVideoTrack) {
      console.warn('[Agora] switchCamera called but no local video track exists.');
      return;
    }
    try {
      await this.localVideoTrack.setDevice(deviceId);
      console.log('[Agora] Camera switched to device:', deviceId);
    } catch (err) {
      console.error('[Agora] Failed to switch camera:', err);
      throw err;
    }
  }

  /**
   * Switch to a different microphone while the stream is live.
   * Does NOT rejoin the channel.
   *
   * @param deviceId  The deviceId from listAudioDevices()
   */
  async switchMicrophone(deviceId: string): Promise<void> {
    if (!this.localAudioTrack) {
      console.warn('[Agora] switchMicrophone called but no local audio track exists.');
      return;
    }
    try {
      await this.localAudioTrack.setDevice(deviceId);
      console.log('[Agora] Microphone switched to device:', deviceId);
    } catch (err) {
      console.error('[Agora] Failed to switch microphone:', err);
      throw err;
    }
  }

  /**
   * Attempt graceful fallback when the active camera is disconnected.
   * Tries to switch to the first available remaining video device.
   * Calls `onDeviceFallback('video', newDeviceId | null)` when done.
   */
  async handleCameraDisconnect(availableDevices: DeviceInfo[]): Promise<string | null> {
    if (availableDevices.length === 0) {
      console.warn('[Agora] No fallback camera available after disconnect.');
      if (this.onDeviceFallback) this.onDeviceFallback('video', null);
      return null;
    }
    const fallback = availableDevices[0];
    try {
      await this.switchCamera(fallback.deviceId);
      console.log('[Agora] Fell back to camera:', fallback.label);
      if (this.onDeviceFallback) this.onDeviceFallback('video', fallback.deviceId);
      return fallback.deviceId;
    } catch {
      if (this.onDeviceFallback) this.onDeviceFallback('video', null);
      return null;
    }
  }

  /**
   * Attempt graceful fallback when the active mic is disconnected.
   */
  async handleMicDisconnect(availableDevices: DeviceInfo[]): Promise<string | null> {
    if (availableDevices.length === 0) {
      console.warn('[Agora] No fallback microphone available after disconnect.');
      if (this.onDeviceFallback) this.onDeviceFallback('audio', null);
      return null;
    }
    const fallback = availableDevices[0];
    try {
      await this.switchMicrophone(fallback.deviceId);
      console.log('[Agora] Fell back to mic:', fallback.label);
      if (this.onDeviceFallback) this.onDeviceFallback('audio', fallback.deviceId);
      return fallback.deviceId;
    } catch {
      if (this.onDeviceFallback) this.onDeviceFallback('audio', null);
      return null;
    }
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
    this.localAudioTrack = null;
    this.localVideoTrack = null;
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
