#!/bin/bash
# Server Provisioning Script for Tryphene Commercial Platform
# Run this on a fresh Ubuntu 22.04/24.04 server as root

set -e

echo "=========================================="
echo " Starting Tryphene Production Setup"
echo "=========================================="

# 1. Update and Upgrade
echo "--> Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Install Docker & Docker Compose
echo "--> Installing Docker and prerequisites..."
apt-get install -y ca-certificates curl gnupg ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# 3. Configure Firewall (UFW)
echo "--> Securing Firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable

# 4. Create App Directory
echo "--> Creating deployment directories..."
mkdir -p /var/www/tryphene
chown -R $USER:$USER /var/www/tryphene

echo "=========================================="
echo " Server Provisioning Complete!"
echo "=========================================="
echo "Next steps:"
echo "1. Clone your repository into /var/www/tryphene"
echo "2. Create the .env.production file inside /var/www/tryphene"
echo "3. Run: docker-compose -f deploy/docker-compose.prod.yml up -d --build"
echo "=========================================="
