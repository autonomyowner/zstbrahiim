# 🚀 Deployment Guide - ZST Backend

> Step-by-step guide to deploy on budget VPS (Contabo/DigitalOcean)

---

## 📋 Prerequisites

Before deploying, you need:

1. ✅ A VPS server (Contabo, DigitalOcean, Hetzner)
2. ✅ Domain name (optional but recommended)
3. ✅ Clerk account (free tier)
4. ✅ Cloudflare account for R2 storage

---

## 💰 Recommended Setup

### Budget Option: Contabo VPS M ($8/mo)
- 4 vCPU cores
- 6GB RAM
- 400GB SSD
- 32TB bandwidth

**Perfect for:** 0-2k concurrent users

### Premium Option: DigitalOcean ($48/mo)
- 4 vCPU cores
- 8GB RAM
- 160GB SSD

**Perfect for:** 2k-5k concurrent users

---

## 🎯 Step 1: Server Setup

### SSH into Your VPS

```bash
ssh root@your-server-ip
```

### Update System

```bash
apt update && apt upgrade -y
```

### Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Start Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker-compose --version
```

### Install Node.js (Optional - for manual deployment)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

---

## 🎯 Step 2: Clone Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/your-org/zst-backend.git
cd zst-backend/backend

# Or upload via SCP
# scp -r backend/ root@your-server-ip:/var/www/zst-backend
```

---

## 🎯 Step 3: Configure Environment

### Create Production .env File

```bash
nano .env
```

Paste your configuration:

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.zst.com
FRONTEND_URL=https://zst.com

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=zst_user
DATABASE_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DATABASE_NAME=zst_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_BUCKET_NAME=zst-media
R2_PUBLIC_URL=https://cdn.zst.com

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your_expo_token
```

**IMPORTANT:** Use strong passwords! Generate with:

```bash
openssl rand -base64 32
```

---

## 🎯 Step 4: Setup Cloudflare R2 Storage

### 1. Create R2 Bucket

Go to Cloudflare Dashboard → R2:

1. Click "Create Bucket"
2. Name: `zst-media`
3. Location: Automatic
4. Click "Create Bucket"

### 2. Get R2 Credentials

1. Go to R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Name: `zst-backend`
4. Permissions: Object Read & Write
5. Copy:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

### 3. Setup Custom Domain (Optional)

1. R2 Settings → Public Access
2. Connect custom domain: `cdn.zst.com`
3. Update `R2_PUBLIC_URL` in `.env`

---

## 🎯 Step 5: Setup Clerk Authentication

### 1. Create Clerk Application

Go to [Clerk Dashboard](https://dashboard.clerk.com):

1. Click "Create Application"
2. Name: `ZST Marketplace`
3. Select authentication methods:
   - Email & Password ✓
   - Google OAuth ✓
4. Create Application

### 2. Get Clerk Keys

Copy from Clerk Dashboard:
- Publishable Key → `CLERK_PUBLISHABLE_KEY`
- Secret Key → `CLERK_SECRET_KEY`

### 3. Setup Webhook

1. Clerk Dashboard → Webhooks
2. Add endpoint: `https://api.zst.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy Webhook Secret → `CLERK_WEBHOOK_SECRET`

---

## 🎯 Step 6: Deploy with Docker

### Start Production Services

```bash
# Make sure you're in the backend directory
cd /var/www/zst-backend/backend

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Services Running

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- API: `localhost:3000`
- Nginx: `localhost:80` and `localhost:443`

### Verify Deployment

```bash
# Test API health
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## 🎯 Step 7: Setup Nginx (Reverse Proxy)

### Create Nginx Config

```bash
mkdir -p nginx
nano nginx/nginx.conf
```

Paste this configuration:

```nginx
events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Upstream backend
    upstream api_backend {
        server api:3000;
        keepalive 32;
    }

    # HTTP Server (redirect to HTTPS)
    server {
        listen 80;
        server_name api.zst.com;

        # Let's Encrypt validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name api.zst.com;

        # SSL certificates (will be generated)
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # API endpoints
        location /api {
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket for Socket.io
        location /socket.io {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            proxy_pass http://api_backend;
            access_log off;
        }
    }
}
```

---

## 🎯 Step 8: Setup SSL Certificate (Let's Encrypt)

### Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
certbot certonly --standalone -d api.zst.com

# Certificate will be saved to:
# /etc/letsencrypt/live/api.zst.com/fullchain.pem
# /etc/letsencrypt/live/api.zst.com/privkey.pem

# Copy to nginx directory
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/api.zst.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/api.zst.com/privkey.pem nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Add cron job for auto-renewal
crontab -e

# Add this line:
0 0 * * * certbot renew --quiet && cp /etc/letsencrypt/live/api.zst.com/*.pem /var/www/zst-backend/backend/nginx/ssl/ && docker-compose -f /var/www/zst-backend/backend/docker-compose.prod.yml restart nginx
```

---

## 🎯 Step 9: Database Migration

### Run Migrations

```bash
# Enter API container
docker exec -it zst-api-prod sh

# Run migrations
npm run migration:run

# Exit container
exit
```

---

## 🎯 Step 10: Setup Firewall

### Configure UFW (Ubuntu Firewall)

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## 🎯 Step 11: Monitoring & Logging

### View Logs

```bash
# API logs
docker logs -f zst-api-prod

# All services logs
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker logs --tail 100 zst-api-prod
```

### Monitor Resources

```bash
# Docker stats
docker stats

# System resources
htop
```

---

## 🎯 Step 12: Backup Strategy

### Database Backups

Create backup script:

```bash
nano /root/backup-db.sh
```

Paste:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups
DB_NAME=zst_db

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker exec zst-postgres-prod pg_dump -U zst_user $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

Make executable:

```bash
chmod +x /root/backup-db.sh
```

Add to cron (daily at 2 AM):

```bash
crontab -e

# Add:
0 2 * * * /root/backup-db.sh >> /var/log/backup.log 2>&1
```

### Upload Backups to R2

```bash
# Install AWS CLI (compatible with R2)
apt install -y awscli

# Configure
aws configure

# Upload backup
aws s3 cp /backups/db_latest.sql.gz s3://zst-backups/ --endpoint-url=$R2_ENDPOINT
```

---

## 🎯 Step 13: Update & Maintenance

### Update Code

```bash
cd /var/www/zst-backend/backend

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run new migrations
docker exec -it zst-api-prod npm run migration:run
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

---

## 🎯 Step 14: Verify Deployment

### Health Check

```bash
curl https://api.zst.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345
}
```

### Test API Endpoints

```bash
# Get API info
curl https://api.zst.com/api

# Test products endpoint (requires auth)
curl https://api.zst.com/api/products \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Test WebSocket

Use a WebSocket client or your frontend app to test Socket.io connection:

```
wss://api.zst.com/socket.io
```

---

## 🐛 Troubleshooting

### API Won't Start

```bash
# Check logs
docker logs zst-api-prod

# Common issues:
# 1. Database connection failed → Check DATABASE_HOST in .env
# 2. Redis connection failed → Check REDIS_HOST in .env
# 3. Port already in use → Change PORT in .env
```

### 502 Bad Gateway

```bash
# Check if API is running
docker ps | grep api

# Check nginx logs
docker logs zst-nginx

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificate manually
certbot renew

# Copy new certificates
cp /etc/letsencrypt/live/api.zst.com/*.pem /var/www/zst-backend/backend/nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### High Memory Usage

```bash
# Check which container is using memory
docker stats

# Restart high-memory container
docker-compose -f docker-compose.prod.yml restart api
```

---

## 📈 Scaling Up

### When to Scale

Scale when you experience:
- API response time > 500ms
- CPU usage > 80%
- RAM usage > 90%
- More than 2k concurrent users

### Horizontal Scaling (Add More Servers)

1. Deploy second API server on new VPS
2. Update Nginx to load balance:

```nginx
upstream api_backend {
    server api-1.internal:3000;
    server api-2.internal:3000;
}
```

### Vertical Scaling (Upgrade VPS)

Contabo upgrade path:
- VPS M (6GB) → VPS L (16GB) - €14/mo
- VPS L (16GB) → VPS XL (24GB) - €20/mo

---

## 📊 Performance Monitoring

### Setup Grafana (Optional)

```bash
# Add Grafana to docker-compose.prod.yml
# Then access: http://your-server-ip:3001
```

### Key Metrics to Monitor

- API response time (p95, p99)
- Database query duration
- Redis hit rate
- Memory usage
- CPU usage
- Disk I/O

---

## ✅ Post-Deployment Checklist

- [ ] API health check returns 200 OK
- [ ] HTTPS certificate valid
- [ ] Database migrations applied
- [ ] Redis caching working
- [ ] Clerk authentication working
- [ ] R2 file uploads working
- [ ] Socket.io connections working
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] Domain DNS pointing to VPS
- [ ] Frontend env updated with API_URL

---

## 🎉 Success!

Your ZST backend is now deployed and ready for production!

**API URL:** https://api.zst.com
**Swagger Docs:** https://api.zst.com/api/docs (if enabled)

---

## 📚 Additional Resources

- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [PostgreSQL Tuning](https://pgtune.leopard.in.ua/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Need help? Open an issue on GitHub or contact support@zst.com**
