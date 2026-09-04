# 🚀 EVERHERE Deployment — Render + Vercel

## Prerequisites
- GitHub account
- Render account (free): [render.com](https://render.com)
- Vercel account (free): [vercel.com](https://vercel.com)

---

## STEP 1: Push to GitHub (5 minutes)

Open a terminal in your project root:

```bash
# Initialize git (if not already done)
cd "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)"
git init
git add .
git commit -m "EVERHERE MVP - complete"

# Create a new repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/everhere.git
git branch -M main
git push -u origin main
```

**Don't have a repo yet?** Go to [github.com/new](https://github.com/new), name it `everhere`, keep it Public, and push.

---

## STEP 2: Deploy API on Render (10 minutes)

### 2a. Create Database
1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **New** → **PostgreSQL**
3. Settings:
   - **Name:** `everhere-db`
   - **Database:** `everhere`
   - **Plan:** Free
4. Click **Create Database**
5. **Copy the Internal Database URL** (click the copy button)

### 2b. Create API Service
1. Click **New** → **Web Service**
2. Connect your GitHub repo `everhere`
3. Fill in:
   - **Name:** `everhere-api`
   - **Region:** Oregon (or nearest)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:**
     ```
     npm install -g pnpm && pnpm install --no-frozen-lockfile --ignore-scripts && cd apps/api && npx prisma generate --schema=./prisma/schema.prisma
     ```
   - **Start Command:**
     ```
     cd apps/api && npx prisma migrate deploy --schema=./prisma/schema.prisma && pnpm start
     ```
   - **Plan:** Free

### 2c. Add Environment Variables
Click **Environment** tab → Add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | *(paste the Internal URL from step 2a)* |
| `SESSION_SECRET` | *(run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` locally)* |
| `CSRF_SECRET` | *(run the same command again)* |
| `SESSION_MAX_AGE_HOURS` | `12` |
| `CORS_ORIGINS` | `https://YOUR_APP.vercel.app` *(update after Step 3)* |
| `LOG_LEVEL` | `info` |

### 2d. Deploy
Click **Create Web Service**. Wait for build to finish (2-3 minutes).

### 2e. Verify
Visit: `https://everhere-api.onrender.com/health`
Should show: `{"status":"ok","timestamp":"..."}`

### 2f. Seed Database
In Render dashboard → your API service → **Shell** tab:
```bash
cd apps/api
pnpm db:seed
```
This creates admin account: `admin@everhere.org` / `ChangeMeImmediately123!`

---

## STEP 3: Deploy Frontend on Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New..."** → **Project**
3. Import your `everhere` repo
4. Vercel may auto-detect settings. If prompted:
   - **Framework Preset:** Other
   - **Root Directory:** `.` (leave default)
   - **Build Command:** `cd apps/web && pnpm install && pnpm build`
   - **Output Directory:** `apps/web/out`
5. Add Environment Variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://everhere-api.onrender.com/api/v1`
6. Click **Deploy**
7. Wait 1-2 minutes → your site is live!

Your URL will be something like: `https://everhere-abc123.vercel.app`

---

## STEP 4: Connect Frontend to API

1. Go back to **Render** → your API service → **Environment**
2. Update `CORS_ORIGINS` with your actual Vercel URL:
   ```
   CORS_ORIGINS=https://everhere-abc123.vercel.app
   ```
3. Click **Save** → Render auto-redeploys

---

## STEP 5: Verify Everything

1. Visit your Vercel URL
2. Check: Logo loads ✅
3. Check: Community links work (Reddit, Telegram, WhatsApp) ✅
4. Check: Navigate to `/login` → form renders ✅
5. Check: Navigate to `/feedback` → form renders ✅
6. Check: Navigate to `/community` → links point to real URLs ✅

**Note:** Login/register/feedback submissions will show errors until the API is fully seeded and running — that's expected. The static pages all work perfectly.

---

## Your URLs

| Service | URL |
|---------|-----|
| **Website** | `https://everhere-abc123.vercel.app` |
| **API** | `https://everhere-api.onrender.com` |
| **API Health** | `https://everhere-api.onrender.com/health` |
| **Admin Login** | `admin@everhere.org` / `ChangeMeImmediately123!` |

---

## Cost

| Service | Monthly Cost |
|---------|-------------|
| Vercel (frontend) | **$0** — free tier |
| Render Web Service | **$0** — 750 hrs/month free |
| Render PostgreSQL | **$0** — 90 days free, then $7/month |
| **Total** | **$0 for first 3 months** |

---

## Redeploying

**After code changes:**
```bash
git add .
git commit -m "description of change"
git push
```
- **Vercel** auto-deploys on push (1-2 minutes)
- **Render** auto-deploys on push (2-3 minutes)

---

## Custom Domain (Later)

When you have a domain like `everhere.org`:

**Vercel:**
1. Project Settings → Domains → Add `everhere.org`
2. Update DNS as instructed

**Render:**
1. Service Settings → Custom Domains → Add `api.everhere.org`
2. Update `CORS_ORIGINS` to `https://everhere.org`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update `CORS_ORIGINS` in Render with exact Vercel URL |
| "Invalid CSRF token" | Clear browser cookies, login again |
| API 500 error | Check Render Logs tab |
| Database error | Verify `DATABASE_URL` uses **Internal** URL |
| Build fails on Render | Check Node version is 20+ in build logs |
| Vercel build fails | Ensure `pnpm` is available — Vercel auto-detects it |
