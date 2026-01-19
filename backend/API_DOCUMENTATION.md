# ZST Marketplace API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://api.zst-app.com
```

## Authentication

All authenticated endpoints require a Bearer token from Clerk in the Authorization header:

```bash
Authorization: Bearer YOUR_CLERK_JWT_TOKEN
```

---

## Products API

### List Products
```http
GET /api/v1/products?page=1&limit=20&category=perfume&in_stock=true
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `category` (string, optional) - Filter by category
- `brand` (string, optional) - Filter by brand
- `in_stock` (boolean, optional) - Filter in-stock only
- `min_price` (number, optional) - Minimum price
- `max_price` (number, optional) - Maximum price
- `seller_id` (uuid, optional) - Filter by seller
- `search` (string, optional) - Search by name/description

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium Perfume",
      "description": "Luxury fragrance",
      "price": 5000,
      "stock": 100,
      "category": "perfume",
      "images": ["url1", "url2"],
      "seller": { "id": "uuid", "name": "Seller Name" }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Product by ID
```http
GET /api/v1/products/:id
```

### Create Product (Seller Only)
```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Premium Perfume",
  "description": "Luxury fragrance from France",
  "price": 5000,
  "stock": 100,
  "category": "perfume",
  "brand": "Chanel",
  "images": ["https://r2.../image1.jpg"],
  "tags": ["luxury", "men", "french"]
}
```

---

## Orders API

### Create Order
```http
POST /api/v1/orders
Content-Type: application/json

{
  "customer_name": "Ahmed Benali",
  "customer_phone": "0555123456",
  "customer_wilaya": "Alger",
  "shipping_address": "123 Rue Didouche, Alger",
  "payment_method": "cod",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ],
  "notes": "Please call before delivery"
}
```

**Response:**
```json
{
  "message": "Order(s) created successfully",
  "orders": [
    {
      "id": "uuid",
      "order_number": "ZST-1234567890-1234",
      "total": 10000,
      "status": "pending",
      "items": [...]
    }
  ]
}
```

### Get Order Details
```http
GET /api/v1/orders/:id
Authorization: Bearer <token>
```

### List User Orders
```http
GET /api/v1/orders?page=1&limit=20&status=pending
Authorization: Bearer <token>
```

### Update Order Status (Seller Only)
```http
PATCH /api/v1/seller/orders/:id/status
Authorization: Bearer <seller-token>
Content-Type: application/json

{
  "status": "shipped"
}
```

**Valid Status Transitions:**
```
pending → confirmed, cancelled
confirmed → processing, cancelled
processing → shipped, cancelled
shipped → delivered, returned
delivered → returned
```

---

## Cart API

### Get Cart
```http
GET /api/v1/cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "product": {
        "id": "uuid",
        "name": "Premium Perfume",
        "price": 5000,
        "images": ["url"]
      },
      "subtotal": 10000
    }
  ],
  "total": 10000
}
```

### Add to Cart
```http
POST /api/v1/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 2
}
```

### Update Cart Item
```http
PATCH /api/v1/cart/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

### Remove from Cart
```http
DELETE /api/v1/cart/items/:id
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /api/v1/cart
Authorization: Bearer <token>
```

---

## Reels API

### List Reels (TikTok-style Feed)
```http
GET /api/v1/reels?page=1&limit=20&product_id=uuid
```

**Response includes:**
- `is_liked` (if authenticated) - Whether current user liked
- `likes_count`, `comments_count`, `views_count` - Real-time counters

### Get Reel by ID
```http
GET /api/v1/reels/:id
```

### Create Reel (Seller Only)
```http
POST /api/v1/reels
Authorization: Bearer <seller-token>
Content-Type: application/json

{
  "product_id": "uuid",
  "video_url": "https://r2.../video.mp4",
  "video_storage_path": "reels/uuid/video.mp4",
  "caption": "Check out this amazing product!"
}
```

### Increment View Count
```http
POST /api/v1/reels/:id/view
```

### Delete Reel (Owner Only)
```http
DELETE /api/v1/reels/:id
Authorization: Bearer <seller-token>
```

---

## Reel Interactions API

### Like Reel
```http
POST /api/v1/reels/:id/like
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Reel liked successfully",
  "reelId": "uuid",
  "likesCount": 42
}
```

**Real-time Event Broadcasted:**
```javascript
socket.on('reel:liked', {
  reelId: "uuid",
  userId: "uuid",
  likesCount: 42,
  timestamp: 1234567890
});
```

### Unlike Reel
```http
DELETE /api/v1/reels/:id/like
Authorization: Bearer <token>
```

### Get Who Liked
```http
GET /api/v1/reels/:id/likes?page=1&limit=20
Authorization: Bearer <token>
```

### Add Comment
```http
POST /api/v1/reels/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great product! Where can I buy?"
}
```

**Real-time Event Broadcasted:**
```javascript
socket.on('reel:commented', {
  reelId: "uuid",
  comment: {
    id: "uuid",
    content: "Great product!",
    user: { id: "uuid", name: "Ahmed" }
  },
  timestamp: 1234567890
});
```

### Get Comments
```http
GET /api/v1/reels/:id/comments?page=1&limit=20
Authorization: Bearer <token>
```

### Delete Comment (Owner Only)
```http
DELETE /api/v1/reels/comments/:commentId
Authorization: Bearer <token>
```

### Update Comment (Owner Only)
```http
PATCH /api/v1/reels/comments/:commentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment text"
}
```

---

## Storage API (File Uploads)

### Upload Product Image (Seller Only)
```http
POST /api/v1/storage/products/:productId/images
Authorization: Bearer <seller-token>
Content-Type: multipart/form-data

file: <binary>
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://r2.../products/uuid/images/123.jpg",
  "key": "products/uuid/images/123.jpg",
  "thumbnailUrl": "https://r2.../products/uuid/images/123-thumb.jpg",
  "thumbnailKey": "products/uuid/images/123-thumb.jpg"
}
```

**Constraints:**
- Max size: 10MB
- Allowed formats: JPEG, PNG, GIF, WebP
- Auto-generates 400x400 thumbnail

### Upload Reel Video (Seller Only)
```http
POST /api/v1/storage/reels/:productId/video
Authorization: Bearer <seller-token>
Content-Type: multipart/form-data

file: <binary>
```

**Constraints:**
- Max size: 100MB
- Allowed formats: MP4, MOV, AVI
- No thumbnail generation for videos

### Delete File (Seller/Admin Only)
```http
DELETE /api/v1/storage/files/:key
Authorization: Bearer <token>
```

---

## B2B Marketplace API

### List B2B Offers (Filtered by Hierarchy)
```http
GET /api/v1/b2b/offers?page=1&limit=20&offer_type=negotiable&status=active
Authorization: Bearer <seller-token>
```

**Query Parameters:**
- `page`, `limit` - Pagination
- `offer_type` - `negotiable` or `auction`
- `status` - `active`, `expired`, `closed`, `sold`
- `target_category` - `importateur`, `grossiste`, `fournisseur`

**Hierarchy Rules:**
- Importateurs see offers for Grossiste & Fournisseur
- Grossistes see offers for Importateur & Fournisseur
- Fournisseurs see offers for Grossiste only

### Get Offer Details
```http
GET /api/v1/b2b/offers/:id
Authorization: Bearer <seller-token>
```

### Create B2B Offer (Seller Only)
```http
POST /api/v1/b2b/offers
Authorization: Bearer <seller-token>
Content-Type: application/json

{
  "title": "100 units of premium perfume",
  "description": "High-quality French perfume, bulk wholesale",
  "images": ["https://..."],
  "tags": ["perfume", "wholesale"],
  "base_price": 4500,
  "min_quantity": 10,
  "available_quantity": 100,
  "offer_type": "negotiable",
  "target_category": "grossiste"
}
```

**For Auction Type:**
```json
{
  "offer_type": "auction",
  "starts_at": "2024-01-01T00:00:00Z",
  "ends_at": "2024-01-10T00:00:00Z",
  ...
}
```

### Submit Bid/Negotiation
```http
POST /api/v1/b2b/offers/:id/respond
Authorization: Bearer <seller-token>
Content-Type: application/json

{
  "response_type": "bid",
  "amount": 4800,
  "quantity": 50,
  "message": "Can we discuss bulk discount?"
}
```

**Validation:**
- Must match offer's `target_category`
- Quantity >= `min_quantity`
- For auctions: bid must be higher than current bid

### Get My Offers (As Seller)
```http
GET /api/v1/b2b/my-offers?page=1&limit=20
Authorization: Bearer <seller-token>
```

### Get My Responses (As Buyer)
```http
GET /api/v1/b2b/my-responses?page=1&limit=20
Authorization: Bearer <seller-token>
```

---

## Seller Dashboard API

### Get Dashboard Stats
```http
GET /api/v1/seller/stats
Authorization: Bearer <seller-token>
```

**Response:**
```json
{
  "products": {
    "total": 50,
    "active": 45,
    "outOfStock": 5
  },
  "orders": {
    "total": 120,
    "pending": 8
  },
  "revenue": {
    "total": 2500000,
    "monthly": 500000,
    "avgOrderValue": 20833
  },
  "reels": {
    "total": 15,
    "totalViews": 5420
  }
}
```

**Caching:** 5 minutes

### Get Revenue Analytics
```http
GET /api/v1/seller/analytics?period=30d
Authorization: Bearer <seller-token>
```

**Periods:** `7d`, `30d`, `90d`, `365d`

**Response:**
```json
{
  "period": "30d",
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 50000,
      "orderCount": 5
    },
    {
      "date": "2024-01-02",
      "revenue": 75000,
      "orderCount": 8
    }
  ]
}
```

### Get Recent Orders
```http
GET /api/v1/seller/recent-orders
Authorization: Bearer <seller-token>
```

Returns last 10 orders with full details.

### Get Top Products
```http
GET /api/v1/seller/top-products
Authorization: Bearer <seller-token>
```

**Response:**
```json
[
  {
    "productId": "uuid",
    "productName": "Premium Perfume",
    "totalQuantity": 150,
    "totalRevenue": 750000
  }
]
```

---

## WebSocket (Real-time) API

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/realtime', {
  transports: ['websocket'],
  auth: {
    token: 'your-clerk-jwt-token' // Optional
  }
});
```

### Join Reel Room
```javascript
socket.emit('reel:join', reelId);

// Listen for events
socket.on('reel:liked', (data) => {
  console.log('Like:', data.likesCount);
});

socket.on('reel:commented', (data) => {
  console.log('New comment:', data.comment);
});

socket.on('reel:unliked', (data) => {
  console.log('Unlike:', data.likesCount);
});

socket.on('reel:comment-deleted', (data) => {
  console.log('Comment deleted:', data.commentId);
});
```

### Subscribe to Order Updates
```javascript
socket.emit('order:subscribe', orderId);

socket.on('order:status-updated', (data) => {
  console.log('Order status:', data.status);
  console.log('Order:', data.order);
});
```

### Subscribe to Seller Updates (Dashboard)
```javascript
socket.emit('seller:subscribe'); // Uses authenticated user ID

socket.on('order:new', (data) => {
  console.log('New order received:', data.order);
});

socket.on('order:status-updated', (data) => {
  console.log('Order updated:', data.orderId);
});
```

### Health Check
```javascript
socket.emit('ping');
socket.on('pong', (data) => {
  console.log('Latency:', Date.now() - data.timestamp, 'ms');
});
```

---

## Rate Limiting

### Global Rate Limits
- **Default:** 100 requests per minute per IP
- **Configurable:** via `THROTTLE_TTL` and `THROTTLE_LIMIT` env vars

### Specific Limits
- **Like reel:** 10 per minute per user
- **Comment on reel:** 5 per minute per user
- **Create order:** Rate limited to prevent spam

---

## Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /api/v1/products?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

---

## Testing with cURL

### Example: Create Order
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Ahmed Benali",
    "customer_phone": "0555123456",
    "customer_wilaya": "Alger",
    "shipping_address": "123 Rue Didouche",
    "payment_method": "cod",
    "items": [
      {
        "product_id": "your-product-uuid",
        "quantity": 2
      }
    ]
  }'
```

### Example: Like Reel (Authenticated)
```bash
curl -X POST http://localhost:3000/api/v1/reels/{reelId}/like \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

---

## Postman Collection

Import this URL to Postman for a complete collection:
```
http://localhost:3000/api-json
```

(Swagger/OpenAPI JSON export)

---

## Support

For issues or questions:
- GitHub: https://github.com/your-repo/zst-backend
- Email: support@zst-app.com

---

**Last Updated:** 2026-01-15
**API Version:** v1
**Backend Version:** 1.0.0
