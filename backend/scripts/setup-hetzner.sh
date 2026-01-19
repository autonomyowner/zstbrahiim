#!/bin/bash
################################################################################
# ZST Backend - Automated Hetzner VPS Setup Script
#
# This script installs and configures everything needed for the ZST backend:
# - PostgreSQL 16
# - Redis 7
# - Node.js 20
# - PM2
# - Nginx
# - Certbot (SSL)
# - Firewall
# - Performance optimizations
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/YOUR_REPO/setup-hetzner.sh | bash
#   OR
#   bash setup-hetzner.sh
################################################################################

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 ZST Backend - Hetzner VPS Automated Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

echo -e "${GREEN}✓${NC} Running as root"

# Update system
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 1/10: Updating system packages..."
echo "────────────────────────────────────────────────────────────────"
apt update -qq
apt upgrade -y -qq
echo -e "${GREEN}✓${NC} System updated"

# Install basic utilities
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 2/10: Installing basic utilities..."
echo "────────────────────────────────────────────────────────────────"
apt install -y -qq curl wget git ufw htop vim unzip
echo -e "${GREEN}✓${NC} Utilities installed"

# Install PostgreSQL 16
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 3/10: Installing PostgreSQL 16..."
echo "────────────────────────────────────────────────────────────────"
apt install -y -qq postgresql-16 postgresql-contrib-16
systemctl enable postgresql
systemctl start postgresql
echo -e "${GREEN}✓${NC} PostgreSQL 16 installed and running"

# Install Redis 7
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 4/10: Installing Redis 7..."
echo "────────────────────────────────────────────────────────────────"
apt install -y -qq redis-server
systemctl enable redis-server
systemctl start redis-server
echo -e "${GREEN}✓${NC} Redis 7 installed and running"

# Install Node.js 20
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 5/10: Installing Node.js 20 LTS..."
echo "────────────────────────────────────────────────────────────────"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt install -y -qq nodejs
echo -e "${GREEN}✓${NC} Node.js $(node -v) installed"

# Install PM2
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 6/10: Installing PM2 process manager..."
echo "────────────────────────────────────────────────────────────────"
npm install -g pm2 --silent
pm2 install pm2-logrotate --silent
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
echo -e "${GREEN}✓${NC} PM2 installed with log rotation"

# Install Nginx
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 7/10: Installing Nginx..."
echo "────────────────────────────────────────────────────────────────"
apt install -y -qq nginx
systemctl enable nginx
systemctl start nginx
echo -e "${GREEN}✓${NC} Nginx installed and running"

# Install Certbot
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 8/10: Installing Certbot (SSL certificates)..."
echo "────────────────────────────────────────────────────────────────"
apt install -y -qq certbot python3-certbot-nginx
echo -e "${GREEN}✓${NC} Certbot installed"

# Configure Firewall
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 9/10: Configuring firewall (UFW)..."
echo "────────────────────────────────────────────────────────────────"
ufw --force disable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable
echo -e "${GREEN}✓${NC} Firewall configured"

# Optimize Redis
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "Step 10/10: Optimizing Redis configuration..."
echo "────────────────────────────────────────────────────────────────"
cat >> /etc/redis/redis.conf <<EOF

# ZST Backend Optimizations
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

systemctl restart redis-server
echo -e "${GREEN}✓${NC} Redis optimized"

# Create app directory
mkdir -p /var/www/zst-backend
mkdir -p /backups/postgres

# Summary
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Installation Complete!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Installed services:"
echo "  ✓ PostgreSQL 16    - Port 5432"
echo "  ✓ Redis 7          - Port 6379"
echo "  ✓ Node.js $(node -v)  - Available globally"
echo "  ✓ PM2              - Process manager"
echo "  ✓ Nginx            - Port 80/443"
echo "  ✓ Certbot          - SSL certificates"
echo "  ✓ Firewall (UFW)   - Ports 22, 80, 443 open"
echo ""
echo "Next steps:"
echo "  1. Create PostgreSQL database and user"
echo "  2. Upload your backend code to /var/www/zst-backend"
echo "  3. Configure environment variables"
echo "  4. Start your application with PM2"
echo ""
echo "App directory:     /var/www/zst-backend"
echo "Backup directory:  /backups/postgres"
echo ""
echo "════════════════════════════════════════════════════════════════"
