# Authentication & Authorization Flows

> Doshanivarana uses **Supabase Auth** (JWT-based) with role-based access controlled via the `profiles.role` column and Postgres RLS policies.

## User Roles

| Role | App | Description |
|------|-----|-------------|
| `user` | user-app | End-user who books services |
| `pro` | pro-panel | Priest / service provider |
| `admin` | admin-panel | Platform administrator |

---

## Auth Flows

### 1. End-User Sign-Up / Sign-In (user-app)

```
User opens app
  → OTP via phone / Email + password
  → Supabase Auth creates auth.users row
  → DB trigger creates profiles row (role: 'user')
  → App receives JWT session
  → Redirected to Home screen
```

### 2. Provider Onboarding (pro-panel)

```
Provider visits pro-panel
  → Signs up with Email + password
  → DB trigger creates profiles row (role: 'pro')
  → Redirected to onboarding wizard
    ├── Complete bio, languages, location
    └── Submit for admin verification
  → Admin sets providers.verified = true
  → Provider gets full access to dashboard
```

### 3. Admin Sign-In (admin-panel)

```
Admin visits admin-panel
  → Email + password (no self-sign-up — invite only)
  → Supabase Auth returns JWT
  → App checks profiles.role === 'admin'
  → If not admin → redirect to /unauthorized
  → Else → Admin dashboard
```

---

## JWT & RLS

- Every Supabase client request includes the user's JWT automatically.
- Postgres RLS policies check `auth.uid()` and join to `profiles.role` to grant or deny access.
- The `service_role` key (used only in Edge Functions / server-side) bypasses RLS — **never expose it on the client**.

---

## Session Management

| Concern | Approach |
|---------|----------|
| Token refresh | Handled automatically by `@supabase/supabase-js` |
| Persistence | `localStorage` (web), `SecureStore` (mobile) |
| Sign-out | `supabase.auth.signOut()` clears session everywhere |

---

## OAuth (Planned)

- **Google OAuth** — for user-app (social sign-in)
- **Apple OAuth** — required for iOS App Store compliance
