# user-app

> **End-User Mobile Application** — Doshanivarana Platform

## Overview

`user-app` is the consumer-facing mobile application that allows users to:

- 🔍 **Discover** priests and spiritual service providers
- 📅 **Book** poojas, rituals, and ceremonies
- 🔔 **Receive** real-time notifications and updates
- 💳 **Pay** securely for services
- ⭐ **Rate & Review** service providers

## Tech Stack (Planned)

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo |
| State Management | Zustand / Redux Toolkit |
| Backend | Supabase (Auth, DB, Storage) |
| Payments | Razorpay / Stripe |
| Navigation | Expo Router |

## Project Structure (Planned)

```
user-app/
├── app/            # Expo Router screens
├── components/     # Shared UI components
├── hooks/          # Custom React hooks
├── lib/            # Supabase client & utilities
├── assets/         # Images, fonts, icons
└── constants/      # Theme, routes, config
```

## Getting Started

> Prerequisites: Node.js 18+, Expo CLI

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Related Workspaces

- [`pro-panel`](../pro-panel/) – Service provider dashboard
- [`admin-panel`](../admin-panel/) – Administrative dashboard
