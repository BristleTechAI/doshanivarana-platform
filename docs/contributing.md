# Contributing Guide

## Prerequisites

- Node.js 18+
- Git
- (For mobile) Expo CLI + Android Studio / Xcode

## Git Workflow

We follow a **feature branch** workflow:

```
main          ← production-ready code
  └── dev     ← integration branch (default PR target)
        └── feature/<workspace>/<short-description>
        └── fix/<workspace>/<short-description>
        └── chore/<workspace>/<short-description>
```

### Branch Naming

| Prefix | Use case | Example |
|--------|----------|---------|
| `feature/` | New feature | `feature/user-app/booking-flow` |
| `fix/` | Bug fix | `fix/pro-panel/calendar-timezone` |
| `chore/` | Tooling, deps, docs | `chore/admin-panel/update-deps` |

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`  
**Scopes:** `user-app`, `pro-panel`, `admin-panel`, `docs`, `root`

**Examples:**

```
feat(user-app): add booking confirmation screen
fix(pro-panel): resolve date picker timezone offset
docs(docs): update database schema with reviews table
```

## Pull Request Process

1. Branch off `dev`
2. Make your changes inside the relevant workspace folder
3. Run lint and tests locally before pushing
4. Open a PR targeting `dev`
5. Fill in the PR template (description, screenshots for UI changes)
6. Request review from at least one team member
7. Merge only after approval and green CI

## Code Style

- **TypeScript** — strict mode enabled in all workspaces
- **ESLint + Prettier** — run `npm run lint` and `npm run format` before committing
- **No commented-out code** in PRs — use `// TODO:` with a ticket reference if needed

## Testing

| Workspace | Framework | Command |
|-----------|-----------|---------|
| user-app | Jest + React Native Testing Library | `npm test` |
| pro-panel | Vitest + Testing Library | `npm test` |
| admin-panel | Vitest + Testing Library | `npm test` |

## Reporting Issues

Open a GitHub Issue with:
- Workspace affected (`user-app` / `pro-panel` / `admin-panel`)
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots / logs if applicable
