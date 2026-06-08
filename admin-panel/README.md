# admin-panel

> **Administrative Dashboard** — Doshanivarana Platform

## Overview

`admin-panel` is the internal web dashboard for **platform administrators**. It provides:

- 👥 **User Management** — manage end-user accounts, roles, and permissions
- 🧑‍⚕️ **Provider Management** — onboard, verify, and moderate service providers
- 📊 **Platform Analytics** — bookings, revenue, growth, and engagement metrics
- 🛡️ **Moderation Tools** — review reported content and resolve disputes
- ⚙️ **Platform Configuration** — manage categories, pricing rules, and feature flags
- 📣 **Notifications & Campaigns** — send targeted push/email communications

## Tech Stack (Planned)

| Layer | Technology |
|-------|-----------|
| Framework | React + Vite |
| UI Library | shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Backend | Supabase (Auth, DB, Edge Functions) |
| Charts & Tables | Recharts + TanStack Table |

## Project Structure (Planned)

```
admin-panel/
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
VITE_SUPABASE_SERVICE_ROLE_KEY=   # Admin operations only — keep secret
```

> ⚠️ **Security:** The service role key has elevated privileges. Never expose it on the client side in production; route sensitive operations through Supabase Edge Functions.

## Related Workspaces

- [`user-app`](../user-app/) – End-user mobile app
- [`pro-panel`](../pro-panel/) – Service provider dashboard
