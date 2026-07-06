require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

// Firebase initialization
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'queries-db.json');

app.use(cors());
app.use(express.json());

// ─── Agora Token Endpoint ─────────────────────────────────────────────────────
// GET /api/agora/token?channelName=<ch>&uid=<uid>&role=publisher|subscriber
app.get('/api/agora/token', (req, res) => {
  const { channelName, uid, role } = req.query;

  const appId = process.env.AGORA_APP_ID;
  const appCert = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCert) {
    return res.status(500).json({ error: 'Agora credentials not configured on server. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE env vars.' });
  }

  if (!channelName || !uid) {
    return res.status(400).json({ error: 'channelName and uid are required' });
  }

  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCert,
      channelName,
      parseInt(uid, 10),
      rtcRole,
      privilegeExpiredTs
    );
    res.json({ token, appId, channelName, uid, expiresAt: privilegeExpiredTs });
  } catch (e) {
    console.error('Agora token generation failed:', e);
    res.status(500).json({ error: 'Token generation failed', detail: e.message });
  }
});
// ─── Agora Cloud Recording Endpoints ─────────────────────────────────────────

const AGORA_RECORDING_API = 'https://api.agora.io/v1/apps';

function getAgoraBasicAuth() {
  const key = process.env.AGORA_CUSTOMER_KEY;
  const secret = process.env.AGORA_CUSTOMER_SECRET;
  if (!key || !secret) return null;
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

// POST /api/agora/recording/start  { channelName, uid }
app.post('/api/agora/recording/start', async (req, res) => {
  const { channelName, uid } = req.body;
  const appId = process.env.AGORA_APP_ID;
  const auth = getAgoraBasicAuth();

  if (!auth || !appId) {
    return res.status(500).json({ error: 'Agora credentials not configured. Set AGORA_APP_ID, AGORA_CUSTOMER_KEY, AGORA_CUSTOMER_SECRET.' });
  }

  try {
    // Step 1: Acquire resourceId
    const acquireRes = await fetch(`${AGORA_RECORDING_API}/${appId}/cloud_recording/acquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({ cname: channelName, uid: String(uid), clientRequest: { resourceExpiredHour: 24 } })
    });
    const acquireData = await acquireRes.json();
    if (!acquireData.resourceId) {
      return res.status(500).json({ error: 'Failed to acquire Agora resource', detail: acquireData });
    }

    // Step 2: Start recording
    const startRes = await fetch(`${AGORA_RECORDING_API}/${appId}/cloud_recording/resourceid/${acquireData.resourceId}/mode/mix/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        cname: channelName,
        uid: String(uid),
        clientRequest: {
          token: '', // Empty token when recording is on the backend side
          storageConfig: {
            // Uses Agora's own storage; replace with your S3/GCS config for production
            vendor: 2, // 2 = Google Cloud Storage
            region: 5, // 5 = asia-south1
            bucket: process.env.AGORA_STORAGE_BUCKET || '',
            accessKey: process.env.AGORA_STORAGE_KEY || '',
            secretKey: process.env.AGORA_STORAGE_SECRET || '',
            fileNamePrefix: ['recordings', channelName]
          },
          recordingConfig: {
            channelType: 0,
            streamTypes: 2,
            audioProfile: 1,
            videoStreamType: 0,
            maxIdleTime: 30,
            transcodingConfig: {
              width: 1280, height: 720, fps: 30,
              bitrate: 2000,
              mixedVideoLayout: 1
            }
          }
        }
      })
    });
    const startData = await startRes.json();
    res.json({ resourceId: acquireData.resourceId, sid: startData.sid, uid: String(uid) });
  } catch (e) {
    console.error('[Agora Recording] Start error:', e);
    res.status(500).json({ error: 'Cloud recording start failed', detail: e.message });
  }
});

// POST /api/agora/recording/stop  { channelName, resourceId, sid, uid }
app.post('/api/agora/recording/stop', async (req, res) => {
  const { channelName, resourceId, sid, uid } = req.body;
  const appId = process.env.AGORA_APP_ID;
  const auth = getAgoraBasicAuth();

  if (!auth || !appId) {
    return res.status(500).json({ error: 'Agora credentials not configured.' });
  }

  try {
    const stopRes = await fetch(`${AGORA_RECORDING_API}/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        cname: channelName,
        uid: String(uid),
        clientRequest: {}
      })
    });
    const stopData = await stopRes.json();
    const fileList = stopData?.serverResponse?.fileList || [];
    res.json({ success: true, fileList, raw: stopData });
  } catch (e) {
    console.error('[Agora Recording] Stop error:', e);
    res.status(500).json({ error: 'Cloud recording stop failed', detail: e.message });
  }
});

// ─── YouTube Upload Endpoints ─────────────────────────────────────────────────
// Requires: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN

const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function getYouTubeAccessToken() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('YouTube credentials not configured. Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN.');
  }

  const res = await fetch(YOUTUBE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString()
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to get YouTube access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

/**
 * POST /api/youtube/upload
 * Body: { videoUrl, title, description, poojaName, templeName, recordingId }
 *
 * Uploads a video from a URL to YouTube as an unlisted video.
 * Returns { youtubeVideoId, youtubeLiveUrl }.
 *
 * Two strategies:
 *  1. If googleapis is installed: use the resumable upload API with a piped stream.
 *  2. If videoUrl is a direct download URL, we fetch → pipe → upload.
 */
app.post('/api/youtube/upload', async (req, res) => {
  const { videoUrl, title, description, poojaName, templeName, recordingId } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  let googleapis;
  try {
    googleapis = require('googleapis');
  } catch (_) {
    return res.status(500).json({ error: 'googleapis package not available. Run: npm install googleapis' });
  }

  try {
    const accessToken = await getYouTubeAccessToken();
    const { google } = googleapis;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Fetch the video file from the URL and pipe it to YouTube
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return res.status(400).json({ error: `Failed to fetch video from URL: ${videoRes.statusText}` });
    }

    const videoTitle = title || `${poojaName || 'Pooja'} — ${templeName || 'Temple'} | Doshanivarana`;
    const videoDescription = description ||
      `Live pooja recording — ${poojaName || ''} at ${templeName || ''}\n` +
      `Captured and archived via the Doshanivarana platform.\n` +
      `Recording ID: ${recordingId || 'N/A'}`;

    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: ['pooja', 'temple', 'doshanivarana', poojaName, templeName].filter(Boolean),
          categoryId: '22', // People & Blogs
          defaultLanguage: 'te',
          defaultAudioLanguage: 'te',
        },
        status: {
          privacyStatus: 'unlisted', // Unlisted so only users with the link can watch
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: Readable.fromWeb(videoRes.body),
      },
    });

    const videoId = uploadResponse.data.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`[YouTube] Uploaded video: ${videoId} — ${videoTitle}`);
    res.json({ youtubeVideoId: videoId, youtubeLiveUrl: youtubeUrl });

  } catch (e) {
    console.error('[YouTube] Upload error:', e);
    res.status(500).json({ error: 'YouTube upload failed', detail: e.message });
  }
});

/**
 * GET /api/youtube/status/:videoId
 * Returns current processing status of a YouTube video.
 */
app.get('/api/youtube/status/:videoId', async (req, res) => {
  const { videoId } = req.params;

  let googleapis;
  try {
    googleapis = require('googleapis');
  } catch (_) {
    return res.status(500).json({ error: 'googleapis not available' });
  }

  try {
    const accessToken = await getYouTubeAccessToken();
    const { google } = googleapis;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.videos.list({
      part: ['status', 'processingDetails', 'snippet'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      videoId,
      uploadStatus: video.status?.uploadStatus,
      privacyStatus: video.status?.privacyStatus,
      processingStatus: video.processingDetails?.processingStatus,
      title: video.snippet?.title,
      youtubeLiveUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
  } catch (e) {
    console.error('[YouTube] Status check error:', e);
    res.status(500).json({ error: 'Status check failed', detail: e.message });
  }
});

// ─── Stream Readiness Checklist Endpoints ─────────────────────────────────────

const READINESS_TEMPLATE_PATH = path.join(__dirname, 'readiness-db.json');
const getReadinessTemplate = () => {
  try {
    return JSON.parse(fs.readFileSync(READINESS_TEMPLATE_PATH, 'utf8'));
  } catch (e) {
    console.error('Failed to read readiness checklist template:', e);
    return [];
  }
};

function calculateProgressAndLocking(stages) {
  let prevStageCompleted = true; // First stage is always unlocked
  let completedItemsCount = 0;
  let totalItemsCount = 0;
  let currentStageId = null;

  stages.forEach((stage) => {
    // Count items
    const stageItems = stage.items || [];
    const stageTotal = stageItems.length;
    const stageCompleted = stageItems.filter(i => i.completed).length;

    totalItemsCount += stageTotal;
    completedItemsCount += stageCompleted;

    // Check if stage is complete
    const isStageFullyComplete = stageTotal > 0 && stageCompleted === stageTotal;

    if (prevStageCompleted) {
      if (isStageFullyComplete) {
        stage.status = 'COMPLETED';
      } else {
        stage.status = 'IN_PROGRESS';
        if (!currentStageId) {
          currentStageId = stage.id;
        }
      }
    } else {
      stage.status = 'LOCKED';
    }

    prevStageCompleted = prevStageCompleted && isStageFullyComplete;
  });

  const progressPercent = totalItemsCount > 0
    ? Math.round((completedItemsCount / totalItemsCount) * 100)
    : 0;

  const isReady = completedItemsCount === totalItemsCount;
  if (isReady) {
    currentStageId = 'stage5'; // completed state
  }

  return {
    progressPercent,
    isReady,
    currentStageId
  };
}

const getPoojaItems = (poojaId, poojaName) => {
  const name = (poojaName || '').toLowerCase();
  const id = (poojaId || '').toLowerCase();

  if (name.includes('satyanarayana') || id.includes('satyanarayana')) {
    return [
      { id: "item_idol", label: "Shri Satyanarayana Murti / Photo", completed: false, isMandatory: true },
      { id: "item_chowki", label: "Pooja Chowki & Yellow Cloth", completed: false, isMandatory: true },
      { id: "item_leaves", label: "Banana Leaves & Kalash Setup", completed: false, isMandatory: true },
      { id: "item_panchamrit", label: "Panchamrit (Milk, Curd, Ghee, Honey, Sugar)", completed: false, isMandatory: true },
      { id: "item_thread", label: "Saptarishi Thread & Mouli", completed: false, isMandatory: true },
      { id: "item_prasad", label: "Prasad (Sheera/Suji Halwa)", completed: false, isMandatory: true }
    ];
  }
  
  if (name.includes('rudra') || name.includes('shiva') || id.includes('rudra') || id.includes('shiva') || name.includes('abihkesam') || name.includes('abhishekam') || id.includes('abihkesam') || id.includes('abhishekam') || name.includes('abhishek') || id.includes('abhishek') || name.includes('abiheskam') || id.includes('abiheskam') || name.includes('abihsekam') || id.includes('abihsekam')) {
    return [
      { id: "item_linga", label: "Shivalinga (Pancha Dhatu / Stone)", completed: false, isMandatory: true },
      { id: "item_water", label: "Gangajal & Rose Water", completed: false, isMandatory: true },
      { id: "item_leaves", label: "Bilva Leaves (Bel Patra) & Dhatura", completed: false, isMandatory: true },
      { id: "item_bhasma", label: "Bhasma (Sacred Ash) & Sandalwood Paste", completed: false, isMandatory: true },
      { id: "item_milk", label: "Fresh Milk, Honey & Coconut Water", completed: false, isMandatory: true },
      { id: "item_rudraksha", label: "Rudraksha Mala & Panchamrit", completed: false, isMandatory: true }
    ];
  }

  if (name.includes('chandi') || name.includes('durga') || id.includes('chandi') || id.includes('durga') || name.includes('homa') || id.includes('homa') || name.includes('homam') || id.includes('homam')) {
    return [
      { id: "item_durga", label: "Maa Durga Photo / Idol", completed: false, isMandatory: true },
      { id: "item_kund", label: "Havan Kund & Mango Wood", completed: false, isMandatory: true },
      { id: "item_ghee", label: "Ghee & Havan Samagri", completed: false, isMandatory: true },
      { id: "item_flowers", label: "Red Flowers & Kumkum", completed: false, isMandatory: true },
      { id: "item_coconut", label: "Dry Fruits & Coconut for Purnahuti", completed: false, isMandatory: true },
      { id: "item_cloth", label: "Saree / Red Cloth offering", completed: false, isMandatory: true }
    ];
  }

  if (name.includes('navagraha') || id.includes('navagraha')) {
    return [
      { id: "item_navagraha", label: "Navagraha Yantra / Photo", completed: false, isMandatory: true },
      { id: "item_cloths", label: "Nine Colors Cloths (for Nine Planets)", completed: false, isMandatory: true },
      { id: "item_sesame", label: "Sesame Oil & Black Sesame Seeds", completed: false, isMandatory: true },
      { id: "item_grains", label: "Nine varieties of Grains (Navadhanya)", completed: false, isMandatory: true },
      { id: "item_thread", label: "Mouli & Janeu (Sacred Thread)", completed: false, isMandatory: true },
      { id: "item_havan", label: "Havan Wood & Camphor", completed: false, isMandatory: true }
    ];
  }

  if (name.includes('ganapathi') || name.includes('ganesh') || id.includes('ganapathi') || id.includes('ganesh')) {
    return [
      { id: "item_ganesha", label: "Ganesha Idol (Turmeric/Clay/Metal)", completed: false, isMandatory: true },
      { id: "item_durva", label: "Durva Grass (21 blades)", completed: false, isMandatory: true },
      { id: "item_modak", label: "Modak or Ladoo offering", completed: false, isMandatory: true },
      { id: "item_sandal", label: "Red Sandalwood & Hibiscus Flowers", completed: false, isMandatory: true },
      { id: "item_coconut", label: "Coconut & Betel Leaves", completed: false, isMandatory: true },
      { id: "item_havan", label: "Havan Samagri & Ghee", completed: false, isMandatory: true }
    ];
  }

  // Fallback / General Pooja
  return [
    { id: "item_deity", label: "Idol/Photo of Deity", completed: false, isMandatory: true },
    { id: "item_thali", label: "Pooja Thali (Haldi, Kumkum, Akshata)", completed: false, isMandatory: true },
    { id: "item_incense", label: "Incense Sticks (Agarbatti) & Dhoop", completed: false, isMandatory: true },
    { id: "item_diya", label: "Brass Diya & Sesame Oil/Ghee", completed: false, isMandatory: true },
    { id: "item_flowers", label: "Fresh Flowers & Garlands", completed: false, isMandatory: true },
    { id: "item_coconut", label: "Coconuts & Betel Leaves/Nuts", completed: false, isMandatory: true }
  ];
};

// GET /api/stream-readiness/:bookingId
app.get('/api/stream-readiness/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  let { poojaId, templeId } = req.query;

  try {
    const docRef = doc(firestoreDb, 'streamReadiness', bookingId);
    const snap = await getDoc(docRef);

    // Fetch booking details from Firestore to get poojaName, poojaId, and templeId if missing
    const bookingDocRef = doc(firestoreDb, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);
    let poojaName = '';
    if (bookingSnap.exists()) {
      const bData = bookingSnap.data();
      poojaName = bData.poojaName || '';
      if (!poojaId) poojaId = bData.poojaId || '';
      if (!templeId) templeId = bData.templeId || '';
    }

    const poojaItems = getPoojaItems(poojaId, poojaName);

    if (snap.exists()) {
      const data = snap.data();
      let updated = false;
      const stages = data.stages || [];
      const stage1 = stages.find(s => s.id === 'stage1');
      if (stage1) {
        const currentItemIds = (stage1.items || []).map(i => i.id).join(',');
        const targetItemIds = poojaItems.map(i => i.id).join(',');

        if (stage1.title !== 'Stage 1: Pooja Preparation' || currentItemIds !== targetItemIds) {
          stage1.title = 'Stage 1: Pooja Preparation';
          stage1.icon = 'spa';
          // Replace with the dynamic pooja items, keeping completed state if IDs match
          stage1.items = poojaItems.map(newItem => {
            const oldMatch = stage1.items.find(oi => oi.id === newItem.id);
            return {
              ...newItem,
              completed: oldMatch ? oldMatch.completed : false
            };
          });
          updated = true;
        }
      }

      const stage2 = stages.find(s => s.id === 'stage2');
      if (stage2) {
        const currentItemIds = (stage2.items || []).map(i => i.id).join(',');
        if (currentItemIds !== 'camera_positioned,mic_tested') {
          stage2.items = [
            { id: "camera_positioned", label: "Camera Position", completed: stage2.items.find(i => i.id === 'camera_positioned')?.completed || false, isMandatory: true },
            { id: "mic_tested", label: "Microphone Tested", completed: stage2.items.find(i => i.id === 'mic_tested')?.completed || false, isMandatory: true }
          ];
          updated = true;
        }
      }

      if (stages.length > 2 || stages.some(s => s.id === 'stage3' || s.id === 'stage4')) {
        const activeStage1 = stages.find(s => s.id === 'stage1');
        const activeStage2 = stages.find(s => s.id === 'stage2');

        const newStages = [];
        if (activeStage1) newStages.push(activeStage1);
        if (activeStage2) newStages.push(activeStage2);

        stages.length = 0;
        stages.push(...newStages);
        updated = true;
      }

      if (updated) {
        const { progressPercent, isReady, currentStageId } = calculateProgressAndLocking(stages);
        const updatedData = {
          ...data,
          stages,
          progressPercent,
          isReady,
          currentStageId: currentStageId || 'stage1',
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, updatedData);
        return res.json(updatedData);
      }

      return res.json(data);
    }

    // Initialize new checklist from template
    const template = getReadinessTemplate();
    const stage1 = template.find(s => s.id === 'stage1');
    if (stage1) {
      stage1.title = 'Stage 1: Pooja Preparation';
      stage1.icon = 'spa';
      stage1.items = poojaItems;
    }

    const { progressPercent, isReady, currentStageId } = calculateProgressAndLocking(template);

    const initialData = {
      bookingId,
      poojaId: poojaId || '',
      templeId: templeId || '',
      stages: template,
      progressPercent,
      isReady,
      currentStageId: currentStageId || 'stage1',
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, initialData);
    res.json(initialData);
  } catch (e) {
    console.error('[Readiness] Fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch stream readiness checklist', detail: e.message });
  }
});

// POST /api/stream-readiness/:bookingId/toggle
app.post('/api/stream-readiness/:bookingId/toggle', async (req, res) => {
  const { bookingId } = req.params;
  const { stageId, itemId } = req.body;

  if (!stageId || !itemId) {
    return res.status(400).json({ error: 'stageId and itemId are required' });
  }

  try {
    const docRef = doc(firestoreDb, 'streamReadiness', bookingId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return res.status(404).json({ error: 'Readiness checklist not found for this booking' });
    }

    const data = snap.data();
    const stages = data.stages || [];

    // Find the item and toggle it
    let found = false;
    for (const stage of stages) {
      if (stage.id === stageId) {
        if (stage.status === 'LOCKED') {
          return res.status(400).json({ error: 'Cannot toggle items in a locked stage' });
        }
        for (const item of stage.items || []) {
          if (item.id === itemId) {
            item.completed = !item.completed;
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Recalculate
    const { progressPercent, isReady, currentStageId } = calculateProgressAndLocking(stages);

    const updatedData = {
      ...data,
      stages,
      progressPercent,
      isReady,
      currentStageId: currentStageId || 'stage1',
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, updatedData, { merge: true });

    // Synchronize status back to the booking document
    const bookingDocRef = doc(firestoreDb, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);
    if (bookingSnap.exists()) {
      await updateDoc(bookingDocRef, {
        readinessProgress: progressPercent,
        readinessStatus: isReady ? 'READY' : 'IN_PROGRESS',
        // Update streamStatus in booking if complete so devotee app knows
        streamStatus: isReady ? 'READY' : 'IN_PROGRESS'
      });
    }

    res.json(updatedData);
  } catch (e) {
    console.error('[Readiness] Toggle error:', e);
    res.status(500).json({ error: 'Failed to toggle checklist item', detail: e.message });
  }
});

// ─── Query Helpers ────────────────────────────────────────────────────────────

// Helper to get relative date/time strings for seeding
const getRelativeDateTimeStr = (daysOffset, timeStr) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${formattedDate}, ${timeStr}`;
};

// Initial Seed Data
const defaultQueries = [
  {
    id: 'Q-101',
    bookingId: 'BK-1001',
    devoteeName: 'Rajesh Kumar',
    timeAgo: '2 hours ago',
    subject: 'Can I reschedule my pooja date?',
    snippet: 'Namaste, I have booked Satyanarayana Pooja...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Rajesh Kumar',
        avatarText: 'RK',
        time: getRelativeDateTimeStr(0, '08:30 AM'),
        text: 'Namaste, I have booked the Satyanarayana Pooja for today. Due to a family emergency I need to know if there is any option to move it to a different date. Please help. Thank you.'
      }
    ]
  },
  {
    id: 'Q-102',
    bookingId: 'BK-1002',
    devoteeName: 'Priya Sharma',
    timeAgo: '5 hours ago',
    subject: 'When will recording be available?',
    snippet: 'I watched the pooja live but wanted to download...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Priya Sharma',
        avatarText: 'PS',
        time: getRelativeDateTimeStr(0, '05:15 AM'),
        text: 'I watched the pooja live but wanted to download the high quality recording file to share with my relatives. Will it be sent via email or is it available inside the portal?'
      }
    ]
  },
  {
    id: 'Q-103',
    bookingId: 'BK-1003',
    devoteeName: 'Anand Reddy',
    timeAgo: 'Yesterday',
    subject: 'Prasad delivery status',
    snippet: 'My parcel was dispatched 3 days ago but has not...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Anand Reddy',
        avatarText: 'AR',
        time: getRelativeDateTimeStr(-1, '04:20 PM'),
        text: 'My parcel was dispatched 3 days ago according to the notification, but the tracking ID is not updating on BlueDart. Can you check if it was picked up?'
      }
    ]
  },
  {
    id: 'Q-104',
    bookingId: 'BK-1004',
    devoteeName: 'Sunita Devi',
    timeAgo: '2 days ago',
    subject: 'Booking confirmation not received',
    snippet: 'I completed payment but did not get confirmation...',
    status: 'Replied',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Sunita Devi',
        avatarText: 'SD',
        time: getRelativeDateTimeStr(-2, '09:10 AM'),
        text: 'I completed payment of Rs.1500 on UPI but did not get any booking confirmation email or slot details. Please verify payment.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-2, '11:30 AM'),
        text: 'Namaste Sunita Devi, we checked our system and confirmed your payment for Booking BK-1004. You should have received the notification on the app now. Let us know if you need more assistance.'
      }
    ]
  },
  {
    id: 'Q-105',
    bookingId: 'BK-1005',
    devoteeName: 'Kiran Patel',
    timeAgo: '3 days ago',
    subject: 'Pujari name for my pooja',
    snippet: 'Who is the pujari assigned for Satyanarayana?',
    status: 'Replied',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Kiran Patel',
        avatarText: 'KP',
        time: getRelativeDateTimeStr(-3, '11:15 AM'),
        text: 'Who is the pujari assigned for Satyanarayana pooja? It says Pt. Sharma Ji or Pt. Acharya? I want to know who is the main priest.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-3, '02:00 PM'),
        text: 'Namaste Kiran Patel, Pt. Sharma Ji is assigned for your Satyanarayana pooja. He will contact you 1 hour before the pooja.'
      }
    ]
  }
];

// Read from JSON DB or return seeds
const readQueries = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(rawData);
      let updated = false;
      parsed.forEach(q => {
        if (!q.temple) {
          q.temple = 'Sri Venkateswara Temple';
          updated = true;
        }
      });
      if (updated) {
        writeQueries(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading queries database, returning seeded data:', e);
  }
  // Seeding initial database
  const seeded = defaultQueries.map(q => ({
    ...q,
    temple: q.temple || 'Sri Venkateswara Temple'
  }));
  writeQueries(seeded);
  return seeded;
};

// Write to JSON DB
const writeQueries = (queries) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(queries, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing queries database:', e);
  }
};

// Endpoints

// 1. Get all queries
app.get('/api/queries', (req, res) => {
  const queries = readQueries();
  const { devoteeName, bookingId, temple } = req.query;

  let filtered = queries;
  if (devoteeName) {
    filtered = filtered.filter(q => q.devoteeName.toLowerCase() === devoteeName.toLowerCase());
  }
  if (bookingId) {
    filtered = filtered.filter(q => q.bookingId === bookingId);
  }
  if (temple) {
    filtered = filtered.filter(q => q.temple && q.temple.toLowerCase() === temple.toLowerCase());
  }
  res.json(filtered);
});

// 2. Get specific query details
app.get('/api/queries/:id', (req, res) => {
  const queries = readQueries();
  const query = queries.find(q => q.id === req.params.id);
  if (!query) {
    return res.status(404).json({ error: 'Query not found' });
  }
  res.json(query);
});

// 3. Create a new query (devotee starts a query)
app.post('/api/queries', (req, res) => {
  const { bookingId, devoteeName, subject, text, avatarText, temple } = req.body;
  if (!devoteeName || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const queries = readQueries();
  const queryId = `Q-${100 + queries.length + 1}`;

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const newQuery = {
    id: queryId,
    bookingId: bookingId || 'BK-General',
    temple: temple || 'General Support',
    devoteeName,
    timeAgo: 'Just now',
    subject,
    snippet: text,
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: devoteeName,
        avatarText: avatarText || devoteeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        time: formattedTime,
        text
      }
    ]
  };

  queries.unshift(newQuery);
  writeQueries(queries);
  res.status(201).json(newQuery);
});

// 4. Send reply (either DEVOTEE or ADMIN)
app.post('/api/queries/:id/reply', (req, res) => {
  const { sender, senderName, avatarText, text } = req.body;
  if (!sender || !senderName || !text) {
    return res.status(400).json({ error: 'Missing required reply fields' });
  }

  const queries = readQueries();
  const index = queries.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  const query = queries[index];
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const newMsg = {
    sender,
    senderName,
    avatarText: avatarText || senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    time: formattedTime,
    text
  };

  query.thread.push(newMsg);
  query.snippet = text;
  query.timeAgo = 'Just now';
  query.status = sender === 'admin' ? 'Replied' : 'Open';

  queries[index] = query;
  writeQueries(queries);
  res.json(query);
});

// 5. Close a query
app.post('/api/queries/:id/close', (req, res) => {
  const queries = readQueries();
  const index = queries.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  queries[index].status = 'Closed';
  writeQueries(queries);
  res.json(queries[index]);
});

// 6. Reopen a query
app.post('/api/queries/:id/reopen', (req, res) => {
  const queries = readQueries();
  const index = queries.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  queries[index].status = 'Open';
  writeQueries(queries);
  res.json(queries[index]);
});

app.listen(PORT, () => {
  console.log(`Doshanivarana Chat Sync Backend running on port ${PORT}`);
});
