# API Reference

> The platform primarily uses **Supabase's auto-generated REST API** and **Edge Functions** for custom logic. This document covers the key data operations each workspace performs.

## Base URL

```
https://<your-project-ref>.supabase.co
```

Set via environment variable `VITE_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`.

---

## Authentication Endpoints

All auth is handled by Supabase Auth SDK — no manual HTTP calls needed.

| Action | SDK Call |
|--------|----------|
| Sign Up | `supabase.auth.signUp({ email, password })` |
| Sign In | `supabase.auth.signInWithPassword({ email, password })` |
| OTP (Phone) | `supabase.auth.signInWithOtp({ phone })` |
| Sign Out | `supabase.auth.signOut()` |
| Get Session | `supabase.auth.getSession()` |

---

## Database Operations (Supabase Client)

### Profiles

```ts
// Get current user profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Update profile
await supabase
  .from('profiles')
  .update({ full_name, avatar_url })
  .eq('id', userId)
```

### Services

```ts
// List all active services for a provider
const { data } = await supabase
  .from('services')
  .select('*')
  .eq('provider_id', providerId)
  .eq('is_active', true)

// Create a new service (pro-panel)
await supabase
  .from('services')
  .insert({ provider_id, title, description, duration_mins, price })
```

### Bookings

```ts
// Create a booking (user-app)
await supabase
  .from('bookings')
  .insert({ user_id, service_id, scheduled_at, notes })

// Get bookings for current provider (pro-panel)
const { data } = await supabase
  .from('bookings')
  .select('*, services(*), profiles(*)')
  .eq('services.provider_id', providerId)

// Update booking status (pro-panel)
await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId)
```

---

## Edge Functions (Planned)

Custom server-side logic deployed as Supabase Edge Functions.

| Function | Trigger | Description |
|----------|---------|-------------|
| `on-booking-created` | DB webhook | Sends push notification to provider |
| `on-booking-confirmed` | DB webhook | Sends confirmation to user |
| `process-payment` | HTTP POST | Initiates payment via Razorpay / Stripe |
| `send-otp` | HTTP POST | Custom OTP delivery if needed |

### Calling an Edge Function

```ts
const { data, error } = await supabase.functions.invoke('process-payment', {
  body: { bookingId, amount, currency: 'INR' },
})
```

---

## Realtime Subscriptions

```ts
// Pro-panel: listen for new bookings
supabase
  .channel('bookings')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'bookings' },
    (payload) => console.log('New booking:', payload.new)
  )
  .subscribe()
```

---

## Error Handling Convention

All Supabase calls return `{ data, error }`. Always check `error` before using `data`:

```ts
const { data, error } = await supabase.from('bookings').select('*')
if (error) throw new Error(error.message)
```
