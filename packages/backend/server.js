const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'queries-db.json');

app.use(cors());
app.use(express.json());

// Helper to get relative date/time strings for seeding
const getRelativeDateTimeStr = (daysOffset, timeStr) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${formattedDate}, ${timeStr}`;
};

// Initial Seed Data
const defaultQueries = [
  {
    id: 'Q-101',
    bookingId: 'BK-1001',
    devoteeName: 'Rajesh Kumar',
    timeAgo: '2 hours ago',
    subject: 'Can I reschedule my pooja date?',
    snippet: 'Namaste, I have booked Satyanarayana Pooja...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Rajesh Kumar',
        avatarText: 'RK',
        time: getRelativeDateTimeStr(0, '08:30 AM'),
        text: 'Namaste, I have booked the Satyanarayana Pooja for today. Due to a family emergency I need to know if there is any option to move it to a different date. Please help. Thank you.'
      }
    ]
  },
  {
    id: 'Q-102',
    bookingId: 'BK-1002',
    devoteeName: 'Priya Sharma',
    timeAgo: '5 hours ago',
    subject: 'When will recording be available?',
    snippet: 'I watched the pooja live but wanted to download...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Priya Sharma',
        avatarText: 'PS',
        time: getRelativeDateTimeStr(0, '05:15 AM'),
        text: 'I watched the pooja live but wanted to download the high quality recording file to share with my relatives. Will it be sent via email or is it available inside the portal?'
      }
    ]
  },
  {
    id: 'Q-103',
    bookingId: 'BK-1003',
    devoteeName: 'Anand Reddy',
    timeAgo: 'Yesterday',
    subject: 'Prasad delivery status',
    snippet: 'My parcel was dispatched 3 days ago but has not...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Anand Reddy',
        avatarText: 'AR',
        time: getRelativeDateTimeStr(-1, '04:20 PM'),
        text: 'My parcel was dispatched 3 days ago according to the notification, but the tracking ID is not updating on BlueDart. Can you check if it was picked up?'
      }
    ]
  },
  {
    id: 'Q-104',
    bookingId: 'BK-1004',
    devoteeName: 'Sunita Devi',
    timeAgo: '2 days ago',
    subject: 'Booking confirmation not received',
    snippet: 'I completed payment but did not get confirmation...',
    status: 'Replied',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Sunita Devi',
        avatarText: 'SD',
        time: getRelativeDateTimeStr(-2, '09:10 AM'),
        text: 'I completed payment of Rs.1500 on UPI but did not get any booking confirmation email or slot details. Please verify payment.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-2, '11:30 AM'),
        text: 'Namaste Sunita Devi, we checked our system and confirmed your payment for Booking BK-1004. You should have received the notification on the app now. Let us know if you need more assistance.'
      }
    ]
  },
  {
    id: 'Q-105',
    bookingId: 'BK-1005',
    devoteeName: 'Kiran Patel',
    timeAgo: '3 days ago',
    subject: 'Pujari name for my pooja',
    snippet: 'Who is the pujari assigned for Satyanarayana?',
    status: 'Replied',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Kiran Patel',
        avatarText: 'KP',
        time: getRelativeDateTimeStr(-3, '11:15 AM'),
        text: 'Who is the pujari assigned for Satyanarayana pooja? It says Pt. Sharma Ji or Pt. Acharya? I want to know who is the main priest.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-3, '02:00 PM'),
        text: 'Namaste Kiran Patel, Pt. Sharma Ji is assigned for your Satyanarayana pooja. He will contact you 1 hour before the pooja.'
      }
    ]
  }
];

// Read from JSON DB or return seeds
const readQueries = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const rawData = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(rawData);
    }
  } catch (e) {
    console.error('Error reading queries database, returning seeded data:', e);
  }
  // Seeding initial database
  writeQueries(defaultQueries);
  return defaultQueries;
};

// Write to JSON DB
const writeQueries = (queries) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(queries, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing queries database:', e);
  }
};

// Endpoints

// 1. Get all queries
app.get('/api/queries', (req, res) => {
  const queries = readQueries();
  const { devoteeName, bookingId } = req.query;

  let filtered = queries;
  if (devoteeName) {
    filtered = filtered.filter(q => q.devoteeName.toLowerCase() === devoteeName.toLowerCase());
  }
  if (bookingId) {
    filtered = filtered.filter(q => q.bookingId === bookingId);
  }
  res.json(filtered);
});

// 2. Get specific query details
app.get('/api/queries/:id', (req, res) => {
  const queries = readQueries();
  const query = queries.find(q => q.id === req.params.id);
  if (!query) {
    return res.status(404).json({ error: 'Query not found' });
  }
  res.json(query);
});

// 3. Create a new query (devotee starts a query)
app.post('/api/queries', (req, res) => {
  const { bookingId, devoteeName, subject, text, avatarText } = req.body;
  if (!devoteeName || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const queries = readQueries();
  const queryId = `Q-${100 + queries.length + 1}`;
  
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const newQuery = {
    id: queryId,
    bookingId: bookingId || 'BK-General',
    devoteeName,
    timeAgo: 'Just now',
    subject,
    snippet: text,
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: devoteeName,
        avatarText: avatarText || devoteeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        time: formattedTime,
        text
      }
    ]
  };

  queries.unshift(newQuery);
  writeQueries(queries);
  res.status(201).json(newQuery);
});

// 4. Send reply (either DEVOTEE or ADMIN)
app.post('/api/queries/:id/reply', (req, res) => {
  const { sender, senderName, avatarText, text } = req.body;
  if (!sender || !senderName || !text) {
    return res.status(400).json({ error: 'Missing required reply fields' });
  }

  const queries = readQueries();
  const index = queries.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  const query = queries[index];
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const newMsg = {
    sender,
    senderName,
    avatarText: avatarText || senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    time: formattedTime,
    text
  };

  query.thread.push(newMsg);
  query.snippet = text;
  query.timeAgo = 'Just now';
  query.status = sender === 'admin' ? 'Replied' : 'Open';

  queries[index] = query;
  writeQueries(queries);
  res.json(query);
});

// 5. Close a query
app.post('/api/queries/:id/close', (req, res) => {
  const queries = readQueries();
  const index = queries.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  queries[index].status = 'Closed';
  writeQueries(queries);
  res.json(queries[index]);
});

// 6. Reopen a query
app.post('/api/queries/:id/reopen', (req, res) => {
  const queries = readQueries();
  const index = queries.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  queries[index].status = 'Open';
  writeQueries(queries);
  res.json(queries[index]);
});

app.listen(PORT, () => {
  console.log(`Doshanivarana Chat Sync Backend running on port ${PORT}`);
});
