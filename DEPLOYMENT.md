# EVERHERE Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Static Site (InfinityFree)                              │
│  - Landing page + public pages (static export)           │
│  - Everhere.free.je                                      │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS (API calls)
┌──────────────────▼──────────────────────────────────────┐
│  API Server (VPS / PaaS)                                │
│  - Node.js + Express + TypeScript                        │
│  - Port 3001                                             │
│  - Environment: production                               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  PostgreSQL Database                                     │
│  - Supabase (free) / Neon (free) / VPS self-hosted       │
│  - All user data, sessions, audit logs                   │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Deploy Static Site to InfinityFree

### Files to Upload
The static export is at `apps/web/out/`:

```
apps/web/out/
├── index.html              ← Landing page
├── .htaccess               ← Security headers
├── about.html              ← About page
├── community.html          ← Community page
├── contributors.html       ← Contributors directory
├── contribute.html         ← Application form
├── feedback.html           ← Feedback form
├── how-it-works.html       ← How It Works
├── login.html              ← Login page
├── register.html           ← Register page
├── forgot-password.html    ← Forgot password
├── reset-password.html     ← Reset password
├── privacy.html            ← Privacy & Security
├── roadmap.html            ← Roadmap
├── security.html           ← Security overview
├── 404.html                ← Custom 404
├── robots.txt              ← SEO directives
├── sitemap.xml             ← Sitemap
├── security/
│   └── report.html         ← Security report form
└── _next/
    ├── static/             ← CSS, JS, media assets
    └── ...
```

### Upload Steps
1. Log into InfinityFree Control Panel
2. Open **File Manager** → navigate to `htdocs/`
3. **Delete** any default `index.php`
4. Upload **everything** from `apps/web/out/` into `htdocs/`
5. Enable **SSL** (Let's Encrypt) for `everhere.free.je`
6. Verify: `https://everhere.free.je`

### Build Command (to regenerate)
```bash
cd apps/web
pnpm build    # Generates apps/web/out/
```

---

## Phase 2: Deploy API Server

### Option A: Render Free Tier (Recommended)
1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Settings:
   - **Build Command:** `cd apps/api && pnpm install && pnpm db:generate`
   - **Start Command:** `cd apps/api && pnpm start`
   - **Environment:** Node
4. Add environment variables (see below)
5. Database: Create **PostgreSQL** database on Render (free tier)

### Option B: Fly.io
1. Install `flyctl`
2. `fly launch` in project root
3. `fly secrets set` for environment variables
4. `fly deploy`

### Option C: Railway
1. Connect GitHub repo
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy

### Option D: VPS (Hetzner / DigitalOcean)
```bash
# On your VPS:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

# Clone and setup:
git clone <repo-url> /opt/everhere
cd /opt/everhere
pnpm install
cd apps/api
cp .env.example .env  # Edit with real values
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Run with PM2:
sudo npm install -g pm2
pm2 start "pnpm start" --name everhere-api
pm2 save
pm2 startup
```

---

## Phase 3: Environment Variables

### API Server (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/everhere

# Security
SESSION_SECRET=<random-64-char-hex>
CSRF_SECRET=<random-64-char-hex>
SESSION_MAX_AGE_HOURS=12

# CORS — your static site domain
CORS_ORIGINS=https://everhere.free.je

# Server
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Email (when ready)
EMAIL_API_KEY=<your-resend-or-postmark-key>
EMAIL_FROM=noreply@everhere.free.je

# CAPTCHA (when ready)
CAPTCHA_SECRET=<your-hcaptcha-secret>
```

### Frontend (.env.local in apps/web/)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_APP_URL=https://everhere.free.je
```

---

## Phase 4: Database Setup

```bash
cd apps/api

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed default data (admin user, roles, etc.)
pnpm db:seed
```

### Default Admin Account
- **Email:** admin@everhere.org
- **Password:** ChangeMeImmediately123!
- **⚠️ Change this immediately after first login**

---

## Phase 5: SSL & Security

### InfinityFree (Static Site)
1. Control Panel → SSL/TLS → Enable Let's Encrypt
2. Force HTTPS redirect

### API Server
- If on Render/Fly.io/Railway: HTTPS is automatic
- If on VPS: Use Nginx + Let's Encrypt
  ```nginx
  server {
      listen 443 ssl;
      server_name api.everhere.free.je;

      ssl_certificate /etc/letsencrypt/live/api.everhere.free.je/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/api.everhere.free.je/privkey.pem;

      location / {
          proxy_pass http://localhost:3001;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

---

## Phase 6: DNS Configuration

### For everhere.free.je (InfinityFree subdomain)
- Nameservers should already be set when you created the subdomain
- Wait up to 72 hours for propagation
- Check at [dnschecker.org](https://dnschecker.org)

### For API subdomain (if separate)
- Create `api.everhere.free.je` in your domain registrar
- Point to your VPS/PaaS IP address

---

## Production Checklist

### Security
- [ ] Change default admin password
- [ ] Set strong `SESSION_SECRET` and `CSRF_SECRET` (64+ char random hex)
- [ ] Set `NODE_ENV=production`
- [ ] CORS_ORIGINS set to actual domain (not `*`)
- [ ] SSL enabled on both static site and API
- [ ] `.env` files never committed to git
- [ ] Rate limiting active on all public endpoints

### Functionality
- [ ] Static site loads at `https://everhere.free.je`
- [ ] API health check returns `{"status":"ok"}` at `/health`
- [ ] Login works end-to-end
- [ ] Registration works end-to-end
- [ ] Password reset flow works
- [ ] Application submission works
- [ ] Contribution submission works (with moderator approval)
- [ ] Feedback submission works
- [ ] Security report submission works
- [ ] Moderator dashboard loads for mod/admin users
- [ ] Admin dashboard loads for admin users
- [ ] Audit log records all privileged actions

### Performance
- [ ] Static site Lighthouse score > 90
- [ ] API response time < 200ms (p95)
- [ ] Database indexes on all foreign keys
- [ ] Pagination on all list endpoints

### Monitoring
- [ ] Error tracking (Sentry or equivalent)
- [ ] Uptime monitoring (UptimeRobot free tier)
- [ ] Database backup schedule
- [ ] Log aggregation

---

## Cost Breakdown (MVP)

| Service | Cost | Notes |
|---------|------|-------|
| InfinityFree (static hosting) | $0 | Free forever |
| Render free tier (API) | $0 | 750 hours/month |
| Supabase free tier (PostgreSQL) | $0 | 500MB, 50K rows |
| Let's Encrypt (SSL) | $0 | Free certificates |
| **Total** | **$0/month** | |

### When You Outgrow Free Tiers
- Static site → Vercel/Netlify (free) or same VPS as API
- API → $5-10/mo VPS (Hetzner CX22)
- Database → $5-10/mo managed Postgres
- Total: ~$10-20/month for significant traffic
