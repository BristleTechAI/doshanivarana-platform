# Database Schema

> All tables live in a **Supabase Postgres** instance with Row-Level Security (RLS) enabled.

## Entity Relationship Overview

```
profiles ──< bookings >── services
   │                          │
   │                       providers
   │
   └── (role: user | pro | admin)
```

## Tables

### `profiles`
Extends Supabase `auth.users`. One row per user, regardless of role.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | FK → `auth.users.id` (PK) |
| `role` | `text` | `user` \| `pro` \| `admin` |
| `full_name` | `text` | |
| `avatar_url` | `text` | Supabase Storage URL |
| `phone` | `text` | |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

---

### `providers`
Extended profile for priests / service providers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | FK → `profiles.id` (PK) |
| `bio` | `text` | |
| `languages` | `text[]` | |
| `verified` | `boolean` | Set by admin |
| `rating` | `numeric(3,2)` | Computed average |
| `location` | `text` | |

---

### `services`
Catalog of services a provider offers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `provider_id` | `uuid` | FK → `providers.id` |
| `title` | `text` | e.g., "Satyanarayan Pooja" |
| `description` | `text` | |
| `duration_mins` | `integer` | |
| `price` | `numeric(10,2)` | |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | |

---

### `bookings`
Tracks every service booking between a user and a provider.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `profiles.id` |
| `service_id` | `uuid` | FK → `services.id` |
| `scheduled_at` | `timestamptz` | |
| `status` | `text` | `pending` \| `confirmed` \| `completed` \| `cancelled` |
| `notes` | `text` | User notes to provider |
| `payment_status` | `text` | `unpaid` \| `paid` \| `refunded` |
| `created_at` | `timestamptz` | |

---

### `reviews`
Post-booking reviews left by users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | FK → `bookings.id` (unique) |
| `rating` | `integer` | 1–5 |
| `comment` | `text` | |
| `created_at` | `timestamptz` | |

---

## Row-Level Security (RLS) Notes

| Table | Rule |
|-------|------|
| `profiles` | Users can read/update their own row; admins can read all |
| `providers` | Public read; only owner can update |
| `services` | Public read; only provider owner can insert/update/delete |
| `bookings` | User can see their own; provider can see bookings for their services; admins see all |
| `reviews` | Public read; only the booking's user can insert |

> Detailed RLS SQL policies will be added in the migration files.
