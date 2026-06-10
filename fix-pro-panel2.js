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

// Fix PujariManager.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/PujariManager.tsx'), [
  ["priest.avatarText", "''"],
  ["priest.status", "'ACTIVE'"],
  ["priest.specializations", "priest.specialties"],
  ["priest.experience", "5"],
  ["spec: string", "spec: any"]
]);

// Fix Recordings.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Recordings.tsx'), [
  ["booking.dateTime", "booking.scheduledDate"],
]);

// Fix Schedule.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/Schedule.tsx'), [
  ["slot.status === 'ACTIVE'", "slot.status === 'AVAILABLE'"],
  ["slot.status === 'INACTIVE'", "slot.status !== 'AVAILABLE'"],
  ["status: false", "status: 'UNAVAILABLE'"],
  ["slot.name", "slot.poojaId"],
  ["slot.time", "slot.startTime"],
  ["slot.bookings", "(slot.capacity - slot.availableSeats)"],
  ["slot.maxBookings", "slot.capacity"]
]);

// Fix StreamReadiness.tsx
replaceInFile(path.join(__dirname, 'pro-panel/src/pages/StreamReadiness.tsx'), [
  ["booking.dateTime", "booking.scheduledDate"],
  ["booking.pujari", "booking.priestName"],
]);

console.log('Fixed more pro-panel files');
