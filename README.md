# 🛡️ EVERHERE

**You're not alone when help is needed.**

EVERHERE is a free, community-built personal-safety communication platform. Signal your safety status and reach a trusted human quickly — built by people who believe safety tools should be accessible to everyone.

> ⚠️ **EVERHERE is not a replacement for emergency services, police, guardians, or trained professionals.** If you are in immediate danger, please contact your local emergency services.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend API | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | Argon2id + httpOnly session cookies + CSRF double-submit |
| Monorepo | pnpm workspaces |

## Project Structure

```
everhere/
├── apps/
│   ├── web/                    # Next.js app (public + authenticated UI)
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── (public)/   # Public route group
│   │   │   │   ├── (contributor)/
│   │   │   │   ├── (mod)/
│   │   │   │   └── (admin)/
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Client utilities
│   │   │   └── styles/         # Global CSS (Tailwind)
│   │   └── next.config.mjs
│   └── api/                    # Express REST API
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── middleware/     # auth, rbac, rateLimit, csrf, audit
│       │   ├── db/             # Prisma client
│       │   └── index.ts        # Entry point
│       └── prisma/
│           └── schema.prisma   # Database schema
├── packages/
│   └── shared/                 # Shared Zod schemas & TypeScript types
├── .env.example                # Environment config template
├── tsconfig.base.json          # Shared TS config
└── package.json                # Root workspace
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 8
- PostgreSQL (local or remote)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/everhere.git
cd everhere

# Install dependencies
pnpm install

# Copy environment config
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# Generate Prisma client
cd apps/api
pnpm db:generate

# Run migrations (requires PostgreSQL running)
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development servers
cd ../..
pnpm dev
```

This starts:
- **Web app** at `http://localhost:3000`
- **API server** at `http://localhost:3001`

### Default Admin Account

After seeding:
- Email: `admin@everhere.org`
- Password: `ChangeMeImmediately123!`

**Change this immediately in production.**

## Key Features

- **Public Landing Page** — Hero, About, How It Works, Community, Privacy & Security, Roadmap, Feedback
- **Contribution Application** — Multi-step form with validation, skill selection, consent
- **Contributor Profiles** — Public/private field split, contributor-controlled visibility
- **Contributions** — Link-based submissions with moderation workflow
- **Tags** — Moderated creation and approval
- **Feedback** — Category-based general feedback + separate security disclosure channel
- **Moderator Dashboard** — Queues, approve/reject, flag accounts, audit trail
- **Admin Dashboard** — Full user/role management, content config, audit log, dual-control

## Security

- Argon2id password hashing
- httpOnly, Secure, SameSite=Lax session cookies
- CSRF double-submit token protection
- Rate limiting on all public endpoints
- RBAC middleware (deny-by-default)
- CSP + HSTS security headers
- UUID identifiers (no sequential IDs)
- Append-only audit log
- Honeypot fields on public forms
- Generic error messages (no info leakage)

See [Security Overview](/security) for full details.

## Deployment

### MVP Architecture

```
Static Landing Page (InfinityFree) → API + DB (VPS/PaaS)
```

The public landing page is static-exportable to InfinityFree. The API and database run on a VPS or PaaS (Render, Fly.io, Railway) with proper secrets management.

### Production Checklist

- [ ] Set strong, unique secrets in `.env`
- [ ] Enable `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Set up PostgreSQL backups
- [ ] Enable monitoring and error tracking
- [ ] Run security scan (OWASP ZAP baseline)
- [ ] Verify HTTPS/TLS is working
- [ ] Test all RBAC role boundaries

## Roadmap

1. ✅ Foundation (repo, CI, lint, tokens)
2. ✅ Landing Page (all sections, responsive, accessible)
3. 🔲 Authentication (register, login, sessions, MFA)
4. 🔲 Contributor System (application → review → profile)
5. 🔲 Contributions (link-based, tags, moderation)
6. 🔲 Feedback (general + security reports)
7. 🔲 Moderator Dashboard
8. 🔲 Admin Dashboard
9. 🔲 Security Testing
10. 🔲 Production Deploy

## License

This project is community-owned. See LICENSE for details.

---

Built with ❤️ by the EVERHERE community.
