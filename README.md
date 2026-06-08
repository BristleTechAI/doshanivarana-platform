# Doshanivarana Platform

> A unified platform connecting end-users with priests and spiritual service providers, managed through a robust administrative layer.

## Project Architecture

```
doshanivarana-platform/
├── user-app/       # End-user mobile application
├── pro-panel/      # Web dashboard for priests / service providers
└── admin-panel/    # Administrative dashboard for platform management
```

## Workspaces

| Workspace | Type | Audience | Description |
|-----------|------|----------|-------------|
| [`user-app`](./user-app/) | Mobile App | End Users | Allows users to discover, book, and manage spiritual services |
| [`pro-panel`](./pro-panel/) | Web Dashboard | Priests / Service Providers | Enables pros to manage their profile, availability, bookings, and earnings |
| [`admin-panel`](./admin-panel/) | Web Dashboard | Platform Admins | Provides tools for platform governance, user management, analytics, and configuration |

## Getting Started

Each workspace is an independent application. Navigate into the respective folder and follow the instructions in its `README.md`.

```bash
# Example – start the pro panel
cd pro-panel
# follow README.md instructions
```

## Tech Stack (Planned)

- **user-app** – React Native / Expo
- **pro-panel** – React + Vite (Web)
- **admin-panel** – React + Vite (Web)
- **Backend / BaaS** – Supabase

## Contributing

Please read the contributing guidelines before opening a pull request. All changes should target the appropriate workspace directory.

## License

Proprietary – © Bristletech. All rights reserved.
