# EVERHERE Preview Run Doc

## Prerequisites

- Node.js ≥ 20 (installed via `winget install OpenJS.NodeJS.LTS`)
- pnpm (installed via `npm install -g pnpm`)

## How to Reproduce Uncommitted Artifacts

1. The workspace is the main checkout — no file copying needed.
2. Install dependencies:
   ```
   $env:PATH = "C:\Program Files\nodejs;C:\Users\aryan\AppData\Roaming\npm;" + $env:PATH
   cd "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)"
   pnpm install --ignore-scripts
   cd apps/api
   npx prisma generate
   ```
   Note: `--ignore-scripts` is needed because pnpm 11.x requires interactive `pnpm approve-builds` for native deps. Prisma client is generated manually afterward.

## How to Run the Server

The Next.js dev server runs from the web app directory using the local `next` binary (not a global install):

```batch
@echo off
set PATH=C:\Program Files\nodejs;C:\Users\aryan\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)\apps\web"
"C:\Program Files\nodejs\node.exe" "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)\apps\web\node_modules\next\dist\bin\next" dev -p 3000
```

Detach via PowerShell:
```powershell
Start-Process -FilePath 'cmd.exe' -ArgumentList "/c `"start-web.cmd`"" -RedirectStandardOutput <log> -RedirectStandardError <log>.err -WindowStyle Hidden -PassThru
```

URL: http://localhost:3000
