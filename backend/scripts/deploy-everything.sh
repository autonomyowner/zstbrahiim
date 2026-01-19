#!/bin/bash
################################################################################
# ZST Backend - COMPLETE AUTOMATED DEPLOYMENT SCRIPT
#
# This script does EVERYTHING automatically:
# ✅ System updates
# ✅ Install all dependencies (PostgreSQL, Redis, Node.js, PM2, Nginx, Certbot)
# ✅ Configure firewall
# ✅ Set up database
# ✅ Optimize PostgreSQL
# ✅ Configure Redis
# ✅ Set up directories
#
# Usage: bash deploy-everything.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Clear screen
clear

echo "════════════════════════════════════════════════════════════════════"
echo "  🚀 ZST Backend - Complete Automated Deployment"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}This will take approximately 15-20 minutes${NC}"
echo -e "${YELLOW}You can grab a coffee while it works! ☕${NC}"
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Prompt for database password
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Please enter a strong password for the PostgreSQL database:${NC}"
echo -e "${YELLOW}(At least 16 characters, mix of letters, numbers, symbols)${NC}"
read -s DB_PASSWORD
echo ""
echo -e "${YELLOW}Confirm password:${NC}"
read -s DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Passwords do not match!${NC}"
    exit 1
fi

if [ ${#DB_PASSWORD} -lt 12 ]; then
    echo -e "${RED}❌ Password must be at least 12 characters!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Password accepted${NC}"
echo ""

# Start deployment
TOTAL_STEPS=12
CURRENT_STEP=0

function print_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[$CURRENT_STEP/$TOTAL_STEPS] $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Step 1: Update system
print_step "Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt update -qq > /dev/null 2>&1
apt upgrade -y -qq > /dev/null 2>&1
echo -e "${GREEN}✓ System updated${NC}"

# Step 2: Install basic utilities
print_step "Installing basic utilities..."
apt install -y -qq curl wget git ufw htop vim unzip software-properties-common > /dev/null 2>&1
echo -e "${GREEN}✓ Utilities installed${NC}"

# Step 3: Install PostgreSQL 16
print_step "Installing PostgreSQL 16..."
apt install -y -qq postgresql-16 postgresql-contrib-16 > /dev/null 2>&1
systemctl enable postgresql > /dev/null 2>&1
systemctl start postgresql
echo -e "${GREEN}✓ PostgreSQL 16 installed${NC}"

# Step 4: Install Redis 7
print_step "Installing Redis 7..."
apt install -y -qq redis-server > /dev/null 2>&1
systemctl enable redis-server > /dev/null 2>&1
systemctl start redis-server
echo -e "${GREEN}✓ Redis 7 installed${NC}"

# Step 5: Install Node.js 20
print_step "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt install -y -qq nodejs > /dev/null 2>&1
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

# Step 6: Install PM2
print_step "Installing PM2 process manager..."
npm install -g pm2 --silent > /dev/null 2>&1
pm2 install pm2-logrotate --silent > /dev/null 2>&1
pm2 set pm2-logrotate:max_size 10M > /dev/null 2>&1
pm2 set pm2-logrotate:retain 7 > /dev/null 2>&1
echo -e "${GREEN}✓ PM2 installed with log rotation${NC}"

# Step 7: Install Nginx
print_step "Installing Nginx..."
apt install -y -qq nginx > /dev/null 2>&1
systemctl enable nginx > /dev/null 2>&1
systemctl start nginx
echo -e "${GREEN}✓ Nginx installed${NC}"

# Step 8: Install Certbot
print_step "Installing Certbot (SSL certificates)..."
apt install -y -qq certbot python3-certbot-nginx > /dev/null 2>&1
echo -e "${GREEN}✓ Certbot installed${NC}"

# Step 9: Configure Firewall
print_step "Configuring firewall..."
ufw --force disable > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo -e "${GREEN}✓ Firewall configured (ports 22, 80, 443)${NC}"

# Step 10: Configure Redis
print_step "Optimizing Redis configuration..."
cat >> /etc/redis/redis.conf <<EOF

# ZST Backend Optimizations
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF
systemctl restart redis-server
echo -e "${GREEN}✓ Redis optimized${NC}"

# Step 11: Create database
print_step "Creating PostgreSQL database..."
sudo -u postgres psql <<EOF > /dev/null 2>&1
CREATE USER zst_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE zst_db OWNER zst_user;
GRANT ALL PRIVILEGES ON DATABASE zst_db TO zst_user;
\c zst_db
GRANT ALL ON SCHEMA public TO zst_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zst_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO zst_user;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF
echo -e "${GREEN}✓ Database 'zst_db' created${NC}"

# Step 12: Optimize PostgreSQL
print_step "Optimizing PostgreSQL for 4GB RAM server..."

# Calculate optimal settings for CPX22 (4GB RAM)
cat >> /etc/postgresql/16/main/postgresql.conf <<EOF

# ZST Backend Optimizations (CPX22 - 4GB RAM)
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 20MB
maintenance_work_mem = 256MB
max_connections = 100
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 2GB
min_wal_size = 512MB
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 3
max_parallel_workers_per_gather = 2
max_parallel_workers = 3
log_min_duration_statement = 1000
autovacuum = on
autovacuum_max_workers = 2
EOF

systemctl restart postgresql
echo -e "${GREEN}✓ PostgreSQL optimized${NC}"

# Create directories
mkdir -p /var/www/zst-backend
mkdir -p /backups/postgres

# Save credentials
cat > /root/.zst-db-credentials <<EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=zst_user
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=zst_db
EOF
chmod 600 /root/.zst-db-credentials

# Summary
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Installation Complete!${NC}"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "Installed services:"
echo -e "  ${GREEN}✓${NC} PostgreSQL 16    - Port 5432"
echo -e "  ${GREEN}✓${NC} Redis 7          - Port 6379"
echo -e "  ${GREEN}✓${NC} Node.js $(node -v)  - Available globally"
echo -e "  ${GREEN}✓${NC} PM2              - Process manager"
echo -e "  ${GREEN}✓${NC} Nginx            - Port 80/443"
echo -e "  ${GREEN}✓${NC} Certbot          - SSL certificates"
echo -e "  ${GREEN}✓${NC} Firewall (UFW)   - Ports 22, 80, 443 open"
echo ""
echo "Database details:"
echo "  Database: zst_db"
echo "  User:     zst_user"
echo "  Host:     localhost"
echo "  Port:     5432"
echo ""
echo "Credentials saved to: /root/.zst-db-credentials"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Upload your backend code to /var/www/zst-backend"
echo "  2. Configure environment variables"
echo "  3. Build and start your application"
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🎉 Server is ready for deployment!${NC}"
echo ""
