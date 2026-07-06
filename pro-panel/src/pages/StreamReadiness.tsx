// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { db as localDb } from '../lib/db';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const getDaysToGo = (dateTimeStr: string) => {
  try {
    const parts = dateTimeStr.split(',');
    if (parts.length > 0) {
      const dateVal = new Date(parts[0]);
      if (!isNaN(dateVal.getTime())) {
        const diffTime = dateVal.getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        return `${diffDays} days to go`;
      }
    }
  } catch {
    // Return fallback value if date parsing fails
  }
  return 'Scheduled';
};

export function StreamReadiness() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templeId } = useAuth();

  const bookingId = id || 'BK-1001';

  // Firestore-backed state
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [verifyingCamera, setVerifyingCamera] = useState(false);
  const [verifyingMic, setVerifyingMic] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

  // Mic analysis state
  const [micVolume, setMicVolume] = useState(0);
  const [micStatus, setMicStatus] = useState('Speaking or tapping mic...');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startMicChecking = () => {
    setMicStatus('Accessing microphone...');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setAudioStream(stream);
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          setMicStatus('Audio API not supported in browser');
          return;
        }
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let soundRegisterCount = 0;
        setMicStatus('Listening to mic input... speak now!');

        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setMicVolume(average);

          if (average > 12) {
            soundRegisterCount++;
            if (soundRegisterCount > 6) {
              setMicStatus('Microphone audio signal detected! ✅');
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      })
      .catch(err => {
        console.error(err);
        setMicStatus('Failed to access microphone: ' + err.message);
      });
  };

  const stopAudioStream = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const stopCameraStream = () => {
    if (cameraVideoRef.current && cameraVideoRef.current.srcObject) {
      const stream = cameraVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      cameraVideoRef.current.srcObject = null;
    }
  };

  const handleToggleClick = async (stageId: string, itemId: string) => {
    const stage = checklist?.stages?.find(s => s.id === stageId);
    const item = stage?.items?.find(i => i.id === itemId);
    const isCompleted = item?.completed;

    if (stageId === 'stage2' && !isCompleted) {
      if (itemId === 'camera_positioned') {
        setVerifyingCamera(true);
        // Start camera stream immediately
        setTimeout(() => {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
              if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
                cameraVideoRef.current.play().catch(console.error);
              }
            })
            .catch(err => {
              console.error(err);
              alert("Failed to access camera: " + err.message);
              setVerifyingCamera(false);
            });
        }, 100);
        return;
      }
      if (itemId === 'mic_tested') {
        setVerifyingMic(true);
        setTimeout(() => {
          startMicChecking();
        }, 100);
        return;
      }
    }

    // Default toggle behavior
    await toggleChecklistItem(stageId, itemId);
  };

  // Load readiness state on mount & listen to Firestore for real-time synchronization
  useEffect(() => {
    let unsubChecklist = () => {};

    const initialize = async () => {
      try {
        // Load booking data
        const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
        if (bookingSnap.exists()) {
          const bData = { id: bookingSnap.id, ...bookingSnap.data() };
          setBooking(bData);

          // Call backend GET /api/stream-readiness/:bookingId to make sure it is initialized
          const poojaId = bData.poojaId || '';
          const tId = templeId || bData.templeId || '';
          await fetch(`${BACKEND_URL}/api/stream-readiness/${bookingId}?poojaId=${poojaId}&templeId=${tId}`);
        } else {
          // Attempt initialize even if booking not found locally
          await fetch(`${BACKEND_URL}/api/stream-readiness/${bookingId}?poojaId=&templeId=${templeId || ''}`);
        }

        // Listen to streamReadiness collection in Firestore in real time
        unsubChecklist = onSnapshot(doc(db, 'streamReadiness', bookingId), (docSnap) => {
          if (docSnap.exists()) {
            setChecklist(docSnap.data());
          }
        });
      } catch (e) {
        console.error('Failed to initialize stream readiness checklist:', e);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      unsubChecklist();
    };
  }, [bookingId, templeId]);

  const toggleChecklistItem = async (stageId: string, itemId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/stream-readiness/${bookingId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId, itemId })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to toggle checklist item');
      }
      const updatedData = await res.json();
      setChecklist(updatedData);

      // Trigger local notification/alert if a stage gets completed!
      const oldStage = checklist?.stages?.find(s => s.id === stageId);
      const newStage = updatedData?.stages?.find(s => s.id === stageId);
      if (oldStage && newStage && oldStage.status !== 'COMPLETED' && newStage.status === 'COMPLETED') {
        localDb.addNotification(
          'Stream Readiness Gate',
          `${newStage.title} Complete for ${booking?.poojaName || 'Pooja'}.`,
          `/stream-readiness/${bookingId}`
        );
        setNotification(`${newStage.title} Verified!`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e: any) {
      console.error('Failed to toggle checklist item:', e);
      alert(e.message);
    }
  };

  const handleGoToLive = () => {
    if (!checklist?.isReady) return;
    navigate('/live-stream');
  };

  const progressPercent = checklist?.progressPercent || 0;

  if (loading || !checklist) {
    return (
      <div className="max-w-[1440px] mx-auto pb-32 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin">sync</span>
          <p className="text-on-surface-variant font-semibold">Loading readiness checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-32 relative font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      <PageHeader title="Stream Readiness Checklist" backTo="/live-stream" />

      {/* Page Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-primary font-bold text-[11px] uppercase tracking-wide border border-primary/10">
            {checklist?.isReady ? 'Ready to Stream' : 'Verification Required'}
          </span>
        </div>
        
        {checklist?.isReady ? (
          <button 
            onClick={handleGoToLive}
            className="px-6 py-3 bg-primary text-white font-button rounded-full flex items-center gap-3 hover:bg-[#b04b00] transition-colors shadow-md cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">sensors</span>
            Go to Live Stream
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        ) : (
          <button 
            className="px-6 py-3 border-2 border-outline-variant text-on-surface-variant font-button rounded-full flex items-center gap-3 cursor-not-allowed opacity-60 font-bold" 
            disabled
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Go to Live Stream
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left main forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Slot Selector Bar */}
          <div className="p-6 bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">event_available</span>
              </div>
              <div>
                <h3 className="font-display text-headline-sm text-on-surface font-bold">{booking?.poojaName || 'Pooja Setup'}</h3>
                <p className="text-on-surface-variant font-label-md font-semibold">{booking?.dateTime || 'Scheduled'}</p>
              </div>
            </div>
            <div className="flex gap-2 font-bold">
              <div className="px-3 py-1.5 rounded-full bg-error-container text-error text-[12px] flex items-center gap-1.5 border border-red-200">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                {booking?.scheduledDate ? getDaysToGo(booking.scheduledDate) : 'Today'}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] flex items-center gap-1.5 border border-primary/20">
                <span className="material-symbols-outlined text-[14px]">person_celebrate</span>
                {booking?.pujari || 'Assigned Pujari'}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[12px] flex items-center gap-1.5 border border-green-200">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {checklist?.isReady ? '100% Ready' : 'In Preparation'}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-2">
            <div className="flex justify-between mb-2 font-bold">
              <span className="text-on-surface-variant">
                {checklist?.isReady ? 'All Stages Complete' : `Current Stage: ${checklist?.stages?.find(s => s.status === 'IN_PROGRESS')?.title || 'In Progress'}`}
              </span>
              <span className="text-primary">{progressPercent}% Complete</span>
            </div>
            
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-bold text-center">
              {(checklist?.stages || []).map((stage) => {
                const isCompleted = stage.status === 'COMPLETED';
                const isInProgress = stage.status === 'IN_PROGRESS';
                return (
                  <div key={stage.id} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-green-50 text-green-700 border-green-600' 
                        : isInProgress 
                          ? 'bg-primary-container text-white border-primary-container animate-pulse'
                          : 'bg-surface-container-highest text-on-surface-variant border-outline-variant opacity-50'
                    }`}>
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">{stage.icon}</span>
                      )}
                    </div>
                    <span className={`text-label-md ${
                      isCompleted 
                        ? 'text-green-700' 
                        : isInProgress 
                          ? 'text-primary' 
                          : 'text-on-surface-variant opacity-50'
                    }`}>
                      {stage.title.split(': ')[1] || stage.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Cards */}
          <div className="space-y-6">
            {(checklist?.stages || []).map((stage) => {
              const isCompleted = stage.status === 'COMPLETED';
              const isInProgress = stage.status === 'IN_PROGRESS';
              const isLocked = stage.status === 'LOCKED';
              
              return (
                <div key={stage.id} className={`rounded-xl border relative transition-all duration-300 ${
                  isInProgress 
                    ? 'bg-surface-container-lowest shadow-md border-2 border-primary' 
                    : isCompleted
                      ? 'bg-surface-container-lowest border-green-600/30 opacity-80'
                      : 'bg-surface-container-low border-outline-variant/30 opacity-60'
                }`}>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 backdrop-blur-sm rounded-xl">
                      <div className="bg-white p-4 rounded-2xl shadow-lg border border-outline-variant/50 flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-on-surface-variant">lock</span>
                        <span className="font-label-md text-on-surface-variant font-bold uppercase tracking-wider">
                          Complete previous stages first
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          isInProgress 
                            ? 'bg-primary-container text-white border-primary'
                            : isCompleted
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[24px]">{stage.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-display text-headline-sm text-on-surface font-bold">{stage.title}</h4>
                          <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
                            {stage.id === 'stage1' && 'Arrange and verify all required pooja items are physically ready'}
                            {stage.id === 'stage2' && 'Calibrate all hardware equipment and test connection'}
                          </p>
                        </div>
                      </div>
                      
                      {isInProgress ? (
                        <div className="px-3 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold flex items-center gap-1.5 animate-pulse w-fit">
                          <span className="w-2 h-2 rounded-full bg-primary"></span> In Progress
                        </div>
                      ) : isCompleted ? (
                        <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-xs">check</span> Completed
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-outline-variant/10 text-on-surface-variant/50 border border-outline-variant/30 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-xs">lock</span> Locked
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Checklist Items */}
                      <div className="space-y-3 font-semibold">
                        {(stage.items || []).map((item) => {
                          const isItemCompleted = item.completed;
                          const isDisabled = !isInProgress;

                          return (
                            <button 
                              key={item.id}
                              onClick={() => handleToggleClick(stage.id, item.id)}
                              className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border border-transparent transition-colors ${
                                isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-surface-container-low cursor-pointer'
                              }`}
                              disabled={isDisabled}
                            >
                              <span className="material-symbols-outlined text-outline">
                                {isItemCompleted ? 'check_box' : 'check_box_outline_blank'}
                              </span>
                              <span className={`text-body-sm ${isItemCompleted ? 'line-through text-on-surface-variant' : ''}`}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Detail Column */}
                      <div className="bg-surface-container/50 p-6 rounded-xl border border-outline-variant/30 font-semibold text-on-surface flex flex-col justify-between">
                        <div>
                          <p className="text-label-md text-on-surface mb-2 uppercase tracking-wider">Status Information</p>
                          <p className="text-body-sm text-on-surface-variant font-medium">
                            {stage.id === 'stage1' && 'Verify that all ritual items, prasad, and deity preparations are complete before streaming.'}
                            {stage.id === 'stage2' && 'Check local camera setup and ensure the internet is stable.'}
                          </p>
                        </div>
                        <div className="mt-4">
                          {isCompleted ? (
                            <div className="w-full py-3 bg-green-50 border border-green-200 text-green-800 rounded-full flex items-center justify-center gap-2 font-bold text-sm">
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              {stage.title.split(': ')[1] || stage.title} Verified
                            </div>
                          ) : isInProgress ? (
                            <div className="w-full py-3 bg-outline-variant/10 border border-outline-variant/30 text-on-surface-variant/50 rounded-full flex items-center justify-center gap-2 font-bold text-sm">
                              <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                              Awaiting Completion
                            </div>
                          ) : (
                            <div className="w-full py-3 bg-outline-variant/10 border border-outline-variant/30 text-on-surface-variant/50 rounded-full flex items-center justify-center gap-2 font-bold text-sm cursor-not-allowed">
                              <span className="material-symbols-outlined text-[18px]">lock</span>
                              Locked
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right sticky sidebar */}
        <aside className="sticky top-[104px] space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-md border border-[#F0E6D2] p-6">
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-6">Readiness Summary</h3>
            
            {/* Progress Ring */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-surface-container-highest" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="70" 
                  stroke="currentColor" 
                  strokeWidth="12"
                ></circle>
                <circle 
                  className="text-primary transition-all duration-500" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="70" 
                  stroke="currentColor" 
                  strokeDasharray="440" 
                  strokeDashoffset={440 - (440 * progressPercent) / 100} 
                  strokeLinecap="round" 
                  strokeWidth="12"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-on-surface">{progressPercent}%</span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Ready</span>
              </div>
            </div>

            {/* Step list summary */}
            <div className="space-y-4 mb-8 font-semibold">
              {(checklist?.stages || []).map((stage) => {
                const isCompleted = stage.status === 'COMPLETED';
                const isInProgress = stage.status === 'IN_PROGRESS';
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[#2E7D32] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : isInProgress ? (
                      <span className="material-symbols-outlined text-primary text-[18px] animate-spin">
                        sync
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px] opacity-40">
                        circle
                      </span>
                    )}
                    <span className={`text-body-sm ${stage.status === 'LOCKED' ? 'opacity-40' : ''}`}>
                      {stage.title.split(': ')[1] || stage.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-outline-variant/30 space-y-4">
              {checklist?.isReady ? (
                <button 
                  onClick={handleGoToLive}
                  className="w-full py-4 px-6 bg-primary text-on-primary hover:bg-[#b04b00] font-button text-button rounded-full flex items-center justify-center gap-2 cursor-pointer font-bold shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined">sensors</span>
                  Go to Live Stream
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-4 px-6 border-2 border-outline-variant text-on-surface-variant/50 font-button text-button rounded-full flex items-center justify-center gap-2 cursor-not-allowed opacity-60 font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  Go to Live Stream
                </button>
              )}
              <p className="text-center text-on-surface-variant text-xs font-semibold italic">
                {!checklist?.isReady ? 'Checklist in progress. Keep preparing.' : 'All systems green! Ready for broadcast.'}
              </p>
            </div>
          </div>

          <div className="bg-primary-container/10 border border-primary/20 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <div>
                <h5 className="text-label-md text-primary font-bold mb-1 uppercase tracking-wider">Pro Tip</h5>
                <p className="text-body-sm text-on-surface-variant leading-relaxed font-semibold">
                  Ensure the Pujari's mic is clipped about 6 inches below the chin for optimal audio clarity during chanting.
                </p>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Camera Verification Modal */}
      {verifyingCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full overflow-hidden soft-shadow border border-[#F0E6D2] font-sans">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">videocam</span>
                <h3 className="font-display text-headline-sm font-bold text-on-surface">Camera Position Verification</h3>
              </div>
              <button 
                onClick={() => {
                  stopCameraStream();
                  setVerifyingCamera(false);
                }}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center">
                <video 
                  ref={cameraVideoRef} 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live Feed
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-body-md font-bold text-on-surface">Confirm Camera Alignment</p>
                <p className="text-body-sm text-on-surface-variant font-medium mt-1">
                  Align the camera to focus on the pooja altar. Ensure the deity and all pooja offerings are clearly visible.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface/50 flex gap-3">
              <button 
                onClick={() => {
                  stopCameraStream();
                  setVerifyingCamera(false);
                }}
                className="flex-1 py-3 border-2 border-outline-variant text-on-surface font-bold rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  stopCameraStream();
                  setVerifyingCamera(false);
                  await toggleChecklistItem('stage2', 'camera_positioned');
                }}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-full hover:bg-[#b04b00] transition-colors cursor-pointer"
              >
                Confirm Position & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Microphone Verification Modal */}
      {verifyingMic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full overflow-hidden soft-shadow border border-[#F0E6D2] font-sans">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">mic</span>
                <h3 className="font-display text-headline-sm font-bold text-on-surface">Microphone Functionality Test</h3>
              </div>
              <button 
                onClick={() => {
                  stopAudioStream();
                  setVerifyingMic(false);
                  setMicVolume(0);
                }}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className={`material-symbols-outlined text-[32px] ${micVolume > 12 ? 'animate-bounce' : ''}`}>mic</span>
                </div>
                
                {/* Visual Audio Meter */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>Input Level</span>
                    <span>{Math.round(micVolume)} DB</span>
                  </div>
                  <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-75" 
                      style={{ width: `${Math.min(100, micVolume * 3)}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-body-sm font-bold text-center text-primary mt-2">
                  {micStatus}
                </p>
              </div>
              
              <div className="text-center font-medium">
                <p className="text-body-sm text-on-surface-variant">
                  Speak into the microphone or tap it gently to test the audio signal. The meter will bounce to show incoming sound levels.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface/50 flex gap-3">
              <button 
                onClick={() => {
                  stopAudioStream();
                  setVerifyingMic(false);
                  setMicVolume(0);
                }}
                className="flex-1 py-3 border-2 border-outline-variant text-on-surface font-bold rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  stopAudioStream();
                  setVerifyingMic(false);
                  setMicVolume(0);
                  await toggleChecklistItem('stage2', 'mic_tested');
                }}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-full hover:bg-[#b04b00] transition-colors cursor-pointer"
              >
                Confirm Functioning & Verify
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
