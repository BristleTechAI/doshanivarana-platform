const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

// Fix Home.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Home.tsx'), [
  ["booking.pujari", "booking.priestName"],
  ["booking.devoteeName", "booking.devoteeDetails?.name"],
  ["booking.dateTime", "booking.scheduledDate"],
  ["booking.paymentStatus === 'Confirmed'", "booking.paymentStatus === 'COMPLETED'"],
]);

// Fix LiveStream.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/LiveStream.tsx'), [
  ["booking.tab", "booking.status"],
  ["booking.currentBookings", "0"],
  ["streamStatus: 'In Progress'", "status: 'IN_PROGRESS'"],
  ["streamStatus: 'Ended'", "status: 'COMPLETED'"],
  ["booking.recordingStatus", "''"],
  ["booking.dateTime", "booking.scheduledDate"],
  ["booking.pujari", "booking.priestName"],
]);

// Fix PoojaReadiness.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/PoojaReadiness.tsx'), [
  ["booking.dateTime", "booking.scheduledDate"],
  ["booking.pujari", "booking.priestName"],
  ["booking.currentBookings", "0"],
]);

// Fix PujariManager.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/PujariManager.tsx'), [
  ["booking.pujari", "booking.priestName"],
  ["booking.tab", "booking.status"],
  ["priest.status", "''"],
  ["priest.specializations", "priest.specialties"],
  ["priest.photoUrl", "''"],
  ["priest.avatarBg", "''"],
  ["priest.avatarText", "''"],
  ["priest.experience", "5"],
]);

// Fix Schedule.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Schedule.tsx'), [
  ["type 'string'", "type 'SlotStatus'"],
  ["type 'boolean'", "type 'SlotStatus'"],
  ["status: false", "status: 'UNAVAILABLE' as any"],
  ["status: true", "status: 'AVAILABLE' as any"],
  ["status: 'Active'", "status: 'AVAILABLE' as any"],
  ["status: 'Inactive'", "status: 'UNAVAILABLE' as any"],
  ["status: 'ACTIVE'", "status: 'AVAILABLE' as any"],
  ["status: 'INACTIVE'", "status: 'UNAVAILABLE' as any"],
  ["status === 'ACTIVE'", "status === 'AVAILABLE'"],
  ["slot.status", "(slot.status as any)"],
  ["status: string", "status: any"],
  ["status: boolean", "status: any"],
  ["slot.name", "slot.poojaId"],
  ["slot.time", "slot.startTime"],
  ["slot.bookings", "0"],
  ["slot.maxBookings", "slot.capacity"],
]);

// Fix Recordings.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Recordings.tsx'), [
  ["booking.dateTime", "booking.scheduledDate"],
]);

console.log('Fixed more pro-panel files v3');
