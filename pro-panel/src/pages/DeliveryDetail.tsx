// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

interface DeliveryDetailData {
  id: string;
  bookingId: string;
  devoteeName: string;
  mobile: string;
  poojaName: string;
  poojaDate: string;
  address: string;
  pincode: string;
  status: 'Booked' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  weight: string;
  length: string;
  width: string;
  height: string;
  contents: string;
  courier: string;
  trackingNumber: string;
  dispatchDate: string;
  estimatedDelivery: string;
}

export function DeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templeId } = useAuth();
  
  const [delivery, setDelivery] = useState<DeliveryDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [contents, setContents] = useState('');
  const [courier, setCourier] = useState('BlueDart');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'deliveries', id), async (docSnap) => {
      if (!docSnap.exists()) {
        setLoading(false);
        return;
      }
      const dData = docSnap.data();
      
      const bSnap = await getDoc(doc(db, 'bookings', dData.bookingId));
      const bData = bSnap.data() || {};
      
      const fullAddress = dData.shippingAddress || bData.shippingAddress || 'Address not provided';
      const pincodeMatch = fullAddress.match(/\d{5,6}$/) || fullAddress.match(/\d{3}\s?\d{3}$/);
      const pincode = pincodeMatch ? pincodeMatch[0] : '';
      const address = pincodeMatch ? fullAddress.replace(pincodeMatch[0], '').trim().replace(/,\s*$/, '') : fullAddress;

      setDelivery({
        id: docSnap.id,
        bookingId: dData.bookingId,
        devoteeName: bData.devoteeDetails?.name || bData.userId || 'Unknown',
        mobile: bData.mobile || 'N/A',
        poojaName: bData.poojaName || 'Unknown Pooja',
        poojaDate: bData.scheduledDate || '',
        address,
        pincode,
        status: dData.status,
        weight: dData.weight || '',
        length: dData.length || '',
        width: dData.width || '',
        height: dData.height || '',
        contents: dData.contents || '',
        courier: dData.courier || 'BlueDart',
        trackingNumber: dData.trackingNumber || '',
        dispatchDate: dData.dispatchDate || '',
        estimatedDelivery: dData.estimatedDelivery || ''
      });
      
      if (!weight && dData.weight) setWeight(dData.weight);
      if (!length && dData.length) setLength(dData.length);
      if (!width && dData.width) setWidth(dData.width);
      if (!height && dData.height) setHeight(dData.height);
      if (!contents && dData.contents) setContents(dData.contents);
      if (!trackingNumber && dData.trackingNumber) setTrackingNumber(dData.trackingNumber);
      if (!estimatedDelivery && dData.estimatedDelivery) setEstimatedDelivery(dData.estimatedDelivery);
      if (dData.courier) setCourier(dData.courier);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleMarkAsPacked = async () => {
    if (!id || !delivery) return;
    try {
      await updateDoc(doc(db, 'deliveries', id), {
        status: 'PACKED',
        weight,
        length,
        width,
        height,
        contents,
        updatedAt: serverTimestamp()
      });

      const eventRef = doc(collection(db, 'systemEvents'));
      await setDoc(eventRef, {
        eventType: 'delivery.packed',
        entityId: id,
        entityType: 'delivery',
        payload: { deliveryId: id, bookingId: delivery.bookingId },
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        action: 'Delivery PACKED',
        entityId: id,
        entityType: 'delivery',
        performedBy: templeId,
        details: `Delivery ${id} marked as PACKED`,
        createdAt: serverTimestamp()
      });

      setNotification('Parcel marked as Packed!');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
      setNotification('Failed to update delivery');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setNotification('Please enter a tracking number.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!id || !delivery) return;
    try {
      await updateDoc(doc(db, 'deliveries', id), {
        status: 'SHIPPED',
        courier,
        trackingNumber,
        estimatedDelivery,
        dispatchDate: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });

      const eventRef = doc(collection(db, 'systemEvents'));
      await setDoc(eventRef, {
        eventType: 'delivery.shipped',
        entityId: id,
        entityType: 'delivery',
        payload: { deliveryId: id, bookingId: delivery.bookingId, courier, trackingNumber },
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        action: 'Delivery SHIPPED',
        entityId: id,
        entityType: 'delivery',
        performedBy: templeId,
        details: `Delivery ${id} marked as SHIPPED with tracking ${trackingNumber}`,
        createdAt: serverTimestamp()
      });

      setShowSuccessOverlay(true);
    } catch (e) {
      console.error(e);
      setNotification('Failed to update delivery');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (loading || !delivery) {
    return (
      <div className="max-w-[1440px] mx-auto pb-12 font-sans relative p-8 text-center text-on-surface-variant">
        Loading delivery details...
      </div>
    );
  }

  const isBooked = delivery.status === 'Booked' || delivery.status === 'PENDING' || delivery.status === undefined || delivery.status === null;
  const isPacked = delivery.status === 'PACKED';
  const isDispatched = delivery.status === 'SHIPPED' || delivery.status === 'OUT_FOR_DELIVERY' || delivery.status === 'DELIVERED';

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      <PageHeader title={`Delivery Detail — ${delivery.bookingId}`} backTo="/deliveries" />

      {/* Page Actions / Status */}
      <div className="flex justify-end mb-6">
        <span className={`px-4 py-1.5 rounded-full font-label-md text-label-md uppercase tracking-wider font-bold border ${
          isBooked 
            ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
            : isPacked 
              ? 'bg-blue-50 text-blue-800 border-blue-200' 
              : 'bg-green-50 text-green-800 border-green-200'
        }`}>
          {delivery.status || 'BOOKED'}
        </span>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        
        {/* Left Column (55%) */}
        <div className="w-full lg:w-[55%] flex flex-col gap-6">
          
          {/* Booking Info Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-[#F0E6D2] soft-shadow relative overflow-hidden">
            <h3 className="font-display text-headline-sm text-on-surface mb-4 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Booking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 font-medium text-body-md text-on-surface">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Booking ID</p>
                <p className="font-bold">{delivery.bookingId}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Devotee Name</p>
                <p className="font-bold">{delivery.devoteeName}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Mobile</p>
                <p>{delivery.mobile}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Payment</p>
                <p className="flex items-center gap-1 text-green-700">
                  <span className="material-symbols-outlined text-green-700 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 
                  Confirmed
                </p>
              </div>
              <div className="col-span-1 sm:col-span-2 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Pooja</p>
                  <p className="font-bold text-primary">{delivery.poojaName}</p>
                </div>
                <div className="text-right">
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Pooja Date</p>
                  <p>{delivery.poojaDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-[#F0E6D2] soft-shadow">
            <h3 className="font-display text-headline-sm text-on-surface mb-4 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Delivery Address
            </h3>
            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 mb-3 font-semibold text-on-surface">
              <p className="leading-relaxed">
                <span className="font-bold block mb-1 text-primary">{delivery.devoteeName}</span>
                {delivery.address}<br/>
                India — <span className="bg-primary-container/10 text-primary px-1.5 py-0.5 rounded font-bold">{delivery.pincode}</span>
              </p>
            </div>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1 italic font-medium">
              <span className="material-symbols-outlined text-sm">info</span>
              Address provided by devotee at booking — cannot be edited
            </p>
          </div>

          {/* Parcel Details Form */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-[#F0E6D2] border-t-4 border-t-primary soft-shadow">
            <h3 className="font-display text-headline-sm text-on-surface mb-2 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              Parcel Details
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-6 font-medium">
              Fill in parcel details before marking as packed
            </p>
            <form className="flex flex-col gap-5 font-semibold text-on-surface">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Weight (kg)</label>
                  <input 
                    readOnly={!isBooked}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
                    type="text" 
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Length (cm)</label>
                  <input 
                    readOnly={!isBooked}
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
                    type="text" 
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Width (cm)</label>
                  <input 
                    readOnly={!isBooked}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
                    type="text" 
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Height (cm)</label>
                  <input 
                    readOnly={!isBooked}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
                    type="text" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Contents Note</label>
                <textarea 
                  readOnly={!isBooked}
                  value={contents}
                  onChange={(e) => setContents(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm resize-none font-semibold"
                  rows={2}
                />
              </div>

              {isBooked ? (
                <button 
                  type="button"
                  onClick={handleMarkAsPacked}
                  className="w-full py-3 px-6 bg-primary text-on-primary hover:bg-[#b04b00] rounded-full font-button text-button mt-2 shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  Mark as Packed
                </button>
              ) : (
                <div className="w-full py-3 px-6 bg-green-50 border border-green-200 text-green-800 rounded-full flex justify-center items-center gap-2 font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Parcel Packed (Confirmed)
                </div>
              )}
              <p className="text-center text-body-sm text-on-surface-variant font-medium">
                Devotee will be notified via App and SMS when marked as packed
              </p>
            </form>
          </div>

        </div>

        {/* Right Column (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          
          {/* Courier Dispatch Form */}
          <div className={`bg-surface-container-lowest p-6 rounded-xl border border-[#F0E6D2] border-t-4 border-t-secondary-container soft-shadow relative ${
            isBooked ? 'opacity-50 pointer-events-none' : ''
          }`}>
            {isBooked && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 rounded-xl">
                <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-md font-bold text-xs text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Pack parcel first
                </div>
              </div>
            )}
            
            <h3 className="font-display text-headline-sm text-on-surface mb-6 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-secondary">local_shipping</span>
              Dispatch Details
            </h3>
            
            <form onSubmit={handleConfirmDispatch} className="flex flex-col gap-5 font-semibold text-on-surface">
              <div>
                <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Courier Partner</label>
                <div className="relative">
                  <select 
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 pr-10 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm appearance-none cursor-pointer font-semibold"
                  >
                    <option value="BlueDart">BlueDart</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="India Post">India Post</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Ekart">Ekart</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">AWB / Tracking Number</label>
                <input 
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DL2026051098765"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-mono font-bold text-on-surface"
                  type="text" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Dispatch Date</label>
                  <input 
                    readOnly
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-body-md text-on-surface-variant shadow-sm"
                    type="text" 
                    value={new Date().toLocaleDateString()} 
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Estimated Delivery</label>
                  <input 
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
                    type="text" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-6 bg-secondary-container text-on-secondary-container hover:bg-[#ffeae1] hover:text-primary border-2 border-transparent hover:border-primary rounded-full font-button text-button mt-4 shadow-sm transition-colors flex justify-center items-center gap-2 font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Confirm Dispatch
              </button>
              <p className="text-center text-body-sm text-on-surface-variant font-medium">
                Devotee will be notified via Email, SMS and App on dispatch
              </p>
            </form>
          </div>

          {/* Tracking History */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-[#F0E6D2] soft-shadow flex-1">
            <h3 className="font-display text-headline-sm text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4 font-bold">
              <span className="material-symbols-outlined text-primary">history</span>
              Tracking History
            </h3>
            <div className="relative pl-4 space-y-6">
              
              <div className="absolute left-6 top-2 bottom-6 w-px bg-outline-variant border-dashed border-l-2 border-outline-variant/30 z-0"></div>

              {/* Booked */}
              <div className="relative z-10 flex gap-4 items-start font-semibold">
                <div className="w-5 h-5 rounded-full bg-green-50 border-2 border-green-600 flex items-center justify-center mt-0.5 font-bold">
                  <span className="material-symbols-outlined text-green-600 text-[12px]">check</span>
                </div>
                <div>
                  <p className="text-body-md text-on-surface font-bold">Booked</p>
                </div>
              </div>

              {/* Packed */}
              <div className={`relative z-10 flex gap-4 items-start font-semibold ${isBooked ? 'opacity-40' : ''}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 border-2 ${
                  isBooked 
                    ? 'border-outline-variant bg-surface' 
                    : 'bg-green-50 border-green-600 text-green-600'
                }`}>
                  {!isBooked && <span className="material-symbols-outlined text-green-600 text-[12px]">check</span>}
                </div>
                <div>
                  <p className="text-body-md text-on-surface font-bold">Packed</p>
                </div>
              </div>

              {/* Dispatched */}
              <div className={`relative z-10 flex gap-4 items-start font-semibold ${!isDispatched ? 'opacity-40' : ''}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 border-2 ${
                  isDispatched 
                    ? 'bg-secondary-container border-secondary shadow-[0_0_0_3px_rgba(255,198,65,0.2)]' 
                    : 'border-outline-variant bg-surface'
                }`}>
                  {isDispatched && <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>}
                </div>
                <div>
                  <p className={`text-body-md ${isDispatched ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>Dispatched</p>
                  {isDispatched && <p className="text-body-sm text-secondary italic font-semibold">In transit via {courier}</p>}
                </div>
              </div>

              {/* In Transit */}
              <div className="relative z-10 flex gap-4 items-start opacity-40 font-semibold">
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant bg-surface mt-0.5"></div>
                <div>
                  <p className="text-body-md text-on-surface-variant">In Transit</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="relative z-10 flex gap-4 items-start opacity-40 font-semibold">
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant bg-surface mt-0.5"></div>
                <div>
                  <p className="text-body-md text-on-surface-variant">Delivered</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Dispatch Success State Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/50 text-center flex flex-col items-center font-sans">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-green-600 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-display text-headline-lg text-on-surface mb-2 font-bold leading-tight">Parcel Dispatched Successfully!</h2>
            
            <div className="font-semibold text-body-md text-on-surface-variant mb-6 text-center leading-relaxed">
              Tracking ID: <span className="font-mono font-bold text-on-surface bg-surface-container-low px-1.5 py-0.5 rounded">{trackingNumber}</span> via <strong className="text-on-surface">{courier}</strong><br/>
              <span className="block mt-2">Devotee <strong className="text-on-surface">{delivery.devoteeName}</strong> has been notified.</span>
            </div>

            <button 
              onClick={() => navigate('/deliveries')}
              className="w-full py-3 px-6 bg-primary text-on-primary hover:bg-[#b04b00] rounded-full font-button text-button shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Deliveries
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
