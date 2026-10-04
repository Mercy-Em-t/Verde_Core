#!/bin/bash
# Tryphene Murugat Consultancy - Production Lockdown & Deployment Script
# Run this on your live VPS (Ubuntu/Debian) to lock down the environment.

echo "=========================================================="
echo "  TRYPHENE ENTERPRISE PLATFORM - PRODUCTION LOCKDOWN"
echo "=========================================================="

echo "[1/4] Generating Cryptographically Secure Secrets..."
# Generate secure random strings for passwords and JWT signing
JWT_SECRET=$(openssl rand -hex 64)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 24)

echo "[2/4] Writing Production .env File..."
# Create the secure .env file
cat <<EOF > .env
# Production Secrets (Generated on $(date))
NODE_ENV=production
WEB_PORT=80
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}

# CORS Hardening (Replace with your actual domain when pointing DNS)
CORS_ORIGIN=https://tryphenemurugat.com
EOF

chmod 600 .env
echo "  -> .env secured and permissions locked (600)."

echo "[3/4] Rebuilding Docker Containers in Production Mode..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "[4/4] Next Steps for HTTPS / SSL Installation:"
echo "----------------------------------------------------------"
echo "Your platform is now locked down and running securely on port 80."
echo ""
echo "To enable HTTPS (Required for CORS and secure logins):"
echo "1. Point your domain (tryphenemurugat.com) to this server's IP."
echo "2. Run: sudo apt install certbot python3-certbot-nginx"
echo "3. Run: sudo certbot --nginx -d tryphenemurugat.com"
echo "=========================================================="
echo "LOCKDOWN COMPLETE."
