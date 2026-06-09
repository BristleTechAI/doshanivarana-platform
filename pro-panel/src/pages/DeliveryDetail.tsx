import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { db, type Booking } from '../lib/db';

interface DeliveryDetailData {
  bookingId: string;
  devoteeName: string;
  mobile: string;
  poojaName: string;
  poojaDate: string;
  address: string;
  pincode: string;
  status: 'Booked' | 'Packed' | 'Dispatched' | 'In Transit' | 'Delivered';
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

  const mapBookingToDeliveryDetail = (b: Booking): DeliveryDetailData => {
    const fullAddress = b.deliveryAddress;
    const pincodeMatch = fullAddress.match(/\d{5,6}$/) || fullAddress.match(/\d{3}\s?\d{3}$/);
    const pincode = pincodeMatch ? pincodeMatch[0] : '';
    const address = pincodeMatch ? fullAddress.replace(pincodeMatch[0], '').trim().replace(/,\s*$/, '') : fullAddress;

    return {
      bookingId: b.id,
      devoteeName: b.devoteeName,
      mobile: b.mobile,
      poojaName: b.poojaName,
      poojaDate: b.dateTime.split(',')[0],
      address,
      pincode,
      status: (b.deliveryStatus === 'Not Applicable' ? 'Booked' : b.deliveryStatus) as DeliveryDetailData['status'],
      weight: b.deliveryWeight || '',
      length: b.deliveryLength || '',
      width: b.deliveryWidth || '',
      height: b.deliveryHeight || '',
      contents: b.deliveryContents || '',
      courier: b.deliveryCourier || 'BlueDart',
      trackingNumber: b.deliveryTrackingNumber || '',
      dispatchDate: b.deliveryDispatchDate || b.dateTime.split(',')[0],
      estimatedDelivery: b.deliveryEstimatedDelivery || ''
    };
  };

  const existingBooking = id ? db.getBookingById(id) : null;
  const initialDelivery = existingBooking ? mapBookingToDeliveryDetail(existingBooking) : null;

  const [delivery, setDelivery] = useState<DeliveryDetailData | null>(initialDelivery);
  
  const [weight, setWeight] = useState(initialDelivery?.weight || '');
  const [length, setLength] = useState(initialDelivery?.length || '');
  const [width, setWidth] = useState(initialDelivery?.width || '');
  const [height, setHeight] = useState(initialDelivery?.height || '');
  const [contents, setContents] = useState(initialDelivery?.contents || '');
  const [courier, setCourier] = useState(initialDelivery?.courier || '');
  const [trackingNumber, setTrackingNumber] = useState(initialDelivery?.trackingNumber || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(initialDelivery?.estimatedDelivery || '');

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleMarkAsPacked = () => {
    if (!id) return;
    const b = db.getBookingById(id);
    if (b) {
      const updatedBooking: Booking = {
        ...b,
        deliveryStatus: 'Packed',
        deliveryWeight: weight,
        deliveryLength: length,
        deliveryWidth: width,
        deliveryHeight: height,
        deliveryContents: contents
      };
      db.updateBooking(updatedBooking);
      const mapped = mapBookingToDeliveryDetail(updatedBooking);
      setDelivery(mapped);
      setNotification('Parcel marked as Packed!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setNotification('Please enter a tracking number.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!id) return;
    const b = db.getBookingById(id);
    if (b) {
      const updatedBooking: Booking = {
        ...b,
        deliveryStatus: 'Dispatched',
        deliveryCourier: courier,
        deliveryTrackingNumber: trackingNumber,
        deliveryEstimatedDelivery: estimatedDelivery
      };
      db.updateBooking(updatedBooking);
      const mapped = mapBookingToDeliveryDetail(updatedBooking);
      setDelivery(mapped);
      setShowSuccessOverlay(true);
    }
  };

  if (!delivery) {
    return (
      <div className="max-w-[1440px] mx-auto pb-12 font-sans relative p-8 text-center text-on-surface-variant">
        Loading delivery details...
      </div>
    );
  }

  const isBooked = delivery.status === 'Booked';
  const isPacked = delivery.status === 'Packed';
  const isDispatched = delivery.status === 'Dispatched';

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <nav className="flex text-sm text-on-surface-variant mb-4 items-center gap-2 font-medium">
          <Link to="/deliveries" className="hover:text-primary transition-colors flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Deliveries
          </Link>
          <span className="mx-1">•</span>
          <span>Deliveries</span>
          <span className="mx-1">&gt;</span>
          <span className="text-on-surface font-bold">{delivery.bookingId} — {delivery.devoteeName}</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="font-display text-headline-lg text-on-surface font-semibold">
            Delivery Detail — {delivery.bookingId}
          </h1>
          <span className={`px-4 py-1.5 rounded-full font-label-md text-label-md uppercase tracking-wider font-bold border ${
            isBooked 
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
              : isPacked 
                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            {delivery.status}
          </span>
        </div>
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
                    value="10 May 2026" 
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
                  <p className="text-body-sm text-on-surface-variant font-semibold">08 May 2026, 3:45 PM</p>
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
                  {!isBooked && <p className="text-body-sm text-on-surface-variant font-semibold">09 May 2026, 11:20 AM</p>}
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
