import { useState } from 'react';
import { db, type Recording } from '../lib/db';

export function Recordings() {
  const [recordings, setRecordings] = useState<Recording[]>(() => db.getRecordings());

  const [notification, setNotification] = useState<string | null>(null);
  
  // Modal states
  const [previewingRec, setPreviewingRec] = useState<Recording | null>(null);
  const [uploadingRec, setUploadingRec] = useState<Recording | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Video play state simulation
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePublish = (rec: Recording) => {
    const updated: Recording = { ...rec, status: 'Published' };
    db.updateRecording(updated);

    // Sync status to devotees' bookings
    const bookings = db.getBookings();
    const updatedBookings = bookings.map(b => {
      const matchesPooja = b.poojaName.toLowerCase() === rec.poojaName.toLowerCase();
      // Ensure the slotDate matches the booking's dateTime format (e.g. "09 Jun 2026")
      const matchesDate = b.dateTime.toLowerCase().includes(rec.slotDate.toLowerCase());
      if (matchesPooja && matchesDate) {
        return {
          ...b,
          recordingStatus: 'Available' as const,
          streamStatus: 'Ended' as const
        };
      }
      return b;
    });
    db.saveBookings(updatedBookings);

    // Dispatch custom event to notify other windows if running in the same browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
    }

    setRecordings(prev => prev.map(r => r.id === rec.id ? updated : r));
    setNotification(`Recording published! Download links sent to ${rec.bookingsCount} devotees for ${rec.poojaName} — ${rec.slotDate}.`);
    setPreviewingRec(null);
    setIsPlaying(false);
  };

  const handleStartUpload = (rec: Recording) => {
    setUploadingRec(rec);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const updated: Recording = { ...rec, status: 'Ready to Publish', duration: '1h 02m', autoSaved: 'No' };
            db.updateRecording(updated);
            setRecordings(p => p.map(r => r.id === rec.id ? updated : r));
            setIsUploading(false);
            setUploadingRec(null);
            setNotification(`Recording for ${rec.poojaName} uploaded and is ready to publish.`);
            setTimeout(() => setNotification(null), 4000);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Dynamic status counters
  const processingCount = recordings.filter(r => r.status === 'Processing').length;
  const readyCount = recordings.filter(r => r.status === 'Ready to Publish').length;
  const publishedCount = recordings.filter(r => r.status === 'Published').length;
  const uploadRequiredCount = recordings.filter(r => r.status === 'Upload Required').length;

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      
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
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="font-display text-headline-lg text-on-surface font-semibold">Recording Manager</h1>
        <p className="text-body-lg text-on-surface-variant font-medium">Verify and publish pooja recordings to devotees.</p>
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
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Upload Required</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-headline-md text-red-600">{uploadRequiredCount}</span>
          </div>
        </div>
      </div>

      {/* Recordings Table */}
      <div className="bg-surface-container-lowest border border-[#F0E6D2] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant uppercase text-label-md font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Pooja Name</th>
                <th className="px-6 py-4">Slot Date</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Auto-Saved</th>
                <th className="px-6 py-4">Recording Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-medium text-body-sm text-on-surface">
              {recordings.map(rec => {
                const isProcessing = rec.status === 'Processing';
                const isReady = rec.status === 'Ready to Publish';
                const isUpload = rec.status === 'Upload Required';
                const isPublished = rec.status === 'Published';
                
                let borderLeft = 'border-l-4 border-transparent';
                if (isProcessing) borderLeft = 'border-l-4 border-l-yellow-500';
                if (isReady) borderLeft = 'border-l-4 border-l-blue-600';
                if (isUpload) borderLeft = 'border-l-4 border-l-error';
                
                return (
                  <tr key={rec.id} className={`hover:bg-surface-container-low/40 transition-colors ${borderLeft} ${isReady ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-6 py-4 font-bold">{rec.poojaName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{rec.slotDate}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{rec.duration}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{rec.autoSaved}</td>
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
                      {isUpload && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">
                          Upload Required
                        </span>
                      )}
                      {isPublished && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-800 border border-green-200">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end font-bold">
                        {isProcessing && (
                          <>
                            <button disabled className="px-4 py-1.5 rounded-full text-xs border border-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed">Preview</button>
                            <button disabled className="px-4 py-1.5 rounded-full text-xs bg-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed">Publish</button>
                          </>
                        )}
                        {isReady && (
                          <>
                            <button 
                              onClick={() => setPreviewingRec(rec)}
                              className="px-4 py-1.5 rounded-full text-xs border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">play_arrow</span> Preview
                            </button>
                            <button 
                              onClick={() => handlePublish(rec)}
                              className="px-4 py-1.5 rounded-full text-xs bg-primary text-on-primary hover:bg-[#b04b00] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[15px]">check</span> Publish
                            </button>
                          </>
                        )}
                        {isUpload && (
                          <button 
                            onClick={() => handleStartUpload(rec)}
                            className="px-4 py-1.5 rounded-full text-xs border-2 border-error text-error hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">upload</span> Upload Recording
                          </button>
                        )}
                        {isPublished && (
                          <button 
                            onClick={() => setPreviewingRec(rec)}
                            className="px-4 py-1.5 rounded-full text-xs border-2 border-outline-variant text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">play_arrow</span> Preview
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
                  Duration {previewingRec.duration} | Quality HD 1080p
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
                  <p className="text-sm font-semibold tracking-wide text-gray-300 mt-2">Simulating live playback stream...</p>
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
                <span>{isPlaying ? '28:14' : '15:23'} / {previewingRec.duration === '—' ? '45m' : previewingRec.duration}</span>
                <span className="material-symbols-outlined">volume_up</span>
                <span className="material-symbols-outlined">fullscreen</span>
              </div>
            </div>

            <div className="p-6 bg-surface flex flex-col gap-4 font-semibold">
              <div className="flex items-start gap-2 text-[#a04100] bg-primary-container/10 p-3 rounded-lg border border-primary/20">
                <span className="material-symbols-outlined">info</span>
                <p className="text-body-sm font-bold">
                  Note: Publishing this recording notifies all {previewingRec.bookingsCount} booked devotees immediately.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/30">
                <button 
                  onClick={() => { setPreviewingRec(null); setIsPlaying(false); }}
                  className="px-6 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                {previewingRec.status === 'Ready to Publish' && (
                  <button 
                    onClick={() => handlePublish(previewingRec)}
                    className="px-6 py-2 bg-primary text-on-primary hover:bg-[#b04b00] rounded-full flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">check</span> 
                    Confirm &amp; Publish
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

    </div>
  );
}
