# Production Lockdown & Deployment Tutorial

This document serves as your permanent reference for transitioning the Tryphene Murugat Consultancy platform from a local development workspace to a hardened, live production environment on a VPS (like AWS EC2, DigitalOcean, or Hetzner).

---

## 1. The Deployment Script (`deploy/lockdown.sh`)

We have created an automated DevOps script that handles the secure configuration of your environment. When you upload your codebase to your live Linux server, you will run this script to finalize the environment.

### How to execute:
```bash
cd deploy
bash lockdown.sh
```

### What the script does:
1. **Secret Generation:** Uses cryptographic libraries (`openssl`) to instantly generate a hyper-secure `POSTGRES_PASSWORD` and a 64-character `JWT_SECRET`.
2. **CORS Hardening:** Writes a fresh `.env` file that locks down the `CORS_ORIGIN` so the API will *only* accept requests coming from your production domain (e.g., `https://tryphenemurugat.com`), immediately rejecting any external API tampering or bot attacks.
3. **Permission Lockdown:** Runs `chmod 600 .env` so that no unauthorized user on the server can read your database passwords.
4. **Clean Rebuild:** Tears down the local development containers and runs a `--no-cache` production build so that your source code is permanently baked into the Nginx and Node.js images.

---

## 2. SSL & HTTPS Configuration (Let's Encrypt)

Once the `lockdown.sh` script finishes running, your Docker containers will be securely listening on port 80. To enable HTTPS (which is required for secure logins and CORS), you must install an SSL certificate.

Run the following commands on your Ubuntu/Debian VPS:

```bash
# 1. Point your domain's DNS A-Record to your server's IP address.

# 2. Install Certbot and the Nginx plugin
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 3. Generate the SSL Certificate
sudo certbot --nginx -d tryphenemurugat.com -d www.tryphenemurugat.com
```

Certbot will automatically intercept traffic on port 80, verify your domain ownership, and upgrade your Nginx proxy to port 443 (HTTPS) with a free, auto-renewing SSL certificate.

---

## 3. Seed Data Purge

Before inviting real clients, ensure you have purged any dummy data (like test leads or dummy projects) from your database, and that your own root admin account is the only active user in the system.

You are now fully locked down and ready to manage enterprise clients!
