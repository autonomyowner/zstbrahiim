# Deployment Guide - ZST Backend

## Production Infrastructure

Based on the architecture plan, here's the recommended production setup:

```
┌─────────────────┐
│ Cloudflare CDN  │ (Free - Edge caching)
└────────┬────────┘
         │
┌────────▼────────┐
│   Load Balancer │ (Nginx - CPX11: €5/mo)
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────┐
    │         │            │          │
┌───▼──┐  ┌──▼──┐   ┌────▼────┐  ┌──▼──┐
│ API  │  │ API │   │ Redis   │  │ Jobs│
│ CPX31│  │CPX31│   │ CPX21   │  │Queue│
└──────┘  └─────┘   └─────────┘  └─────┘
                         │
                    ┌────▼──────┐
                    │PostgreSQL │
                    │ (Supabase)│
                    └───────────┘
```

**Total Cost: ~€60/mo ($65/mo)**

---

## Server Recommendations

### Option 1: Budget-Friendly (Contabo)

| Service | Plan | Cost/mo | Purpose |
|---------|------|---------|---------|
| VPS M | 6 vCPU, 16GB RAM | €7 | API + Redis + Jobs |
| PostgreSQL | Supabase Free | $0 | Database |
| R2 | Cloudflare Free | $0 | File storage |
| **Total** | | **€7 (~$8)** | Can handle 2-5k users |

### Option 2: Production-Grade (Hetzner)

| Service | Plan | Cost/mo | Purpose |
|---------|------|---------|---------|
| API (x2) | CPX31 (4 vCPU, 8GB) | €15 each | Backend servers |
| Redis | CPX21 (3 vCPU, 4GB) | €8 | Cache + queues |
| Load Balancer | CPX11 (2 vCPU, 2GB) | €5 | Nginx |
| PostgreSQL | Supabase Pro | $25 | Database |
| R2 | Cloudflare Free | $0 | File storage |
| **Total** | | **~€60 ($65)** | Can handle 10k+ users |

---

## Pre-Deployment Checklist

### 1. Required Accounts

- [ ] **Hetzner/Contabo** account (VPS hosting)
- [ ] **Cloudflare** account (CDN + R2 storage)
- [ ] **Supabase** account (PostgreSQL) OR self-hosted DB
- [ ] **Clerk** account (Authentication - already have)
- [ ] **Domain name** (e.g., zst-app.com)

### 2. Environment Variables

Create `.env.production`:

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database (Supabase or self-hosted)
DATABASE_HOST=db.your-project.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=zst_db

# Redis (production server)
REDIS_HOST=your-redis-server.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudflare R2
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=zst-media
R2_PUBLIC_URL=https://cdn.zst-app.com

# CORS (your frontend URL)
FRONTEND_URL=https://app.zst-app.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## Step 1: Set Up Cloudflare R2

### 1.1 Create R2 Bucket

1. Log in to Cloudflare Dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create Bucket**
4. Name: `zst-media`
5. Location: Auto (closest to Algeria: Europe)

### 1.2 Configure Public Access

1. Go to bucket settings
2. Enable **Public Access** (for CDN)
3. Copy public URL: `https://pub-xxx.r2.dev/zst-media`

### 1.3 Create API Tokens

1. Navigate to **R2 > Manage R2 API Tokens**
2. Click **Create API Token**
3. Permissions: Object Read & Write
4. Copy **Access Key ID** and **Secret Access Key**

### 1.4 Set Up Custom Domain (Optional but Recommended)

1. Go to bucket settings
2. Connect custom domain: `cdn.zst-app.com`
3. Update DNS records as instructed
4. Update `R2_PUBLIC_URL` to `https://cdn.zst-app.com`

---

## Step 2: Set Up Database (Supabase)

### 2.1 Create Project

1. Log in to Supabase
2. Click **New Project**
3. Name: `zst-backend`
4. Region: **Frankfurt** (closest to Algeria)
5. Database Password: Generate strong password

### 2.2 Get Connection Details

1. Go to **Settings > Database**
2. Copy:
   - Host: `db.xxx.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: (your password)

### 2.3 Run Migrations

```bash
# Connect to Supabase
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Run TypeORM migrations
npm run typeorm:run
```

### 2.4 Create Indexes (CRITICAL for Performance)

Connect to database and run:

```sql
-- Products (most queried)
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock) WHERE in_stock = true;

-- Orders (seller dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Reel interactions
CREATE INDEX IF NOT EXISTS idx_reel_likes_reel_id ON reel_likes(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_comments_reel_id ON reel_comments(reel_id);

-- B2B
CREATE INDEX IF NOT EXISTS idx_b2b_offers_target_category ON b2b_offers(target_category);
CREATE INDEX IF NOT EXISTS idx_b2b_offers_status ON b2b_offers(status);
```

---

## Step 3: Set Up VPS (Hetzner/Contabo)

### 3.1 Create Server

**Hetzner:**
1. Go to Cloud Console
2. Create Server
3. Location: **Falkenstein, Germany** (best for Algeria)
4. Image: **Ubuntu 22.04**
5. Type: **CPX31** (or CPX21 for budget)
6. Add SSH key

**Contabo:**
1. Order VPS M
2. Location: **Germany**
3. OS: **Ubuntu 22.04**

### 3.2 Connect to Server

```bash
ssh root@your-server-ip
```

### 3.3 Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Redis
apt install -y redis-server

# Start Redis
systemctl enable redis-server
systemctl start redis-server

# Create app user
adduser --disabled-password --gecos "" zstapp
```

---

## Step 4: Deploy Backend

### 4.1 Upload Code to Server

**Option A: Git (Recommended)**
```bash
# On server
su - zstapp
git clone https://github.com/your-repo/zst-backend.git
cd zst-backend
```

**Option B: SCP**
```bash
# On local machine
scp -r backend/ zstapp@your-server-ip:/home/zstapp/zst-backend
```

### 4.2 Install Dependencies & Build

```bash
# On server as zstapp user
cd /home/zstapp/zst-backend

# Install dependencies
npm ci --production

# Build TypeScript
npm run build
```

### 4.3 Set Up Environment

```bash
# Create .env.production
nano .env.production

# Paste all production environment variables (see above)
# Save and exit (Ctrl+X, Y, Enter)
```

### 4.4 Start with PM2

```bash
# Start application
pm2 start dist/main.js --name zst-api -i max --env production

# Save PM2 config
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs zst-api

# Monitor
pm2 monit
```

---

## Step 5: Configure Nginx (Reverse Proxy)

### 5.1 Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/zst-api
```

**Paste:**
```nginx
upstream zst_backend {
    # PM2 cluster mode distributes to multiple processes
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.zst-app.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Max body size (for file uploads)
    client_max_body_size 100M;

    location / {
        proxy_pass http://zst_backend;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://zst_backend;
    }
}
```

### 5.2 Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/zst-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 6: SSL Certificate (Let's Encrypt)

### 6.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Get Certificate

```bash
sudo certbot --nginx -d api.zst-app.com

# Follow prompts:
# - Email: your@email.com
# - Agree to terms: Y
# - Share email: N (optional)
# - Redirect HTTP to HTTPS: 2 (Yes)
```

### 6.3 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renews via cron
```

---

## Step 7: Configure Cloudflare CDN

### 7.1 Add DNS Records

In Cloudflare DNS:

```
Type  | Name | Content            | Proxy
------|------|--------------------|---------
A     | api  | your-server-ip     | ✅ Proxied
CNAME | cdn  | pub-xxx.r2.dev     | ✅ Proxied
```

### 7.2 Configure Caching Rules

1. Go to **Caching > Configuration**
2. Create rule:
   - Name: "Cache API GET requests"
   - If: `Hostname equals api.zst-app.com AND HTTP Method equals GET`
   - Then: Cache Everything, Edge TTL: 1 minute

---

## Step 8: Monitoring & Logging

### 8.1 PM2 Monitoring

```bash
# View logs
pm2 logs zst-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart zst-api

# View process info
pm2 info zst-api
```

### 8.2 Set Up Alerts (Optional)

**Using PM2 Plus (Free tier):**
```bash
pm2 link your-secret-key your-public-key
```

### 8.3 Log Rotation

```bash
# Install logrotate for PM2
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Step 9: Database Backups

### 9.1 Automated Backups (Supabase)

Supabase Pro includes daily backups. To manually backup:

```bash
# Create backup script
nano /home/zstapp/backup.sh
```

**Script:**
```bash
#!/bin/bash
BACKUP_DIR="/home/zstapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > "$BACKUP_DIR/zst_db_$DATE.sql"

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /home/zstapp/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add line:
0 2 * * * /home/zstapp/backup.sh
```

---

## Step 10: Final Verification

### 10.1 Test Endpoints

```bash
# Health check
curl https://api.zst-app.com/health

# Get products
curl https://api.zst-app.com/api/v1/products

# Swagger UI
open https://api.zst-app.com/api
```

### 10.2 Test WebSocket

```javascript
const io = require('socket.io-client');
const socket = io('https://api.zst-app.com/realtime');

socket.on('connect', () => {
  console.log('✅ WebSocket connected');
});
```

### 10.3 Load Test

```bash
# Run k6 load test
k6 run --vus 1000 --duration 1m load-test.js
```

---

## Deployment Checklist

Before going live:

### Configuration
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Indexes created
- [ ] SSL certificate installed
- [ ] CORS configured for your domain
- [ ] R2 bucket created and accessible

### Security
- [ ] Firewall configured (UFW)
- [ ] SSH key-only authentication
- [ ] Fail2ban installed
- [ ] Rate limiting enabled
- [ ] Secrets not in code

### Performance
- [ ] PM2 cluster mode enabled
- [ ] Nginx caching configured
- [ ] Redis configured
- [ ] Database queries optimized
- [ ] CDN enabled

### Monitoring
- [ ] PM2 logs configured
- [ ] Error tracking set up (Sentry optional)
- [ ] Database backups scheduled
- [ ] Health checks working
- [ ] Alerts configured

---

## Maintenance

### Daily Tasks
- Check PM2 logs for errors
- Monitor server resources (CPU, RAM, disk)
- Verify Redis is running

### Weekly Tasks
- Review Cloudflare analytics
- Check database performance
- Review error logs
- Test backups

### Monthly Tasks
- Update dependencies (`npm update`)
- Review security advisories
- Optimize database (VACUUM, ANALYZE)
- Review and optimize slow queries

---

## Scaling Strategy

### Phase 1: Single Server (0-2k users)
- 1x API server (CPX31)
- Supabase Free
- Cloudflare CDN

**Cost:** ~€15/mo

### Phase 2: Horizontal Scaling (2k-5k users)
- 2x API servers behind load balancer
- Separate Redis server
- Supabase Pro

**Cost:** ~€60/mo

### Phase 3: High Availability (5k-20k users)
- 3x API servers across regions
- Redis Cluster (3 nodes)
- Database read replicas
- Advanced monitoring

**Cost:** ~€200/mo

---

## Rollback Plan

If deployment fails:

```bash
# Stop new version
pm2 stop zst-api

# Checkout previous version
git checkout <previous-commit-hash>

# Reinstall dependencies
npm ci --production

# Rebuild
npm run build

# Restart
pm2 restart zst-api

# Verify
curl https://api.zst-app.com/health
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs zst-api --lines 100

# Check if port 3000 is available
netstat -tulpn | grep 3000

# Check environment variables
pm2 env 0
```

### Database connection fails
```bash
# Test connection
psql -h db.xxx.supabase.co -U postgres -d postgres

# Check firewall
sudo ufw status

# Check .env.production
cat .env.production | grep DATABASE
```

### Redis not working
```bash
# Check Redis status
systemctl status redis-server

# Test connection
redis-cli ping

# Check logs
tail -f /var/log/redis/redis-server.log
```

### High memory usage
```bash
# Check PM2 processes
pm2 list

# Restart app
pm2 restart zst-api

# If persistent, reduce cluster instances
pm2 delete zst-api
pm2 start dist/main.js --name zst-api -i 2
```

---

## Support Resources

- **NestJS Docs:** https://docs.nestjs.com/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **Nginx Docs:** https://nginx.org/en/docs/
- **Supabase Docs:** https://supabase.com/docs
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** https://api.zst-app.com
**Status:** ⬜ Deployed ⬜ Verified ⬜ Live

---

Good luck with your deployment! 🚀
