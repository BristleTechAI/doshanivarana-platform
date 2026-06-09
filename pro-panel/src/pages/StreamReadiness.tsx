import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { db } from '../lib/db';

interface Stage3Checklist {
  videoClear: boolean;
  audioClear: boolean;
  streamKeyWorking: boolean;
  playbackTested: boolean;
}

interface Stage4Checklist {
  finalSignalCheck: boolean;
  latencyChecked: boolean;
  pujariMicSecured: boolean;
}

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

  const bookingId = id || 'BK-1001';
  const booking = db.getBookingById(bookingId) || db.getBookings()[0];

  const initialStreamData = db.getStreamReadiness(bookingId);

  const [currentStage, setCurrentStage] = useState<3 | 4 | 5>(initialStreamData.currentStage);
  
  const [stage3, setStage3] = useState<Stage3Checklist>(initialStreamData.stage3);

  const [stage4, setStage4] = useState<Stage4Checklist>(initialStreamData.stage4);

  const [notification, setNotification] = useState<string | null>(null);

  const saveState = (stage: 3 | 4 | 5, s3: Stage3Checklist, s4: Stage4Checklist) => {
    setCurrentStage(stage);
    setStage3(s3);
    setStage4(s4);
    db.saveStreamReadiness(bookingId, { currentStage: stage, stage3: s3, stage4: s4 });
  };

  const toggleStage3 = (key: keyof Stage3Checklist) => {
    if (currentStage !== 3) return;
    const nextVal = !stage3[key];
    const newStage3 = { ...stage3, [key]: nextVal };
    saveState(currentStage, newStage3, stage4);
  };

  const toggleStage4 = (key: keyof Stage4Checklist) => {
    if (currentStage !== 4) return;
    const nextVal = !stage4[key];
    const newStage4 = { ...stage4, [key]: nextVal };
    saveState(currentStage, stage3, newStage4);
  };

  const isStage3Complete = stage3.videoClear && stage3.audioClear && stage3.streamKeyWorking && stage3.playbackTested;
  const isStage4Complete = stage4.finalSignalCheck && stage4.latencyChecked && stage4.pujariMicSecured;

  const handleConfirmStage3 = () => {
    if (!isStage3Complete) return;
    saveState(4, stage3, stage4);
    setNotification('Stage 3 Complete! Stage 4 is now unlocked.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmStage4 = () => {
    if (!isStage4Complete) return;
    saveState(5, stage3, stage4);
    setNotification('All stages completed! Live stream is now active.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGoToLive = () => {
    if (currentStage !== 5) return;
    navigate('/live-stream');
  };

  let progressPercent = 50;
  if (currentStage === 4) progressPercent = 75;
  if (currentStage === 5) progressPercent = 100;

  return (
    <div className="max-w-[1440px] mx-auto pb-32 relative font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-2">Stream Readiness Checklist</h1>
          <p className="text-body-md text-on-surface-variant flex items-center gap-2">
            Complete all 4 stages before going live for {id || 'BK-1001'}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-bold text-[10px]">
              VERIFICATION REQUIRED
            </span>
          </p>
        </div>
        
        {currentStage === 5 ? (
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
                <h3 className="font-display text-headline-sm text-on-surface font-bold">{booking?.poojaName}</h3>
                <p className="text-on-surface-variant font-label-md font-semibold">{booking?.dateTime}</p>
              </div>
            </div>
            <div className="flex gap-2 font-bold">
              <div className="px-3 py-1.5 rounded-full bg-error-container text-error text-[12px] flex items-center gap-1.5 border border-red-200">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                {booking ? getDaysToGo(booking.dateTime) : ''}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] flex items-center gap-1.5 border border-primary/20">
                <span className="material-symbols-outlined text-[14px]">person_celebrate</span>
                {booking?.pujari}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[12px] flex items-center gap-1.5 border border-green-200">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Pooja Ready ✅
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-2">
            <div className="flex justify-between mb-2 font-bold">
              <span className="text-on-surface-variant">
                {currentStage === 3 && 'Stage 3 of 4'}
                {currentStage === 4 && 'Stage 4 of 4'}
                {currentStage === 5 && 'All Stages Complete'}
              </span>
              <span className="text-primary">{progressPercent}% Complete</span>
            </div>
            
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-4 gap-4 font-bold text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center border-2 border-green-600">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <span className="text-label-md text-green-700">Informed</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center border-2 border-green-600">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <span className="text-label-md text-green-700">Equipment Ready</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStage > 3 
                    ? 'bg-green-50 text-green-700 border-green-600' 
                    : 'bg-primary-container text-white border-primary-container animate-pulse'
                }`}>
                  {currentStage > 3 ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">science</span>
                  )}
                </div>
                <span className={`text-label-md ${currentStage > 3 ? 'text-green-700' : 'text-primary'}`}>
                  Test Demo Done
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStage === 5 
                    ? 'bg-green-50 text-green-700 border-green-600' 
                    : currentStage === 4 
                      ? 'bg-primary-container text-white border-primary-container animate-pulse'
                      : 'bg-surface-container-highest text-on-surface-variant border-outline-variant opacity-50'
                }`}>
                  {currentStage === 5 ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  )}
                </div>
                <span className={`text-label-md ${
                  currentStage === 5 
                    ? 'text-green-700' 
                    : currentStage === 4 
                      ? 'text-primary' 
                      : 'text-on-surface-variant opacity-50'
                }`}>
                  Ready to Stream
                </span>
              </div>
            </div>
          </div>

          {/* Stage Cards */}
          <div className="space-y-6">
            
            {/* Stage 1 - Informed (Always Completed) */}
            <div className="bg-surface-container-lowest rounded-xl soft-shadow border border-green-600/30 opacity-80 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
                      <span className="material-symbols-outlined text-[20px]">campaign</span>
                    </div>
                    <h4 className="font-display text-headline-sm text-on-surface font-bold">Stage 1: Informed</h4>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span> Stage 1 locked
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-medium">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span><span className="text-body-sm">Pujari notified</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span><span className="text-body-sm">Volunteers informed</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span><span className="text-body-sm">Auto-reminders sent</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span><span className="text-body-sm">Schedule confirmed</span></div>
                </div>
              </div>
            </div>

            {/* Stage 2 - Equipment (Always Completed) */}
            <div className="bg-surface-container-lowest rounded-xl soft-shadow border border-green-600/30 opacity-80 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
                      <span className="material-symbols-outlined text-[20px]">videocam</span>
                    </div>
                    <h4 className="font-display text-headline-sm text-on-surface font-bold">Stage 2: Equipment Ready</h4>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span> Stage 2 locked
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 font-medium">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span><span className="text-xs">Camera positioned</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span><span className="text-xs">Tripod secured</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span><span className="text-xs">Mic tested</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span><span className="text-xs">Lighting adequate</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span><span className="text-xs">Internet (48 Mbps)</span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span><span className="text-xs">Battery (87%)</span></div>
                </div>
              </div>
            </div>

            {/* Stage 3 - Live Test Demo */}
            <div className={`rounded-xl border relative transition-all duration-300 ${
              currentStage === 3 
                ? 'bg-surface-container-lowest shadow-md border-2 border-primary' 
                : currentStage > 3
                  ? 'bg-surface-container-lowest border-green-600/30 opacity-80'
                  : 'bg-surface-container-low border-outline-variant/30 opacity-60'
            }`}>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      currentStage === 3 
                        ? 'bg-primary-container text-white border-primary'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">science</span>
                    </div>
                    <div>
                      <h4 className="font-display text-headline-sm text-on-surface font-bold">Stage 3: Live Test Demo</h4>
                      <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
                        Perform a 5-minute test stream before the main event
                      </p>
                    </div>
                  </div>
                  
                  {currentStage === 3 ? (
                    <div className="px-3 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold flex items-center gap-1.5 animate-pulse w-fit">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> In Progress
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                      <span className="material-symbols-outlined text-xs">lock</span> Stage 3 locked
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Checklist Items */}
                  <div className="space-y-3 font-semibold">
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[#2E7D32]">check_circle</span>
                      <span className="text-body-sm font-bold text-on-surface">Test started (Completed)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[#2E7D32]">check_circle</span>
                      <span className="text-body-sm font-bold text-on-surface">Test stopped (Completed)</span>
                    </div>
                    
                    {/* Interactive checks */}
                    <button 
                      onClick={() => toggleStage3('videoClear')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 3}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage3.videoClear ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage3.videoClear ? 'line-through text-on-surface-variant' : ''}`}>
                        Video clear and stable
                      </span>
                    </button>

                    <button 
                      onClick={() => toggleStage3('audioClear')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 3}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage3.audioClear ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage3.audioClear ? 'line-through text-on-surface-variant' : ''}`}>
                        Audio clear (No echo)
                      </span>
                    </button>

                    <button 
                      onClick={() => toggleStage3('streamKeyWorking')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 3}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage3.streamKeyWorking ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage3.streamKeyWorking ? 'line-through text-on-surface-variant' : ''}`}>
                        Stream key working
                      </span>
                    </button>

                    <button 
                      onClick={() => toggleStage3('playbackTested')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 3}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage3.playbackTested ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage3.playbackTested ? 'line-through text-on-surface-variant' : ''}`}>
                        Playback tested on mobile
                      </span>
                    </button>
                  </div>

                  {/* Verification Info Column */}
                  <div className="bg-surface-container/50 p-6 rounded-xl border border-outline-variant/30 font-semibold text-on-surface">
                    <p className="text-label-md text-on-surface mb-4 uppercase tracking-wider">Verification Info</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Test Timestamp</label>
                        <div className="w-full p-2 bg-white border border-outline-variant rounded-lg text-sm flex justify-between items-center text-on-surface font-medium">
                          15 May 2026, 08:15 AM
                          <span className="material-symbols-outlined text-sm">schedule</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Duration</label>
                          <div className="w-full p-2 bg-white border border-outline-variant rounded-lg text-sm font-medium">5 min</div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Video quality</label>
                          <div className="w-full p-2 bg-white border border-outline-variant rounded-lg text-sm font-medium">HD 1080p</div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Audio quality</label>
                        <div className="w-full p-2 bg-white border border-outline-variant rounded-lg text-sm font-medium">Clear / No Static</div>
                      </div>
                      
                      {currentStage === 3 ? (
                        <button 
                          onClick={handleConfirmStage3}
                          disabled={!isStage3Complete}
                          className={`w-full mt-4 py-3 rounded-full flex items-center justify-center gap-2 font-button text-button font-bold border transition-all ${
                            isStage3Complete 
                              ? 'bg-primary text-on-primary hover:bg-[#b04b00] border-transparent cursor-pointer shadow-sm' 
                              : 'bg-outline-variant/30 text-on-surface-variant/50 border-outline-variant/40 cursor-not-allowed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          Confirm Stage 3 Complete
                        </button>
                      ) : (
                        <div className="w-full mt-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-full flex items-center justify-center gap-2 font-bold text-sm">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Stage 3 Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 4 - Ready to Stream */}
            <div className={`rounded-xl border relative transition-all duration-300 ${
              currentStage === 4 
                ? 'bg-surface-container-lowest shadow-md border-2 border-primary' 
                : currentStage === 5
                  ? 'bg-surface-container-lowest border-green-600/30 opacity-80'
                  : 'bg-surface-container-low border-outline-variant/30 opacity-60'
            }`}>
              
              {currentStage < 4 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 backdrop-blur-sm rounded-xl">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-outline-variant/50 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant">lock</span>
                    <span className="font-label-md text-on-surface-variant font-bold uppercase tracking-wider">
                      Complete stage 3 first
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      currentStage === 4 
                        ? 'bg-primary-container text-white border-primary'
                        : currentStage === 5
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                    </div>
                    <div>
                      <h4 className="font-display text-headline-sm text-on-surface font-bold">Stage 4: Ready to Stream</h4>
                      <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
                        Perform final handshake checks before initiating the live broadcast
                      </p>
                    </div>
                  </div>

                  {currentStage === 4 ? (
                    <div className="px-3 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold flex items-center gap-1.5 animate-pulse w-fit">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> Finalizing
                    </div>
                  ) : currentStage === 5 ? (
                    <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
                      <span className="material-symbols-outlined text-xs">check</span> Completed
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Checklist */}
                  <div className="space-y-3 font-semibold">
                    <button 
                      onClick={() => toggleStage4('finalSignalCheck')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 4}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage4.finalSignalCheck ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage4.finalSignalCheck ? 'line-through text-on-surface-variant' : ''}`}>
                        Final audio-video latency calibrated
                      </span>
                    </button>

                    <button 
                      onClick={() => toggleStage4('latencyChecked')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 4}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage4.latencyChecked ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage4.latencyChecked ? 'line-through text-on-surface-variant' : ''}`}>
                        Internet speed stable at &gt;30 Mbps upload
                      </span>
                    </button>

                    <button 
                      onClick={() => toggleStage4('pujariMicSecured')}
                      className="w-full text-left flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg border border-transparent transition-colors cursor-pointer"
                      disabled={currentStage !== 4}
                    >
                      <span className="material-symbols-outlined text-outline">
                        {stage4.pujariMicSecured ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`text-body-sm ${stage4.pujariMicSecured ? 'line-through text-on-surface-variant' : ''}`}>
                        Pujari wireless mic secured &amp; unmuted
                      </span>
                    </button>
                  </div>

                  {/* Actions Column */}
                  <div className="bg-surface-container/50 p-6 rounded-xl border border-outline-variant/30 font-semibold text-on-surface flex flex-col justify-between">
                    <div>
                      <p className="text-label-md text-on-surface mb-2 uppercase tracking-wider">Final Step</p>
                      <p className="text-body-sm text-on-surface-variant font-medium">
                        Once checked, confirm readiness to unlock the main live-stream broadcast control.
                      </p>
                    </div>

                    {currentStage === 4 ? (
                      <button 
                        onClick={handleConfirmStage4}
                        disabled={!isStage4Complete}
                        className={`w-full mt-6 py-3 rounded-full flex items-center justify-center gap-2 font-button text-button font-bold border transition-all ${
                          isStage4Complete 
                            ? 'bg-primary text-on-primary hover:bg-[#b04b00] border-transparent cursor-pointer shadow-sm' 
                            : 'bg-outline-variant/30 text-on-surface-variant/50 border-outline-variant/40 cursor-not-allowed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        Confirm Readiness Complete
                      </button>
                    ) : currentStage === 5 ? (
                      <div className="w-full mt-6 py-3 bg-green-50 border border-green-200 text-green-800 rounded-full flex items-center justify-center gap-2 font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Readiness Handshake OK
                      </div>
                    ) : (
                      <div className="w-full mt-6 py-3 bg-outline-variant/10 border border-outline-variant/30 text-on-surface-variant/50 rounded-full flex items-center justify-center gap-2 font-bold text-sm cursor-not-allowed">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        Ready to Stream
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

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
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2E7D32] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-body-sm text-on-surface">Communication Ready</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2E7D32] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-body-sm text-on-surface">Hardware Calibrated</span>
              </div>
              <div className="flex items-center gap-3">
                {currentStage === 3 ? (
                  <span className="material-symbols-outlined text-primary text-[18px] animate-spin">
                    sync
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[#2E7D32] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
                <span className="text-body-sm text-on-surface">Test Demo Done</span>
              </div>
              <div className="flex items-center gap-3">
                {currentStage === 4 ? (
                  <span className="material-symbols-outlined text-primary text-[18px] animate-spin">
                    sync
                  </span>
                ) : currentStage === 5 ? (
                  <span className="material-symbols-outlined text-[#2E7D32] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] opacity-40">
                    circle
                  </span>
                )}
                <span className={`text-body-sm ${currentStage < 4 ? 'opacity-40' : ''}`}>Ready to Stream</span>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/30 space-y-4">
              {currentStage === 5 ? (
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
                {currentStage === 3 && 'Estimated ~15 min remaining'}
                {currentStage === 4 && 'Estimated ~5 min remaining'}
                {currentStage === 5 && 'All systems green! Ready for broadcast.'}
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
    </div>
  );
}
