#!/bin/bash
# ═══════════════════════════════════════════════════════════
# EVERHERE — Deploy to InfinityFree via FTP
# Requires: lftp (brew install lftp / apt install lftp)
# ═══════════════════════════════════════════════════════════

set -e

# ── Configuration ─────────────────────────────────────────
FTP_HOST="${FTP_HOST:-ftpupload.net}"
FTP_USER="${FTP_USER:?Set FTP_USER environment variable}"
FTP_PASS="${FTP_PASS:?Set FTP_PASS environment variable}"
FTP_DIR="${FTP_DIR:-htdocs}"
BUILD_DIR="apps/web/out"

# ── Verify build exists ──────────────────────────────────
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory not found: $BUILD_DIR"
  echo "   Run 'cd apps/web && npx next build' first."
  exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
  echo "❌ index.html not found in $BUILD_DIR"
  echo "   The build may have failed. Check for errors."
  exit 1
fi

echo "🚀 Deploying EVERHERE to InfinityFree..."
echo "   Host: $FTP_HOST"
echo "   User: $FTP_USER"
echo "   Dir:  $FTP_DIR"
echo ""

# ── Upload via lftp ──────────────────────────────────────
lftp -c "
  set ftp:ssl-allow no
  set net:timeout 30
  open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST

  # Mirror the build directory to the remote htdocs
  mirror --reverse --delete --verbose \
    --exclude .git/ \
    --exclude .next/ \
    --exclude node_modules/ \
    $BUILD_DIR/ /$FTP_DIR/

  quit
"

echo ""
echo "✅ Deployed successfully!"
echo "   Visit: https://everhere.free.je"
echo ""
echo "📝 Next steps:"
echo "   1. Verify the site loads at https://everhere.free.je"
echo "   2. Check all pages render correctly"
echo "   3. Deploy the API server (see INFINITYFREE-DEPLOY.md)"
