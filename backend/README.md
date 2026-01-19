# ZST Marketplace Backend API

> Custom NestJS backend for ZST B2B/B2C Marketplace with real-time features

## 📖 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete REST API reference with examples
- **[Testing Guide](./TESTING_GUIDE.md)** - How to test all features & load testing
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment on VPS

## 🎯 Overview

This is a production-ready backend built with NestJS that powers the ZST marketplace mobile application. It provides:

- ✅ **B2B/B2C Marketplace** with 3-tier seller hierarchy
- ✅ **Real-time Features** (Socket.io) for orders, reels, messages
- ✅ **TikTok-style Reels** with likes, comments, views
- ✅ **Authentication** via Clerk
- ✅ **Media Storage** on Cloudflare R2
- ✅ **Redis Caching** for hot data
- ✅ **PostgreSQL Database** with TypeORM
- ✅ **Background Jobs** with BullMQ
- ✅ **API Documentation** with Swagger

**Built For:** 2-5k concurrent users | Algeria/North Africa market

---

## 📋 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | NestJS 10 (Node.js + TypeScript) |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Cache | Redis 7 / ioredis |
| Real-time | Socket.io |
| Auth | Clerk |
| Storage | Cloudflare R2 (S3-compatible) |
| Queue | BullMQ |
| Documentation | Swagger/OpenAPI |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker & Docker Compose
- PostgreSQL 16 (optional if using Docker)
- Redis 7 (optional if using Docker)

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=zst_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=zst_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=zst-media
R2_PUBLIC_URL=https://cdn.zst.com
```

### 3. Run with Docker (Recommended)

```bash
# Start all services (PostgreSQL + Redis + API)
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

### 4. Run Locally (Without Docker)

```bash
# Make sure PostgreSQL and Redis are running

# Run migrations
npm run migration:run

# Start in development mode
npm run start:dev

# Or in watch mode
npm run start:debug
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Clerk authentication
│   │   ├── users/           # User management
│   │   │   └── entities/    # User entity
│   │   ├── products/        # Product CRUD
│   │   │   └── entities/    # Product, ProductImage entities
│   │   ├── orders/          # Order management
│   │   │   └── entities/    # Order, OrderItem entities
│   │   ├── reels/           # Product reels + interactions
│   │   │   └── entities/    # ProductReel, ReelLike, ReelComment
│   │   ├── b2b/             # B2B marketplace
│   │   │   └── entities/    # B2BOffer, B2BResponse entities
│   │   ├── cart/            # Shopping cart
│   │   │   └── entities/    # CartItem entity
│   │   ├── freelance/       # Freelance services
│   │   ├── storage/         # R2 file uploads
│   │   └── notifications/   # Push notifications
│   │
│   ├── config/              # Configuration
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── clerk.config.ts
│   │   └── r2.config.ts
│   │
│   ├── common/              # Shared code
│   │   ├── decorators/      # Custom decorators
│   │   ├── guards/          # Auth & role guards
│   │   ├── interceptors/    # Cache, logging
│   │   └── filters/         # Exception filters
│   │
│   ├── database/
│   │   └── migrations/      # TypeORM migrations
│   │
│   ├── main.ts              # Application entry point
│   └── app.module.ts        # Root module
│
├── docker-compose.yml       # Development setup
├── docker-compose.prod.yml  # Production setup
├── Dockerfile              # Multi-stage build
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Entities

### User
- Authentication via Clerk
- Roles: customer, seller, freelancer, admin
- Seller categories: fournisseur, importateur, grossiste

### Product
- Full product catalog
- Seller relationship
- Multiple images support
- Category and brand filtering

### Order
- Guest orders supported (nullable user_id)
- Status tracking (pending → confirmed → processing → shipped → delivered)
- Algeria wilayas support
- Order items with denormalized data

### ProductReel
- Video storage on R2
- Cached like/comment/view counts
- Thumbnail generation

### B2BOffer
- 3-tier B2B hierarchy enforcement
- Negotiable or auction types
- Target category filtering

---

## 🔐 Authentication Flow

### 1. Frontend Login (Clerk)

```typescript
// Mobile app
const { getToken } = useAuth();
const token = await getToken();

// Call backend
fetch('http://localhost:3000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Backend Verification

```typescript
// auth.guard.ts
@Injectable()
export class ClerkAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = extractToken(context);
    const session = await clerkClient.sessions.verifySession(token);

    // Get or create user in our DB
    const user = await this.usersService.findOrCreateFromClerk(session.userId);

    request.user = user;
    return true;
  }
}
```

### 3. Clerk Webhook (User Sync)

```typescript
// POST /api/webhooks/clerk
@Post('webhooks/clerk')
async handleClerkWebhook(@Body() event) {
  switch (event.type) {
    case 'user.created':
      await this.usersService.createFromClerk(event.data);
      break;
    case 'user.updated':
      await this.usersService.updateFromClerk(event.data);
      break;
  }
}
```

---

## ⚡ Redis Caching Strategy

### Cache Keys

```typescript
// Hot data (short TTL)
cache:products:featured         // 2 min
cache:products:{id}             // 1 min
cache:reel:stats:{id}           // 30 sec
cache:seller:stats:{sellerId}   // 5 min

// Real-time counters (synced to DB every 10 sec)
counter:reel:{reelId}:likes
counter:reel:{reelId}:comments
counter:reel:{reelId}:views
```

### Cache Usage Example

```typescript
// products.service.ts
async findById(id: string): Promise<Product> {
  const cacheKey = `cache:products:${id}`;

  // Try cache first
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from DB
  const product = await this.productsRepository.findOne({ where: { id } });

  // Cache for 1 minute
  await this.redis.setex(cacheKey, 60, JSON.stringify(product));

  return product;
}
```

---

## 🔌 Real-time Architecture (Socket.io)

### Client Connection (Frontend)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/realtime', {
  auth: {
    token: await getToken()
  }
});

// Join reel room
socket.emit('reel:join', reelId);

// Listen for likes
socket.on('reel:liked', (data) => {
  setLikes(prev => prev + 1);
});
```

### Server Gateway (Backend)

```typescript
@WebSocketGateway({ namespace: '/realtime' })
export class RealtimeGateway {
  @SubscribeMessage('reel:join')
  handleJoinReel(client: Socket, reelId: string) {
    client.join(`reel:${reelId}`);

    // Send current stats
    const stats = await this.redis.get(`reel:${reelId}:stats`);
    client.emit('reel:stats', stats);
  }

  @SubscribeMessage('reel:like')
  async handleLike(client: Socket, reelId: string) {
    // Increment in Redis
    await this.redis.incr(`counter:reel:${reelId}:likes`);

    // Broadcast to all watchers
    this.server.to(`reel:${reelId}`).emit('reel:liked', {
      reelId,
      timestamp: Date.now()
    });
  }
}
```

---

## 📤 File Upload (Cloudflare R2)

### Upload Endpoint

```typescript
@Post('products/:id/images')
@UseInterceptors(FileInterceptor('file'))
async uploadImage(
  @Param('id') productId: string,
  @UploadedFile() file: Express.Multer.File
) {
  const url = await this.storageService.uploadProductImage(
    user.id,
    productId,
    file
  );

  return { image_url: url };
}
```

### Storage Service

```typescript
@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      }
    });
  }

  async uploadProductImage(
    sellerId: string,
    productId: string,
    file: Express.Multer.File
  ): Promise<string> {
    const key = `products/${sellerId}/${productId}/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
}
```

---

## 🚢 Deployment

### Production Build

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

### Docker Production Deployment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Deploy to Contabo/DigitalOcean VPS

```bash
# 1. SSH into VPS
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone repository
git clone https://github.com/your-org/zst-backend.git
cd zst-backend/backend

# 4. Create .env file
nano .env
# (paste your production environment variables)

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Setup SSL (Let's Encrypt)
certbot --nginx -d api.zst.com
```

---

## 📊 API Endpoints

### Health Check
```
GET  /health              # Health check
GET  /                    # API info
```

### Authentication
```
POST /api/auth/signin     # Sign in
POST /api/webhooks/clerk  # Clerk webhook
```

### Products
```
GET    /api/products                  # List products (paginated)
GET    /api/products/:id              # Get product details
POST   /api/products                  # Create product (seller only)
PUT    /api/products/:id              # Update product
DELETE /api/products/:id              # Delete product
POST   /api/products/:id/images       # Upload images
```

### Orders
```
POST /api/orders                      # Create order
GET  /api/orders/:id                  # Get order details
GET  /api/orders                      # List user orders
GET  /api/seller/orders               # Seller orders
PUT  /api/seller/orders/:id/status    # Update status
```

### Reels
```
GET    /api/reels                     # List reels
GET    /api/reels/:id                 # Reel details + stats
POST   /api/reels                     # Upload reel
POST   /api/reels/:id/like            # Like reel
DELETE /api/reels/:id/like            # Unlike reel
GET    /api/reels/:id/comments        # Get comments
POST   /api/reels/:id/comments        # Add comment
DELETE /api/reels/comments/:id        # Delete comment
```

### B2B Marketplace
```
GET  /api/b2b/offers                  # List offers (filtered by tier)
POST /api/b2b/offers                  # Create offer
POST /api/b2b/offers/:id/respond      # Submit bid
GET  /api/b2b/my-offers               # My offers
GET  /api/b2b/my-responses            # My bids
```

### Seller Dashboard
```
GET /api/seller/stats                 # Dashboard stats
GET /api/seller/analytics             # Revenue charts
GET /api/seller/products              # My products
GET /api/seller/orders                # My orders
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📈 Performance Optimization

### Database Indexes

All critical indexes are defined in entities:

```typescript
@Index(['seller_id', 'category'])  // Composite index
@Index(['created_at'])             // Date sorting
@Index(['in_stock'])               // Filtered queries
```

### Redis Caching

- Products: 1 min TTL
- Reel stats: 30 sec TTL
- Seller stats: 5 min TTL

### Connection Pooling

```typescript
// database.config.ts
extra: {
  max: 20,  // Max connections
  min: 5,   // Min connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

---

## 🔒 Security

### Environment Variables

Never commit `.env` files. Use `.env.example` as template.

### Authentication

All routes protected by `@UseGuards(ClerkAuthGuard)` except public endpoints.

### Rate Limiting

```typescript
// Global rate limiting
ThrottlerModule.forRoot([{
  ttl: 60,    // 60 seconds
  limit: 100, // 100 requests
}])
```

### CORS

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## 📝 Migrations

### Generate Migration

```bash
npm run migration:generate -- src/database/migrations/AddNewColumn
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Migration

```bash
npm run migration:revert
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check credentials in .env
cat .env | grep DATABASE

# Test connection
psql -h localhost -U zst_user -d zst_db
```

### Redis Connection Failed

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
# Should return: PONG
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=4000 npm run start:dev
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Clerk Documentation](https://clerk.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Create Pull Request

---

## 📄 License

MIT License - Copyright (c) 2024 ZST Team

---

## 💡 Support

For questions or issues:
- Create an issue on GitHub
- Email: support@zst.com

---

**Built with ❤️ by the ZST Team**
