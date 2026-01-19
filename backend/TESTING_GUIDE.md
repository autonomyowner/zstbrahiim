# Testing Guide - ZST Backend

## Prerequisites

Before testing, ensure you have:

1. **Docker Desktop** running
2. **Node.js 18+** installed
3. **Postman** or **cURL** for API testing
4. **Clerk account** with test credentials

---

## Setup for Testing

### 1. Start Services

```bash
cd "D:\zst cutsom backend\app zst\backend"

# Start Docker containers (PostgreSQL + Redis)
docker-compose up -d

# Verify services are running
docker ps

# Install dependencies (if not done)
npm install

# Start backend in development mode
npm run start:dev
```

### 2. Verify Services

**Check PostgreSQL:**
```bash
docker exec -it zst-postgres psql -U postgres -d zst_db -c "SELECT version();"
```

**Check Redis:**
```bash
docker exec -it zst-redis redis-cli ping
# Should return: PONG
```

**Check Backend:**
```bash
curl http://localhost:3000
# Should return: {"message":"ZST API is running"}
```

### 3. Access Swagger UI

Open browser: http://localhost:3000/api

This provides interactive API documentation where you can test endpoints directly.

---

## Test Scenarios

### Scenario 1: Guest User - Browse & Order

**Goal:** Test guest browsing and checkout without authentication

```bash
# 1. List products
curl http://localhost:3000/api/v1/products?page=1&limit=10

# 2. Get product details
curl http://localhost:3000/api/v1/products/{PRODUCT_ID}

# 3. Create guest order (no auth required)
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Guest User",
    "customer_phone": "0555123456",
    "customer_wilaya": "Alger",
    "shipping_address": "123 Test Street",
    "payment_method": "cod",
    "items": [
      {
        "product_id": "PRODUCT_UUID",
        "quantity": 2
      }
    ]
  }'

# 4. Track order by phone (guest)
curl "http://localhost:3000/api/v1/orders/track/0555123456"
```

**Expected:**
- ✅ Products list returned
- ✅ Order created with order number
- ✅ Can track order using phone number

---

### Scenario 2: Customer - Full Shopping Flow

**Goal:** Test authenticated user shopping experience

**Prerequisites:** Get Clerk JWT token from your mobile app or Clerk dashboard.

```bash
# Set your token
TOKEN="your-clerk-jwt-token-here"

# 1. Browse products
curl http://localhost:3000/api/v1/products

# 2. Add to cart
curl -X POST http://localhost:3000/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_UUID",
    "quantity": 2
  }'

# 3. View cart
curl http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"

# 4. Update cart item
curl -X PATCH http://localhost:3000/api/v1/cart/items/{CART_ITEM_ID} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'

# 5. Create order from cart
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Ahmed Benali",
    "customer_phone": "0555123456",
    "customer_wilaya": "Alger",
    "shipping_address": "123 Test Street",
    "payment_method": "cod",
    "items": [
      {
        "product_id": "PRODUCT_UUID",
        "quantity": 2
      }
    ]
  }'

# 6. View my orders
curl http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- ✅ Cart items added/updated
- ✅ Order created successfully
- ✅ Cart cleared after order (optional)
- ✅ Order visible in user's order list

---

### Scenario 3: Seller - Product Management

**Goal:** Test seller CRUD operations

```bash
SELLER_TOKEN="your-seller-jwt-token-here"

# 1. Upload product image
curl -X POST http://localhost:3000/api/v1/storage/products/{PRODUCT_ID}/images \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "file=@/path/to/image.jpg"

# 2. Create product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Perfume",
    "description": "Luxury fragrance from France",
    "price": 5000,
    "stock": 100,
    "category": "perfume",
    "brand": "Chanel",
    "images": ["IMAGE_URL_FROM_UPLOAD"],
    "tags": ["luxury", "men"]
  }'

# 3. Get seller dashboard stats
curl http://localhost:3000/api/v1/seller/stats \
  -H "Authorization: Bearer $SELLER_TOKEN"

# 4. Get seller orders
curl http://localhost:3000/api/v1/seller/orders \
  -H "Authorization: Bearer $SELLER_TOKEN"

# 5. Update order status
curl -X PATCH http://localhost:3000/api/v1/seller/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

**Expected:**
- ✅ Image uploaded to R2
- ✅ Product created successfully
- ✅ Dashboard shows correct stats
- ✅ Can update order status
- ✅ Status transition validation works

---

### Scenario 4: Real-time Reels Interactions

**Goal:** Test TikTok-style reel features with real-time updates

**Setup:** Open two browser tabs/terminals for real-time testing

**Terminal 1 (User A):**
```javascript
// Install socket.io-client: npm install socket.io-client
const io = require('socket.io-client');

const socket = io('http://localhost:3000/realtime', {
  auth: { token: 'USER_A_TOKEN' }
});

socket.on('connect', () => {
  console.log('User A connected');
  socket.emit('reel:join', 'REEL_UUID');
});

socket.on('reel:liked', (data) => {
  console.log('User A sees like:', data);
});

socket.on('reel:commented', (data) => {
  console.log('User A sees comment:', data);
});
```

**Terminal 2 (User B):**
```bash
# Like the reel
curl -X POST http://localhost:3000/api/v1/reels/{REEL_ID}/like \
  -H "Authorization: Bearer USER_B_TOKEN"

# Add comment
curl -X POST http://localhost:3000/api/v1/reels/{REEL_ID}/comments \
  -H "Authorization: Bearer USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Amazing product!"}'
```

**Expected:**
- ✅ User A sees like event in real-time (<300ms)
- ✅ User A sees comment event in real-time
- ✅ Like count increments correctly
- ✅ Comment appears with user info

---

### Scenario 5: B2B Marketplace Hierarchy

**Goal:** Test seller hierarchy enforcement

**Test 1: Importateur → Grossiste (Should Work)**
```bash
IMPORTATEUR_TOKEN="importateur-token"

# Create offer for Grossistes
curl -X POST http://localhost:3000/api/v1/b2b/offers \
  -H "Authorization: Bearer $IMPORTATEUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "100 units perfume wholesale",
    "description": "Premium bulk sale",
    "base_price": 4500,
    "min_quantity": 10,
    "available_quantity": 100,
    "offer_type": "negotiable",
    "target_category": "grossiste"
  }'
```

**Test 2: Grossiste responds (Should Work)**
```bash
GROSSISTE_TOKEN="grossiste-token"

# List offers (should see Importateur offers)
curl http://localhost:3000/api/v1/b2b/offers \
  -H "Authorization: Bearer $GROSSISTE_TOKEN"

# Submit bid
curl -X POST http://localhost:3000/api/v1/b2b/offers/{OFFER_ID}/respond \
  -H "Authorization: Bearer $GROSSISTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response_type": "bid",
    "amount": 4800,
    "quantity": 50,
    "message": "Interested in long-term partnership"
  }'
```

**Test 3: Fournisseur tries to respond to Importateur (Should Fail)**
```bash
FOURNISSEUR_TOKEN="fournisseur-token"

# Try to respond (should get 403 Forbidden)
curl -X POST http://localhost:3000/api/v1/b2b/offers/{OFFER_ID}/respond \
  -H "Authorization: Bearer $FOURNISSEUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response_type": "bid",
    "amount": 4800,
    "quantity": 50
  }'
```

**Expected:**
- ✅ Importateur creates offer successfully
- ✅ Grossiste sees offer and can respond
- ✅ Fournisseur gets 403 error (hierarchy enforced)

---

### Scenario 6: File Upload & Thumbnails

**Goal:** Test image uploads with automatic thumbnail generation

```bash
SELLER_TOKEN="seller-token"

# Upload product image
curl -X POST http://localhost:3000/api/v1/storage/products/{PRODUCT_ID}/images \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "file=@test-image.jpg"

# Response should include:
# - url: Full-size image URL
# - thumbnailUrl: 400x400 thumbnail URL
```

**Verify:**
1. Check R2 bucket for uploaded files
2. Verify thumbnail was generated (400x400px)
3. Check BullMQ queue dashboard for job processing

---

## Load Testing

### Using k6

Install k6: https://k6.io/docs/getting-started/installation/

**Test Script: `load-test.js`**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 1000 },  // Ramp up to 1k users
    { duration: '2m', target: 1000 },  // Stay at 1k users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% failure rate
  },
};

export default function () {
  // Test product listing
  const res = http.get('http://localhost:3000/api/v1/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run Load Test:**
```bash
k6 run load-test.js
```

**Expected Metrics:**
- ✅ P95 response time < 500ms
- ✅ Failure rate < 1%
- ✅ Can handle 1000 concurrent users
- ✅ Redis cache hit rate > 80%

---

## Database Testing

### Check Indexes

```sql
-- Connect to database
docker exec -it zst-postgres psql -U postgres -d zst_db

-- List indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM products
WHERE in_stock = true AND category = 'perfume'
LIMIT 20;
```

**Expected:**
- ✅ Indexes exist on frequently queried columns
- ✅ Query uses index scan (not sequential scan)
- ✅ Query execution time < 10ms

---

## Redis Testing

### Check Cache Performance

```bash
# Connect to Redis
docker exec -it zst-redis redis-cli

# Check cache hit rate
INFO stats | grep hits

# List all keys
KEYS *

# Check specific cache
GET "products:list:{\"page\":1,\"limit\":20}"

# Check reel counters
GET "counter:reel:REEL_UUID:likes"
GET "counter:reel:REEL_UUID:comments"

# Monitor real-time
MONITOR
```

**Expected:**
- ✅ Cache hit rate > 70%
- ✅ Counters incrementing correctly
- ✅ Keys expiring as expected (TTL)

---

## WebSocket Testing

### Manual WebSocket Test

```html
<!-- test-websocket.html -->
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>WebSocket Real-time Test</h1>
  <div id="log"></div>

  <script>
    const socket = io('http://localhost:3000/realtime', {
      auth: { token: 'YOUR_TOKEN' }
    });

    const log = document.getElementById('log');

    socket.on('connect', () => {
      addLog('Connected: ' + socket.id);

      // Join reel room
      socket.emit('reel:join', 'TEST_REEL_ID');
    });

    socket.on('reel:liked', (data) => {
      addLog('Like received: ' + JSON.stringify(data));
    });

    socket.on('reel:commented', (data) => {
      addLog('Comment received: ' + JSON.stringify(data));
    });

    function addLog(message) {
      const p = document.createElement('p');
      p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      log.appendChild(p);
    }
  </script>
</body>
</html>
```

**Test:**
1. Open test-websocket.html in browser
2. Like/comment on reel from another device/Postman
3. Verify events appear in real-time

---

## Error Handling Testing

### Test Invalid Requests

```bash
# Missing required field
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Test"}'
# Expected: 400 Bad Request with validation errors

# Invalid UUID
curl http://localhost:3000/api/v1/products/invalid-uuid
# Expected: 400 Bad Request

# Unauthorized access
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Expected: 401 Unauthorized

# Forbidden (wrong role)
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Expected: 403 Forbidden

# Rate limiting
for i in {1..150}; do
  curl http://localhost:3000/api/v1/products
done
# Expected: 429 Too Many Requests after 100 requests
```

---

## Test Checklist

Before deploying to production:

### Functionality
- [ ] All CRUD operations work
- [ ] Authentication/authorization enforced
- [ ] Real-time events broadcast correctly
- [ ] File uploads work (images & videos)
- [ ] B2B hierarchy enforced correctly
- [ ] Seller dashboard shows accurate stats
- [ ] Rate limiting works
- [ ] Error responses are clear

### Performance
- [ ] API response time < 200ms (p95)
- [ ] Database queries optimized (use indexes)
- [ ] Redis cache hit rate > 70%
- [ ] WebSocket latency < 100ms
- [ ] Can handle 1000 concurrent users
- [ ] No N+1 query problems

### Data Integrity
- [ ] Database transactions work correctly
- [ ] Foreign keys enforced
- [ ] Cascade deletes work
- [ ] Redis counters sync to DB
- [ ] Order totals calculated correctly

### Security
- [ ] SQL injection protected (use parameterized queries)
- [ ] XSS protected (input validation)
- [ ] CORS configured correctly
- [ ] Rate limiting prevents abuse
- [ ] File upload size limits enforced
- [ ] JWT tokens verified correctly

---

## Debugging Tips

### View Logs

```bash
# Backend logs
npm run start:dev
# Watch for errors, slow queries, etc.

# PostgreSQL logs
docker logs zst-postgres

# Redis logs
docker logs zst-redis
```

### Common Issues

**Issue: Cannot connect to database**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it zst-postgres psql -U postgres -d zst_db -c "SELECT 1;"
```

**Issue: Redis connection fails**
```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
docker exec -it zst-redis redis-cli ping
```

**Issue: WebSocket not connecting**
- Check CORS settings in realtime.gateway.ts
- Verify client is using correct namespace: `/realtime`
- Check authentication token is valid

**Issue: File upload fails**
- Verify R2 credentials in .env
- Check R2 bucket exists and is accessible
- Ensure file size within limits

---

## Next Steps

After testing:

1. **Fix any bugs** found during testing
2. **Optimize slow queries** (use EXPLAIN ANALYZE)
3. **Add monitoring** (Grafana, Sentry)
4. **Set up CI/CD** for automated testing
5. **Deploy to production** with confidence!

---

**Happy Testing! 🧪**
