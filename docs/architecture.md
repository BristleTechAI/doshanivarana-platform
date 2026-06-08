# System Architecture

## Overview

Doshanivarana is a three-tier platform connecting **end-users**, **service providers (priests)**, and **platform administrators** through a shared Supabase backend.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│   │  user-app   │   │  pro-panel  │   │ admin-panel │      │
│   │ (React      │   │ (React +    │   │ (React +    │      │
│   │  Native)    │   │  Vite)      │   │  Vite)      │      │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘      │
└──────────┼────────────────┼────────────────┼───────────────┘
           │                │                │
           └────────────────┼────────────────┘
                            │  HTTPS / Supabase Client
┌───────────────────────────▼─────────────────────────────────┐
│                     SUPABASE (BaaS)                         │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │   Auth   │  │ Postgres │  │ Storage  │  │  Edge    │  │
│   │  (JWT /  │  │   DB     │  │ (Media)  │  │Functions │  │
│   │  OAuth)  │  │ + RLS    │  │          │  │          │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Workspace Responsibilities

### `user-app` (React Native + Expo)
- Browse and search service providers
- Book and manage appointments
- In-app payments (Razorpay / Stripe)
- Push notifications

### `pro-panel` (React + Vite — Web)
- Availability and schedule management
- Booking acceptance / declination
- Earnings and payout tracking
- Profile and credential management

### `admin-panel` (React + Vite — Web)
- User and provider lifecycle management
- Platform-wide analytics
- Content moderation
- Feature flags and configuration

## Data Flow

```
User books a service
  → user-app calls Supabase DB (INSERT booking)
  → Supabase Realtime notifies pro-panel
  → Provider accepts → DB UPDATE
  → Supabase sends push notification to user-app
  → Admin can view aggregate data in admin-panel
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| BaaS | Supabase | Open-source, Postgres-native, built-in auth & realtime |
| Mobile | React Native + Expo | Cross-platform (iOS + Android), fast iteration |
| Web Panels | React + Vite | Fast dev experience, rich ecosystem |
| Auth | Supabase Auth (JWT) | Row-Level Security ties directly to auth identity |
| Payments | TBD (Razorpay / Stripe) | Evaluate regional support and fee structure |
