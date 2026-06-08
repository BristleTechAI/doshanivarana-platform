# Deployment Guide

> This document covers deployment for all three workspaces and the Supabase backend.

## Supabase Project Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Note your **Project URL** and **anon key** from Project Settings → API
3. Run migrations from the repo root:

```bash
npx supabase db push
```

---

## `user-app` — React Native (Expo)

### Development Build

```bash
cd user-app
npm install
npx expo start
```

### Production Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store / Play Store

Follow Expo's [EAS Submit](https://docs.expo.dev/submit/introduction/) guide.

---

## `pro-panel` — React + Vite (Web)

### Development

```bash
cd pro-panel
npm install
npm run dev         # http://localhost:5173
```

### Production Build

```bash
npm run build       # outputs to dist/
```

### Hosting Options

| Platform | Command / Notes |
|----------|----------------|
| **Vercel** | Connect repo → auto-deploy on push to `main` |
| **Netlify** | `netlify deploy --prod --dir=dist` |
| **Firebase Hosting** | `firebase deploy --only hosting` |

#### Environment Variables (Vercel / Netlify)

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## `admin-panel` — React + Vite (Web)

Same process as `pro-panel`. Additionally set:

```
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Security:** Restrict admin-panel access via IP allowlist or VPN at the hosting/CDN layer. Never expose service role key on the public internet.

---

## CI/CD (Planned — GitHub Actions)

```yaml
# .github/workflows/deploy-pro-panel.yml
on:
  push:
    branches: [main]
    paths: ['pro-panel/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: pro-panel
      - run: npm run build
        working-directory: pro-panel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PRO_PANEL }}
          working-directory: pro-panel
```
