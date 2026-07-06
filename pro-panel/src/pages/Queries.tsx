import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { db, type DevoteeQuery, type ChatMessage } from '../lib/db';
import { PageHeader } from '../components/PageHeader';

export function Queries() {
  const [queries, setQueries] = useState<DevoteeQuery[]>(() => db.getQueries());
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');
  const queryIdParam = searchParams.get('queryId');

  const [selectedQueryId, setSelectedQueryId] = useState('Q-101');

  useEffect(() => {
    if (queryIdParam) {
      setSelectedQueryId(queryIdParam);
    } else if (bookingIdParam) {
      const matched = queries.find(
        q => q.bookingId === bookingIdParam || q.id === bookingIdParam
      );
      if (!matched) {
        const devoteeName = searchParams.get('devoteeName') || 'Devotee';
        const newQueryId = `Q-${Date.now()}`;
        const newQuery: DevoteeQuery = {
          id: newQueryId,
          bookingId: bookingIdParam,
          devoteeName: devoteeName,
          timeAgo: 'Just now',
          subject: `Inquiry for Booking ${bookingIdParam}`,
          snippet: 'Namaste, how can we assist you with your booking?',
          status: 'Open',
          thread: [
            {
              sender: 'devotee',
              senderName: devoteeName,
              avatarText: devoteeName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
              time: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
              text: `Namaste, I have a query regarding my pooja booking ${bookingIdParam}.`
            }
          ]
        };
        db.updateQuery(newQuery);
        setQueries(db.getQueries());
        setSelectedQueryId(newQueryId);
      } else {
        setSelectedQueryId(matched.id);
      }
    }
  }, [bookingIdParam, queryIdParam, queries, searchParams]);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'Replied' | 'Closed'>('All');
  const [searchText, setSearchText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const activeQuery = queries.find(q => q.id === selectedQueryId) || queries[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeQuery) return;

    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newReply: ChatMessage = {
      sender: 'admin',
      senderName: 'Ravi PRO',
      avatarText: 'RP',
      time: formattedTime,
      text: replyText.trim()
    };

    const updatedQuery: DevoteeQuery = {
      ...activeQuery,
      status: 'Replied',
      snippet: replyText.trim(),
      thread: [...activeQuery.thread, newReply]
    };

    db.updateQuery(updatedQuery);
    setQueries(prev => prev.map(q => q.id === activeQuery.id ? updatedQuery : q));

    db.addNotification(
      'Query Replied',
      `Sent reply to devotee ${activeQuery.devoteeName} for thread ${activeQuery.id}.`,
      '/queries'
    );

    setReplyText('');
    setNotification('Reply sent successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCloseQuery = () => {
    if (!activeQuery) return;
    const updatedQuery: DevoteeQuery = {
      ...activeQuery,
      status: 'Closed'
    };
    db.updateQuery(updatedQuery);
    setQueries(prev => prev.map(q => q.id === activeQuery.id ? updatedQuery : q));
    db.addNotification(
      'Query Closed',
      `Query thread ${activeQuery.id} from ${activeQuery.devoteeName} marked as Closed.`,
      '/queries'
    );
    setNotification('Query marked as Closed.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter and search logic
  const filteredQueries = queries.filter(q => {
    const matchesTab = activeTab === 'All' || q.status === activeTab;
    const matchesSearch = q.devoteeName.toLowerCase().includes(searchText.toLowerCase()) || 
                          q.subject.toLowerCase().includes(searchText.toLowerCase()) ||
                          q.bookingId.toLowerCase().includes(searchText.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalCount = queries.length;
  const openCount = queries.filter(q => q.status === 'Open').length;
  const repliedCount = queries.filter(q => q.status === 'Replied').length;
  const closedCount = queries.filter(q => q.status === 'Closed').length;

  return (
    <div className="max-w-[1440px] mx-auto pb-6 font-sans relative">
      <PageHeader title="Devotee Query Inbox" />
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <p className="text-body-lg text-on-surface-variant font-medium">Respond to devotee questions about bookings, delivery, and schedules</p>
      </div>

      {/* Two Panel Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-220px)] lg:min-h-[580px]">
        
        {/* Left Panel: Inbox List (35% on desktop, hidden on mobile if detail is open) */}
        <div className={`w-full lg:w-[35%] bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] flex flex-col overflow-hidden h-[calc(100vh-200px)] lg:h-auto ${
          mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Inbox Header & Filters */}
          <div className="p-4 border-b border-outline-variant/30 bg-surface/50">
            <h2 className="font-display text-headline-sm text-on-surface font-bold mb-3">Query Inbox</h2>
            
            {/* Search */}
            <div className="relative mb-4 font-semibold">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-on-surface font-medium placeholder:text-on-surface-variant/70"
                placeholder="Search queries, booking ID..." 
                type="text"
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide font-bold text-xs">
              <button 
                onClick={() => setActiveTab('All')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'All' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                All ({totalCount})
              </button>
              <button 
                onClick={() => setActiveTab('Open')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'Open' ? 'bg-[#ffeae1] text-primary border border-primary/20 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Open ({openCount})
              </button>
              <button 
                onClick={() => setActiveTab('Replied')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'Replied' ? 'bg-green-100 text-green-800 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Replied ({repliedCount})
              </button>
              <button 
                onClick={() => setActiveTab('Closed')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'Closed' ? 'bg-surface-variant text-on-surface-variant shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Closed ({closedCount})
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
            {filteredQueries.map(item => {
              const isSelected = item.id === activeQuery.id;
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setSelectedQueryId(item.id);
                    setMobileView('detail');
                  }}
                  className={`p-4 cursor-pointer hover:bg-surface-container-low/40 transition-colors relative font-sans ${
                    isSelected 
                      ? 'bg-surface-container-low border-l-4 border-l-primary' 
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  {item.status === 'Open' && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-1 font-semibold">
                    <span className="text-body-md text-on-surface font-bold">{item.devoteeName}</span>
                    <span className="text-[11px] text-on-surface-variant">{item.timeAgo}</span>
                  </div>
                  
                  <h3 className="text-body-sm font-bold text-on-surface mb-1 truncate pr-6">
                    {item.subject}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant line-clamp-1 mb-2 font-medium">
                    {item.snippet}
                  </p>
                  
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Open' 
                        ? 'bg-error-container text-on-error-container' 
                        : item.status === 'Replied' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-bold">
                      {item.bookingId}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {filteredQueries.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant text-body-sm font-semibold">
                No queries in this category
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Message Detail & Thread (65% on desktop, full screen overlay on mobile) */}
        <div className={`w-full lg:w-[65%] bg-surface-container-lowest lg:rounded-xl lg:soft-shadow lg:border border-[#F0E6D2] flex flex-col overflow-hidden ${
          mobileView === 'list' ? 'hidden lg:flex' : 'fixed inset-0 z-[100] lg:relative lg:inset-auto lg:z-auto'
        }`}>
          {activeQuery ? (
            <>
              {/* Detail Header */}
              <div className="p-4 pt-6 sm:pt-6 sm:p-6 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-sm sticky top-0 z-10 font-sans shadow-sm lg:shadow-none">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-1">
                    {/* Back Button on Mobile */}
                    <button
                      onClick={() => setMobileView('list')}
                      className="lg:hidden p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors text-on-surface flex items-center justify-center cursor-pointer mr-2 mt-0.5"
                      aria-label="Back to Inbox"
                    >
                      <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="font-display text-headline-sm font-bold text-on-surface">
                          {activeQuery.devoteeName}
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant border border-outline-variant/50">
                          {activeQuery.bookingId}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          activeQuery.status === 'Open' 
                            ? 'bg-error-container text-on-error-container' 
                            : activeQuery.status === 'Replied' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {activeQuery.status}
                        </span>
                      </div>
                      <h3 className="text-body-md text-on-surface font-semibold">
                        Subject: {activeQuery.subject}
                      </h3>
                    </div>
                  </div>
                  
                  {activeQuery.status !== 'Closed' ? (
                    <button 
                      onClick={handleCloseQuery}
                      className="px-4 py-2 border border-outline-variant text-on-surface font-button hover:bg-surface-container-low transition-colors text-xs flex items-center gap-1.5 rounded-full font-bold cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Mark as Closed
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-1.5 rounded-full font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Closed
                    </div>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-6 bg-surface-bright/50 flex flex-col gap-6 font-sans">
                {activeQuery.thread.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-4 max-w-[85%] ${isAdmin ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-bold shrink-0 border ${
                        isAdmin 
                          ? 'bg-primary text-on-primary border-primary' 
                          : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
                      }`}>
                        {msg.avatarText}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className={`flex items-center gap-2 text-xs font-semibold ${isAdmin ? 'justify-end' : ''}`}>
                          <span className="text-on-surface">{msg.senderName}</span>
                          <span className="text-on-surface-variant font-medium">•</span>
                          <span className="text-on-surface-variant font-medium">{msg.time}</span>
                        </div>
                        <div className={`p-4 rounded-2xl border text-body-sm shadow-sm ${
                          isAdmin 
                            ? 'bg-primary-container/10 border-primary/20 text-on-surface rounded-tr-none' 
                            : 'bg-surface-container-low border-outline-variant/20 text-on-surface rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed font-semibold">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Area */}
              {activeQuery.status !== 'Closed' ? (
                <div className="p-4 sm:p-6 border-t border-outline-variant/30 bg-surface/50 font-sans">
                  <form onSubmit={handleSendReply}>
                    <div className="relative">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full min-h-[100px] p-4 pr-12 sm:pr-4 bg-surface border border-outline-variant rounded-xl text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none mb-2 shadow-inner font-semibold"
                        placeholder={`Reply to ${activeQuery.devoteeName}...`}
                        maxLength={500}
                      />
                      <div className="hidden sm:block absolute bottom-4 right-4 text-xs text-on-surface-variant font-bold">
                        {replyText.length} / 500
                      </div>

                      {/* Mobile Send Icon (Inside Textarea) */}
                      <button 
                        type="submit"
                        disabled={!replyText.trim()}
                        className={`sm:hidden absolute bottom-4 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          replyText.trim()
                            ? 'bg-primary text-on-primary hover:bg-[#b04b00] cursor-pointer'
                            : 'bg-surface-variant text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/30'
                        }`}
                        aria-label="Send Reply"
                      >
                        <span className="material-symbols-outlined text-[18px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-1 sm:mt-2 gap-3">
                      <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant text-xs font-semibold mr-auto">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        <span>Devotee will be notified via Email and App</span>
                      </div>
                      
                      {/* Desktop Send Button */}
                      <button 
                        type="submit"
                        disabled={!replyText.trim()}
                        className={`hidden sm:flex px-6 py-2.5 rounded-full font-button text-button shadow-soft items-center justify-center gap-2 transition-all font-bold ${
                          replyText.trim()
                            ? 'bg-primary text-on-primary hover:bg-[#b04b00] cursor-pointer'
                            : 'bg-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                        Send Reply
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low text-center font-medium font-sans">
                  <p className="text-body-sm text-on-surface-variant">
                    This query is closed. Click "Reopen Query" to reply.
                  </p>
                  <button 
                    onClick={() => {
                      const updatedQuery: DevoteeQuery = { ...activeQuery, status: 'Open' };
                      db.updateQuery(updatedQuery);
                      setQueries(prev => prev.map(q => q.id === activeQuery.id ? updatedQuery : q));
                      db.addNotification(
                        'Query Reopened',
                        `Query thread ${activeQuery.id} from ${activeQuery.devoteeName} has been reopened.`,
                        '/queries'
                      );
                      setNotification('Query reopened.');
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Reopen Query
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[64px] mb-2">chat</span>
              <p className="text-body-md font-semibold">Select a query thread from the left panel to begin replying.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
