const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'pro-panel/src/lib/db.ts');
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Replace the large mock arrays with empty arrays or correct type casting
dbContent = dbContent.replace(/const initialBookings: Booking\[\] = \[([\s\S]*?)\];/g, 'const initialBookings: Booking[] = [] as any;');
dbContent = dbContent.replace(/const initialSlots: PoojaSlot\[\] = \[([\s\S]*?)\];/g, 'const initialSlots: PoojaSlot[] = [] as any;');
dbContent = dbContent.replace(/const initialPujaris: Pujari\[\] = \[([\s\S]*?)\];/g, 'const initialPujaris: Pujari[] = [] as any;');
fs.writeFileSync(dbPath, dbContent);

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

// Fix Bookings.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Bookings.tsx'), [
  ["b.tab", "(b.status === 'COMPLETED' ? 'completed' : 'upcoming')"],
  ["b.pujari", "(b.priestName || 'Not Assigned')"],
  ["b.delivery", "(b.hasPrasadDelivery ? 'Yes' : 'No')"],
  ["b.devoteeName", "(b.devoteeDetails?.name)"],
  ["b.dateTime", "b.scheduledDate"],
  ["import { db, type Booking }", "import { db, type Booking }"]
]);

// Fix Home.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Home.tsx'), [
  ["b.tab", "(b.status === 'COMPLETED' ? 'completed' : 'upcoming')"],
  ["b.pujari", "(b.priestName || 'Not Assigned')"],
  ["b.delivery", "(b.hasPrasadDelivery ? 'Yes' : 'No')"],
  ["b.devoteeName", "(b.devoteeDetails?.name)"],
  ["b.dateTime", "b.scheduledDate"],
]);

// Fix LiveStream.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/LiveStream.tsx'), [
  ["b.pujari", "(b.priestName || 'Not Assigned')"],
  ["b.dateTime", "b.scheduledDate"],
]);

// Fix DeliveryDetail.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/DeliveryDetail.tsx'), [
  ["b.devoteeName", "(b.devoteeDetails?.name)"],
  ["b.dateTime", "b.scheduledDate"],
]);

// Fix BookingDetail.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/BookingDetail.tsx'), [
  ["booking.devoteeName", "booking.devoteeDetails?.name"],
  ["booking.gotra", "booking.devoteeDetails?.gotra"],
  ["booking.nakshatra", "booking.devoteeDetails?.nakshatra"],
  ["booking.dateTime", "booking.scheduledDate"],
  ["booking.pujari", "booking.priestName"],
  ["booking.delivery", "(booking.hasPrasadDelivery ? 'Yes' : 'No')"],
]);

// Fix Schedule.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Schedule.tsx'), [
  ["slot.status", "(slot.status === 'ACTIVE')"],
]);

console.log('Fixed pro-panel files');
