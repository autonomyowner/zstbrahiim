# 🚀 ZST Backend - Complete Hetzner VPS Deployment Guide

**Total Time**: 1-2 hours
**Cost**: €14.75/mo (~$16/mo)
**Server**: All-in-one (PostgreSQL + Redis + NestJS on one VPS)

---

## 📋 Prerequisites

Before starting, prepare:

- [ ] Credit card or PayPal for Hetzner
- [ ] Domain name (optional, can use IP initially)
- [ ] Clerk account (https://clerk.com) - Free
- [ ] Cloudflare account (https://cloudflare.com) - Free
- [ ] SSH client (Terminal on Mac/Linux, Git Bash/PuTTY on Windows)

---

## Part 1: Create Hetzner Server (10 minutes)

### Step 1: Create Hetzner Account

1. Go to https://console.hetzner.cloud
2. Click **"Sign Up"**
3. Fill in details and verify email
4. Add payment method (credit card or PayPal)

### Step 2: Create SSH Key (Important!)

**On Windows (Git Bash):**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter 3 times (default location, no passphrase)
cat ~/.ssh/id_ed25519.pub
# Copy the output (starts with ssh-ed25519)
```

**On Mac/Linux:**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter 3 times
cat ~/.ssh/id_ed25519.pub
# Copy the output
```

### Step 3: Create Server

1. In Hetzner Console, click **"New Project"**
2. Name it: `ZST Backend`
3. Click **"Add Server"**
4. Configure server:

   **Location:**
   - Select: `Falkenstein, Germany` (best for Algeria)

   **Image:**
   - Select: `Ubuntu 22.04`

   **Type:**
   - Select: `Shared vCPU` → `CPX31`
   - Cost: €14.75/mo
   - Specs: 4 vCPU, 8GB RAM, 160GB SSD

   **Networking:**
   - Keep defaults (IPv4 + IPv6)

   **SSH Keys:**
   - Click **"Add SSH Key"**
   - Paste your public key from Step 2
   - Name it: `My Laptop`

   **Server Name:**
   - Name: `zst-api-prod`

5. Click **"Create & Buy"**

### Step 4: Wait for Server Creation

- Takes ~1-2 minutes
- You'll see the server IP address once ready
- Copy the IP address (e.g., `95.217.123.456`)

---

## Part 2: Connect to Server (5 minutes)

### Step 1: SSH into Server

```bash
ssh root@YOUR_SERVER_IP
# Example: ssh root@95.217.123.456
```

- First time: Type `yes` to accept fingerprint
- You should see: `root@zst-api-prod:~#`

### Step 2: Upload Setup Scripts

**Option A: Direct Upload (Recommended)**

On your local machine:
```bash
cd "D:\zst cutsom backend\backend\scripts"

# Upload all scripts
scp setup-hetzner.sh root@YOUR_SERVER_IP:/root/
scp setup-database.sh root@YOUR_SERVER_IP:/root/
scp backup-database.sh root@YOUR_SERVER_IP:/root/
scp nginx-config-template.conf root@YOUR_SERVER_IP:/root/
scp postgresql-optimization.conf root@YOUR_SERVER_IP:/root/
```

**Option B: Create Scripts Manually**

Copy the content from each script file and paste into the server:
```bash
nano /root/setup-hetzner.sh
# Paste content, save with Ctrl+X, Y, Enter
```

---

## Part 3: Run Automated Setup (15 minutes)

### Step 1: Make Scripts Executable

```bash
chmod +x /root/setup-hetzner.sh
chmod +x /root/setup-database.sh
chmod +x /root/backup-database.sh
```

### Step 2: Run Main Setup Script

```bash
bash /root/setup-hetzner.sh
```

This installs:
- ✅ PostgreSQL 16
- ✅ Redis 7
- ✅ Node.js 20
- ✅ PM2
- ✅ Nginx
- ✅ Certbot
- ✅ Firewall

**Wait time**: ~5-10 minutes

### Step 3: Set Up Database

```bash
bash /root/setup-database.sh
```

- You'll be prompted for a password
- **Choose a strong password** (at least 16 characters)
- Example: `ZST2024!Secure#DB$Password`
- Confirm the password

The script will:
- ✅ Create database `zst_db`
- ✅ Create user `zst_user`
- ✅ Save credentials to `/root/.zst-db-credentials`

### Step 4: Optimize PostgreSQL

```bash
# Append optimization settings to PostgreSQL config
cat /root/postgresql-optimization.conf >> /etc/postgresql/16/main/postgresql.conf

# Restart PostgreSQL
systemctl restart postgresql

# Verify it's running
systemctl status postgresql
# Press 'q' to exit
```

### Step 5: Verify All Services

```bash
# Check PostgreSQL
systemctl status postgresql

# Check Redis
systemctl status redis-server

# Check Nginx
systemctl status nginx

# All should show "active (running)" in green
```

---

## Part 4: Upload Backend Code (10 minutes)

### Step 1: Upload Code to Server

**Option A: Using Git (Recommended if code is on GitHub)**

```bash
cd /var/www/zst-backend
git clone https://github.com/YOUR_USERNAME/zst-backend.git .
```

**Option B: Using SCP (Upload from local machine)**

On your local machine:
```bash
cd "D:\zst cutsom backend\backend"

# Create tarball
tar -czf backend.tar.gz .

# Upload to server
scp backend.tar.gz root@YOUR_SERVER_IP:/var/www/zst-backend/

# Back on server, extract
ssh root@YOUR_SERVER_IP
cd /var/www/zst-backend
tar -xzf backend.tar.gz
rm backend.tar.gz
```

**Option C: Using SFTP Client (FileZilla, WinSCP)**

1. Download FileZilla: https://filezilla-project.org/
2. Connect to server:
   - Host: `sftp://YOUR_SERVER_IP`
   - Username: `root`
   - Port: `22`
   - Use your SSH key
3. Upload entire `backend` folder to `/var/www/zst-backend/`

### Step 2: Install Dependencies

```bash
cd /var/www/zst-backend

# Install production dependencies only
npm ci --production

# This takes ~2-3 minutes
```

### Step 3: Build TypeScript

```bash
npm run build

# This creates the 'dist' folder with compiled JavaScript
```

---

## Part 5: Configure Environment Variables (10 minutes)

### Step 1: Create Production .env File

```bash
cd /var/www/zst-backend
nano .env.production
```

### Step 2: Paste This Template

```env
# Node Environment
NODE_ENV=production
PORT=3000

# Database (from /root/.zst-db-credentials)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=zst_user
DATABASE_PASSWORD=YOUR_PASSWORD_FROM_STEP3
DATABASE_NAME=zst_db

# Redis (local)
REDIS_HOST=localhost
REDIS_PORT=6379

# Clerk Authentication (get from https://dashboard.clerk.com)
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Cloudflare R2 (get from https://dash.cloudflare.com)
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=zst-media
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Frontend URL (your website)
FRONTEND_URL=https://zst-app.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Step 3: Fill in Missing Values

**Get Database Password:**
```bash
cat /root/.zst-db-credentials
# Copy the DATABASE_PASSWORD value
```

**Get Clerk Keys:**
1. Go to https://dashboard.clerk.com
2. Create new application or select existing
3. Go to **API Keys**
4. Copy:
   - `Publishable key` → `CLERK_PUBLISHABLE_KEY`
   - `Secret key` → `CLERK_SECRET_KEY`
5. Go to **Webhooks** → Create endpoint → Copy signing secret → `CLERK_WEBHOOK_SECRET`

**Get Cloudflare R2 Keys:**
1. Go to https://dash.cloudflare.com
2. Navigate to **R2** → **Create bucket**
3. Name: `zst-media`
4. Click **Create**
5. Go to **Manage R2 API Tokens** → **Create API Token**
6. Permissions: **Object Read & Write**
7. Copy:
   - `Access Key ID` → `R2_ACCESS_KEY_ID`
   - `Secret Access Key` → `R2_SECRET_ACCESS_KEY`
8. Get account ID from R2 dashboard URL: `dash.cloudflare.com/<ACCOUNT_ID>/r2`
9. Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
10. Public URL: Find in bucket settings or use default `https://pub-xxxxx.r2.dev`

**Save the file:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

---

## Part 6: Run Database Migrations (5 minutes)

```bash
cd /var/www/zst-backend

# Set environment for migrations
export $(cat .env.production | xargs)

# Run migrations
npm run migration:run

# You should see:
# ✓ Migration CreateUsersTable has been executed successfully
# ✓ Migration CreateProductsTable has been executed successfully
# ... etc
```

---

## Part 7: Start Backend with PM2 (5 minutes)

### Step 1: Start Application

```bash
cd /var/www/zst-backend

# Start with PM2 in cluster mode (4 workers = 4 CPU cores)
pm2 start dist/main.js \
  --name zst-api \
  -i 4 \
  --env production \
  --env-file .env.production

# You should see:
# ┌─────┬────────────┬─────────┬─────────┬─────────┬──────────┐
# │ id  │ name       │ mode    │ status  │ cpu     │ memory   │
# ├─────┼────────────┼─────────┼─────────┼─────────┼──────────┤
# │ 0   │ zst-api    │ cluster │ online  │ 0%      │ 45.2mb   │
# │ 1   │ zst-api    │ cluster │ online  │ 0%      │ 43.8mb   │
# │ 2   │ zst-api    │ cluster │ online  │ 0%      │ 44.1mb   │
# │ 3   │ zst-api    │ cluster │ online  │ 0%      │ 44.5mb   │
# └─────┴────────────┴─────────┴─────────┴─────────┴──────────┘
```

### Step 2: Save PM2 Configuration

```bash
# Save current PM2 processes
pm2 save

# Configure PM2 to start on boot
pm2 startup

# This will output a command like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Copy and run that command
```

### Step 3: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs zst-api --lines 50

# You should see:
# ╔═══════════════════════════════════════╗
# ║   🚀 ZST Backend API Server           ║
# ║   Environment: production             ║
# ║   Port:        3000                   ║
# ╚═══════════════════════════════════════╝

# Test locally
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

---

## Part 8: Configure Nginx (10 minutes)

### Step 1: Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/zst-api
```

Paste the content from `nginx-config-template.conf` (I created this earlier).

**⚠️ IMPORTANT:** Change `server_name api.zst-app.com;` to your actual domain!

If you don't have a domain yet, use your server IP:
```nginx
server_name YOUR_SERVER_IP;
```

### Step 2: Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/zst-api /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Should output:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
systemctl reload nginx
```

### Step 3: Test API via Nginx

```bash
# From server
curl http://localhost/health

# From your computer
curl http://YOUR_SERVER_IP/health

# Both should return: {"status":"ok"}
```

---

## Part 9: Set Up SSL Certificate (5 minutes)

### If You Have a Domain:

**First, point your domain to the server:**
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add A record:
   - Name: `api` (or `@` for root domain)
   - Value: `YOUR_SERVER_IP`
   - TTL: 300
3. Wait 5-10 minutes for DNS propagation

**Then install SSL:**
```bash
# Install certificate
certbot --nginx -d api.yourdomain.com

# Follow prompts:
# Email: your@email.com
# Agree to terms: Y
# Redirect HTTP to HTTPS: 2 (recommended)

# Certificate will auto-renew every 90 days
```

### If You Don't Have a Domain Yet:

You can use HTTP for now and add SSL later when you get a domain.

---

## Part 10: Set Up Automated Backups (5 minutes)

```bash
# Copy backup script to system bin
cp /root/backup-database.sh /usr/local/bin/
chmod +x /usr/local/bin/backup-database.sh

# Test backup manually
/usr/local/bin/backup-database.sh

# You should see backup created in /backups/postgres/

# Schedule daily backups at 2 AM
crontab -e

# Select editor (nano = 1)
# Add this line at the bottom:
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/db-backup.log 2>&1

# Save and exit
```

---

## Part 11: Final Verification (5 minutes)

### Check All Services

```bash
# System status
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
pm2 status

# All should be green/online
```

### Test API Endpoints

```bash
# Health check
curl https://api.yourdomain.com/health

# API info
curl https://api.yourdomain.com/

# Swagger docs (in browser)
open https://api.yourdomain.com/api/docs
```

### Check Logs

```bash
# PM2 logs
pm2 logs zst-api

# Nginx logs
tail -f /var/log/nginx/zst-api-access.log
tail -f /var/log/nginx/zst-api-error.log

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## ✅ Deployment Complete!

### Your Setup:

```
Server:     Hetzner CPX31 (€14.75/mo)
Database:   PostgreSQL 16 (on server)
Cache:      Redis 7 (on server)
API:        NestJS + PM2 cluster (4 workers)
Proxy:      Nginx with SSL
Backups:    Daily at 2 AM
```

### API URLs:

- **Production**: `https://api.yourdomain.com`
- **Health Check**: `https://api.yourdomain.com/health`
- **Swagger Docs**: `https://api.yourdomain.com/api/docs`

### Useful Commands:

```bash
# Restart API
pm2 restart zst-api

# View logs
pm2 logs zst-api

# Monitor resources
pm2 monit

# Database backup
/usr/local/bin/backup-database.sh

# Restart PostgreSQL
systemctl restart postgresql

# Restart Redis
systemctl restart redis-server

# Reload Nginx
systemctl reload nginx

# View all services
pm2 status && systemctl status postgresql redis-server nginx
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
pm2 logs zst-api --lines 100
# Check for errors in environment variables or database connection
```

### Can't connect to database
```bash
# Test connection
psql -U zst_user -d zst_db -h localhost

# Check credentials
cat /root/.zst-db-credentials
```

### Nginx errors
```bash
# Test config
nginx -t

# Check error log
tail -f /var/log/nginx/zst-api-error.log
```

### Out of memory
```bash
# Check memory usage
free -h

# Reduce PM2 workers
pm2 delete zst-api
pm2 start dist/main.js --name zst-api -i 2
```

---

## 📞 Need Help?

If you encounter issues:
1. Check logs first (PM2, Nginx, PostgreSQL)
2. Verify all environment variables are set
3. Ensure all services are running
4. Test database connection separately
5. Ask for help with specific error messages

---

**🎉 Congratulations! Your backend is now live!**
