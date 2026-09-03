# 🚀 Deploy EVERHERE to InfinityFree

This guide walks you through deploying the static landing page to InfinityFree
at **everhere.free.je**.

---

## Architecture

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  InfinityFree (FREE)        │     │  VPS / PaaS (paid)           │
│  everhere.free.je           │     │  api.everhere.free.je        │
│                             │     │                              │
│  Static HTML/CSS/JS         │     │  Express API + PostgreSQL    │
│  Landing page + public pages│ ──► │  Auth, profiles, contributions│
│  No server-side code        │ API │  Sessions, audit logs        │
└─────────────────────────────┘     └──────────────────────────────┘
```

**What goes on InfinityFree:** The entire public-facing website — landing page,
About, How It Works, Community, Privacy, Roadmap, Feedback form, Contribute form,
Security Report form. All static files, no PHP, no Node.js.

**What needs a separate server:** The REST API (`apps/api`), PostgreSQL database,
session storage, email sending. This can run on a $5/mo VPS, Render free tier,
Fly.io, or Railway.

---

## Step 1: Build the Static Export

On your local machine:

```bash
cd apps/web

# Set the API URL for your deployed backend
# (you'll update this after deploying the API)
export NEXT_PUBLIC_API_URL=https://api.everhere.free.je/api/v1

# Build static export
npx next build
```

This creates an `out/` directory with all static files.

> **Note:** If you haven't deployed the API yet, the forms will show
> "Something went wrong" when submitted — that's expected. The static site
> itself will render perfectly.

---

## Step 2: Set Up InfinityFree Account

1. Go to [https://infinityfree.net](https://infinityfree.net)
2. Create a free account
3. Create a new hosting account:
   - **Domain:** Choose `everhere.free.je` (or your preferred free subdomain)
   - **Note your FTP credentials** — you'll need these

4. In your InfinityFree control panel:
   - Go to **File Manager** or use an FTP client
   - The web root is typically `htdocs/` or `public_html/`

---

## Step 3: Upload Static Files

### Option A: Using InfinityFree File Manager (web)

1. Log into InfinityFree control panel
2. Open **File Manager**
3. Navigate to the `htdocs/` directory
4. Delete any default files (like `index.php`)
5. Upload everything from your local `out/` directory:
   ```
   out/
   ├── index.html          (landing page)
   ├── about.html          (or about/index.html)
   ├── how-it-works.html
   ├── community.html
   ├── privacy.html
   ├── security.html
   ├── roadmap.html
   ├── feedback/
   │   └── index.html
   ├── contribute/
   │   └── index.html
   ├── security/
   │   ├── index.html
   │   └── report/
   │       └── index.html
   ├── robots.txt
   ├── sitemap.xml
   ├── .htaccess            ← IMPORTANT! Upload this
   └── _next/               ← Static assets (JS, CSS, images)
       ├── static/
       └── ...
   ```

### Option B: Using FTP Client (recommended for bulk upload)

1. Download [FileZilla](https://filezilla-project.org/) or [WinSCP](https://winscp.net/)
2. Connect with your InfinityFree FTP credentials:
   - **Host:** `ftpupload.net` (or as shown in your control panel)
   - **Username:** Your FTP username from InfinityFree
   - **Password:** Your FTP password
   - **Port:** 21
3. Navigate to `htdocs/` on the remote server
4. Drag and drop the entire contents of `out/` into `htdocs/`
5. Make sure `.htaccess` is uploaded (enable "show hidden files" in your FTP client)

### Option C: Using the Deploy Script

```bash
# Set your FTP credentials
export FTP_HOST="ftpupload.net"
export FTP_USER="your_ftp_username"
export FTP_PASS="your_ftp_password"

# Run the deploy script (requires lftp)
./deploy-infinityfree.sh
```

---

## Step 4: Verify the Deployment

1. Visit `https://everhere.free.je`
2. Check that the landing page loads correctly
3. Navigate to each section: About, How It Works, Community, Privacy, Roadmap
4. Check the forms: Feedback, Contribute, Security Report
5. Verify HTTPS is working
6. Check `https://everhere.free.je/robots.txt` and `https://everhere.free.je/sitemap.xml`

---

## Step 5: Custom Domain (Optional)

If you have a custom domain (e.g., `everhere.org`):

1. In InfinityFree control panel, go to **Subdomain/Tasks** → **Add Domain**
2. Add your custom domain
3. Update your domain's DNS records:
   - **A Record:** Point to InfinityFree's IP (shown in control panel)
   - **CNAME:** `www` → `everhere.free.je`
4. Wait for DNS propagation (up to 48 hours)
5. Update `NEXT_PUBLIC_APP_URL` in your environment and rebuild

---

## Step 6: Deploy the API (Separate Server)

The static site needs a backend API. Options:

### Free/Cheap Options:
| Provider | Cost | Notes |
|----------|------|-------|
| **Render** | Free tier | Good for MVP, cold starts |
| **Fly.io** | Free tier | Good performance |
| **Railway** | $5/mo | Easy setup |
| **Oracle Cloud** | Free forever | ARM instances, need setup |
| **Any VPS** | $5/mo | Full control |

### Quick Render Deploy:

```bash
# In the project root
cd apps/api

# Create a render.yaml for auto-deployment
cat > render.yaml << 'EOF'
services:
  - type: web
    name: everhere-api
    runtime: node
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: node dist/index.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NODE_ENV
        value: production
      - key: SESSION_SECRET
        generateValue: true
      - key: CSRF_SECRET
        generateValue: true
EOF
```

### After Deploying the API:

Update the static site's API URL:
1. Edit `apps/web/src/lib/api.ts` — the default is `http://localhost:3001/api/v1`
2. Rebuild: `NEXT_PUBLIC_API_URL=https://your-api-url/api/v1 npx next build`
3. Re-upload the `out/` directory to InfinityFree

---

## Troubleshooting

### Forms show "Something went wrong"
→ The API server isn't deployed yet or the URL is wrong. Check `NEXT_PUBLIC_API_URL`.

### Pages return 404
→ Make sure `.htaccess` is uploaded and the file structure matches Next.js output.
Check that `mod_rewrite` is enabled on InfinityFree (it usually is).

### HTTPS not working
→ InfinityFree provides free SSL. Enable it in the control panel under **SSL/TLS**.

### Slow initial load
→ InfinityFree free tier has shared resources. The static site itself is fast,
but the free hosting can be slow. Consider upgrading or moving to a CDN.

### CORS errors
→ The API must allow `https://everhere.free.je` as an origin.
Update the API's CORS configuration.

---

## File Structure on InfinityFree

```
htdocs/
├── .htaccess                    ← Security headers, caching, URL rules
├── index.html                   ← Landing page
├── robots.txt                   ← SEO
├── sitemap.xml                  ← SEO
├── 404.html                     ← Custom error page
├── about.html                   ← About page
├── community.html               ← Community page
├── contribute/
│   └── index.html               ← Application form
├── feedback/
│   └── index.html               ← Feedback form
├── how-it-works.html            ← How It Works
├── privacy.html                 ← Privacy & Security
├── roadmap.html                 ← Roadmap
├── security/
│   ├── index.html               ← Security Overview
│   └── report/
│       └── index.html           ← Security Report form
└── _next/                       ← Static assets
    ├── static/
    │   ├── css/                 ← Compiled Tailwind CSS
    │   ├── js/                  ← Bundled JavaScript
    │   └── media/               ← Fonts, images
    └── ...
```

---

## Summary

| What | Where | Cost |
|------|-------|------|
| Static website | InfinityFree | Free |
| API server | Render/Fly.io/VPS | Free–$5/mo |
| PostgreSQL | Same as API or Supabase free | Free |
| Email (transactional) | Resend free tier | Free (100/day) |
| Domain | everhere.free.je | Free |
| **Total MVP cost** | | **$0–$5/mo** |
