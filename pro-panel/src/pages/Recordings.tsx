import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export function Recordings() {
  const { templeId } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Modal states
  const [previewingRec, setPreviewingRec] = useState<any | null>(null);
  const [uploadingRec, setUploadingRec] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Video play state simulation
  const [isPlaying, setIsPlaying] = useState(false);

  // Add recording modal state
  const [isAddingRecording, setIsAddingRecording] = useState(false);
  const [newRecPoojaName, setNewRecPoojaName] = useState('');
  const [newRecSlotDate, setNewRecSlotDate] = useState('');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const handleAddRecording = async () => {
    if (!newRecPoojaName.trim() || !newRecSlotDate) return;
    setIsSubmittingAdd(true);
    try {
      const recId = uuidv4();
      await setDoc(doc(db, 'recordings', recId), {
        templeId: templeId || 'temple-1', // Mock temple ID
        status: 'PROCESSING',
        poojaName: newRecPoojaName.trim(),
        slotDate: newRecSlotDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsAddingRecording(false);
      setNewRecPoojaName('');
      setNewRecSlotDate('');
      setNotification(`Recording for ${newRecPoojaName.trim()} added successfully.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Error adding recording", err);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  useEffect(() => {
    // For demo purposes, we will fetch all recordings and try to augment with booking info.
    // In a real app, you would query by templeId.
    const q = query(collection(db, 'recordings'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const promises = snapshot.docs.map(async (d) => {
        const data = d.data();
        let poojaName = data.poojaName || "Unknown Pooja";
        let slotDate = data.slotDate || "Unknown Date";

        if (data.bookingId) {
          const bDoc = await getDoc(doc(db, 'bookings', data.bookingId));
          if (bDoc.exists()) {
            const bData = bDoc.data();
            poojaName = bData.poojaName || poojaName;
            slotDate = bData.dateTime || slotDate;
          }
        }

        return {
          id: d.id,
          ...data,
          poojaName,
          slotDate,
          timestamp: data.createdAt ? data.createdAt.toMillis() : 0
        };
      });
      const resolved = await Promise.all(promises);
      resolved.sort((a, b) => b.timestamp - a.timestamp);
      setRecordings(resolved);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateSystemEvent = async (type: string, payload: any) => {
    try {
      const eventId = uuidv4();
      await setDoc(doc(db, 'systemEvents', eventId), {
        eventId,
        eventType: type,
        payload,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error generating event:', error);
    }
  };

  const generateAuditLog = async (action: string, entityId: string, details: string) => {
    try {
      const logId = uuidv4();
      await setDoc(doc(db, 'auditLogs', logId), {
        logId,
        action,
        entityType: 'recording',
        entityId,
        userId: 'PRO_USER',
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error generating audit log:', error);
    }
  };

  const handlePublish = async (rec: any) => {
    try {
      const recRef = doc(db, 'recordings', rec.id);
      await updateDoc(recRef, {
        status: 'PUBLISHED',
        updatedAt: serverTimestamp()
      });

      if (rec.bookingId) {
        const bookingRef = doc(db, 'bookings', rec.bookingId);
        await updateDoc(bookingRef, {
          recordingStatus: 'Available',
          updatedAt: serverTimestamp()
        });
      }

      await generateSystemEvent('recording.published', {
        recordingId: rec.id,
        bookingId: rec.bookingId,
        templeId: rec.templeId,
        userId: rec.userId || 'USER',
        status: 'PUBLISHED'
      });

      await generateAuditLog('PUBLISH_RECORDING', rec.id, `Published recording for booking ${rec.bookingId}`);

      setNotification(`Recording published! Devotees for ${rec.poojaName} have been notified.`);
      setPreviewingRec(null);
      setIsPlaying(false);
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('Error publishing recording:', error);
    }
  };

  const handleUnpublish = async (rec: any) => {
    try {
      const recRef = doc(db, 'recordings', rec.id);
      await updateDoc(recRef, {
        status: 'READY',
        updatedAt: serverTimestamp()
      });

      if (rec.bookingId) {
        const bookingRef = doc(db, 'bookings', rec.bookingId);
        await updateDoc(bookingRef, {
          recordingStatus: 'Unavailable',
          updatedAt: serverTimestamp()
        });
      }

      await generateSystemEvent('recording.unpublished', {
        recordingId: rec.id,
        bookingId: rec.bookingId,
        templeId: rec.templeId,
        userId: rec.userId || 'USER',
        status: 'READY'
      });

      await generateAuditLog('UNPUBLISH_RECORDING', rec.id, `Unpublished recording for booking ${rec.bookingId}`);

      setNotification(`Recording unpublished for ${rec.poojaName}.`);
      setPreviewingRec(null);
      setIsPlaying(false);
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('Error unpublishing recording:', error);
    }
  };

  const handleStartUpload = (rec: any) => {
    setUploadingRec(rec);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            try {
              const recRef = doc(db, 'recordings', rec.id);
              await updateDoc(recRef, {
                status: 'READY',
                duration: '1h 02m',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                updatedAt: serverTimestamp()
              });

              await generateSystemEvent('recording.uploaded', {
                recordingId: rec.id,
                bookingId: rec.bookingId,
                templeId: rec.templeId,
                userId: rec.userId || 'USER',
                status: 'READY'
              });

              await generateAuditLog('UPLOAD_RECORDING', rec.id, `Uploaded recording for booking ${rec.bookingId}`);

              setIsUploading(false);
              setUploadingRec(null);
              setNotification(`Recording for ${rec.poojaName} uploaded and is ready to publish.`);
              setTimeout(() => setNotification(null), 4000);
            } catch (error) {
              console.error('Error uploading recording:', error);
            }
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Dynamic status counters
  const processingCount = recordings.filter(r => r.status === 'PROCESSING').length;
  const readyCount = recordings.filter(r => r.status === 'READY').length;
  const publishedCount = recordings.filter(r => r.status === 'PUBLISHED').length;
  const archivedCount = recordings.filter(r => r.status === 'ARCHIVED').length;

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      <PageHeader title="Recording Manager" />
      
      {/* Toast Notification */}
      {notification && !notification.includes('published!') && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Publish Success Banner */}
      {notification && notification.includes('published!') && (
        <div className="bg-surface-container-highest border border-outline-variant p-4 rounded-lg flex items-center gap-3 text-on-surface shadow-sm mb-6 animate-fade-in font-medium">
          <span className="material-symbols-outlined text-secondary font-bold">check_circle</span>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-auto text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-6 mt-4">
        <div className="flex flex-col gap-2">
          <p className="text-body-lg text-on-surface-variant font-medium">Verify and publish pooja recordings to devotees.</p>
        </div>
        <button 
          onClick={() => setIsAddingRecording(true)}
          className="bg-primary text-on-primary font-sans text-button px-6 py-3 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 font-bold cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined flex items-center justify-center">add</span>
          Upload Recording
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 font-semibold">
        <div className="bg-surface-container-lowest border border-[#F0E6D2] p-4 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Processing</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md text-yellow-700">{processingCount}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-[#F0E6D2] p-4 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Ready to Publish</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md text-blue-700">{readyCount}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-[#F0E6D2] p-4 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Published</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md text-green-700">{publishedCount}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-[#F0E6D2] p-4 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Archived</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md text-gray-600">{archivedCount}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading recordings...</div>
      ) : recordings.length === 0 ? (
        <div className="bg-surface-container-lowest border border-[#F0E6D2] rounded-xl shadow-sm p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">videocam_off</span>
          <p className="text-body-lg font-medium">No recordings found.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-[#F0E6D2] rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant uppercase text-label-md font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Pooja Name</th>
                  <th className="px-6 py-4">Slot Date</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Recording Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-medium text-body-sm text-on-surface">
                {recordings.map(rec => {
                  const isProcessing = rec.status === 'PROCESSING';
                  const isReady = rec.status === 'READY';
                  const isPublished = rec.status === 'PUBLISHED';
                  const isArchived = rec.status === 'ARCHIVED';
                  
                  let borderLeft = 'border-l-4 border-transparent';
                  if (isProcessing) borderLeft = 'border-l-4 border-l-yellow-500';
                  if (isReady) borderLeft = 'border-l-4 border-l-blue-600';
                  if (isPublished) borderLeft = 'border-l-4 border-l-green-500';
                  if (isArchived) borderLeft = 'border-l-4 border-l-gray-400';
                  
                  return (
                    <tr key={rec.id} className={`hover:bg-surface-container-low/40 transition-colors ${borderLeft} ${isReady ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4 font-bold">{rec.poojaName}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{rec.slotDate}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{rec.duration || '—'}</td>
                      <td className="px-6 py-4">
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
                            <span className="material-symbols-outlined text-[13px] animate-spin">sync</span> Processing
                          </span>
                        )}
                        {isReady && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Ready to Publish
                          </span>
                        )}
                        {isPublished && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-800 border border-green-200">
                            Published
                          </span>
                        )}
                        {isArchived && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-300">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end font-bold">
                          {isProcessing && (
                            <button 
                              onClick={() => handleStartUpload(rec)}
                              className="px-4 py-1.5 rounded-full text-xs border-2 border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">upload</span> Upload
                            </button>
                          )}
                          {(isReady || isPublished) && (
                            <button 
                              onClick={() => setPreviewingRec(rec)}
                              className="px-4 py-1.5 rounded-full text-xs border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">play_arrow</span> Preview
                            </button>
                          )}
                          {isReady && (
                            <button 
                              onClick={() => handlePublish(rec)}
                              className="px-4 py-1.5 rounded-full text-xs bg-primary text-on-primary hover:bg-[#b04b00] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[15px]">check</span> Publish
                            </button>
                          )}
                          {isPublished && (
                            <button 
                              onClick={() => handleUnpublish(rec)}
                              className="px-4 py-1.5 rounded-full text-xs border-2 border-outline-variant text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span> Unpublish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewingRec && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-[800px] w-full overflow-hidden flex flex-col font-sans border border-[#F0E6D2]">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
              <div>
                <h3 className="font-display text-headline-sm text-on-surface font-bold">
                  {previewingRec.poojaName} — {previewingRec.slotDate}
                </h3>
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Duration {previewingRec.duration || '—'} | Quality HD 1080p
                </p>
              </div>
              <button 
                onClick={() => { setPreviewingRec(null); setIsPlaying(false); }}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Mock Player Canvas */}
            <div className="bg-black aspect-video relative flex items-center justify-center text-white">
              {isPlaying ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                  <span className="material-symbols-outlined text-[64px] animate-spin text-primary">sync</span>
                  <p className="text-sm font-semibold tracking-wide text-gray-300 mt-2">Simulating playback stream...</p>
                </div>
              ) : (
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="material-symbols-outlined text-white text-[72px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  play_circle
                </button>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 text-white font-medium text-xs">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="material-symbols-outlined cursor-pointer hover:text-primary"
                >
                  {isPlaying ? 'pause' : 'play_arrow'}
                </button>
                <div className="h-1 bg-white/30 flex-grow rounded-full overflow-hidden">
                  <div className={`h-full bg-primary transition-all duration-1000 ${isPlaying ? 'w-2/3' : 'w-1/3'}`}></div>
                </div>
                <span>{isPlaying ? '28:14' : '15:23'} / {previewingRec.duration || '45m'}</span>
                <span className="material-symbols-outlined">volume_up</span>
                <span className="material-symbols-outlined">fullscreen</span>
              </div>
            </div>

            <div className="p-6 bg-surface flex flex-col gap-4 font-semibold">
              <div className="flex items-start gap-2 text-[#a04100] bg-primary-container/10 p-3 rounded-lg border border-primary/20">
                <span className="material-symbols-outlined">info</span>
                <p className="text-body-sm font-bold">
                  {previewingRec.status === 'READY' 
                    ? "Publishing this recording will notify the devotee immediately."
                    : "This recording is currently published to devotees."}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/30">
                <button 
                  onClick={() => { setPreviewingRec(null); setIsPlaying(false); }}
                  className="px-6 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors rounded-full cursor-pointer"
                >
                  Close
                </button>
                {previewingRec.status === 'READY' && (
                  <button 
                    onClick={() => handlePublish(previewingRec)}
                    className="px-6 py-2 bg-primary text-on-primary hover:bg-[#b04b00] rounded-full flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">check</span> 
                    Publish
                  </button>
                )}
                {previewingRec.status === 'PUBLISHED' && (
                  <button 
                    onClick={() => handleUnpublish(previewingRec)}
                    className="px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-container rounded-full flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span> 
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Uploading Loader Modal */}
      {isUploading && uploadingRec && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#F0E6D2] font-sans">
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-4">
              Uploading Recording — {uploadingRec.poojaName}
            </h3>
            
            <div className="border-2 border-dashed border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-surface-bright mb-6">
              <span className="material-symbols-outlined text-[48px] text-primary animate-bounce">cloud_upload</span>
              <p className="text-body-md text-on-surface font-bold">Uploading video file...</p>
            </div>

            <div className="flex flex-col gap-2 font-semibold">
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Progress: {uploadProgress}%</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-150" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Recording Modal */}
      {isAddingRecording && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#F0E6D2] font-sans">
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-4">Upload New Recording</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-semibold">Pooja Name</label>
                <input 
                  type="text" 
                  value={newRecPoojaName}
                  onChange={(e) => setNewRecPoojaName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="e.g., Rudrabhishekam"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-semibold">Date</label>
                <input 
                  type="date" 
                  value={newRecSlotDate}
                  onChange={(e) => setNewRecSlotDate(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsAddingRecording(false)}
                  className="px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-container rounded-full font-semibold cursor-pointer"
                  disabled={isSubmittingAdd}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddRecording}
                  disabled={!newRecPoojaName.trim() || !newRecSlotDate || isSubmittingAdd}
                  className="px-6 py-2 bg-primary text-on-primary hover:bg-[#b04b00] rounded-full font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAdd ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
