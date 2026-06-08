# pro-panel

> **Service Provider Web Dashboard** — Doshanivarana Platform

## Overview

`pro-panel` is the web dashboard for **priests and spiritual service providers**. It enables pros to:

- 🗓️ **Manage Availability** — set schedules, block dates, and control booking windows
- 📋 **Handle Bookings** — accept, decline, and track service requests
- 💬 **Communicate** with clients through in-app messaging
- 💰 **Track Earnings** — view payouts, invoices, and transaction history
- 🧾 **Manage Profile** — update service offerings, rates, photos, and credentials

## Tech Stack (Planned)

| Layer | Technology |
|-------|-----------|
| Framework | React + Vite |
| UI Library | shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Backend | Supabase (Auth, DB, Realtime) |
| Charts | Recharts |

## Project Structure (Planned)

```
pro-panel/
├── src/
│   ├── pages/        # Route-level page components
│   ├── components/   # Shared UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Supabase client & utilities
│   └── store/        # Zustand state slices
├── public/           # Static assets
└── index.html
```

## Getting Started

> Prerequisites: Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Related Workspaces

- [`user-app`](../user-app/) – End-user mobile app
- [`admin-panel`](../admin-panel/) – Administrative dashboard
