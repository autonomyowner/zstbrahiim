# ZST Marketplace API Specification

> RESTful API design following industry best practices

**Version:** 1.0
**Base URL:** `https://api.zst.com/api/v1`
**Authentication:** Bearer token (Clerk JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Products API](#products-api)
3. [Orders API](#orders-api)
4. [Cart API](#cart-api)
5. [Reels API](#reels-api)
6. [B2B Marketplace API](#b2b-marketplace-api)
7. [Seller Dashboard API](#seller-dashboard-api)
8. [Users API](#users-api)
9. [Freelance API](#freelance-api)
10. [Response Format](#response-format)
11. [Error Handling](#error-handling)
12. [Pagination](#pagination)
13. [Rate Limiting](#rate-limiting)

---

## Authentication

All endpoints (except public ones) require authentication via Clerk JWT token.

### Request Header
```http
Authorization: Bearer <clerk-jwt-token>
```

### Public Endpoints (No Auth Required)
- `GET /products`
- `GET /products/:id`
- `GET /reels`
- `GET /reels/:id`
- `GET /b2b/offers` (filtered by auth)

---

## Products API

### List Products
```http
GET /products
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `limit` | integer | Items per page (max 100) | 20 |
| `category` | string | Filter by category | - |
| `seller_category` | enum | fournisseur, importateur, grossiste | - |
| `search` | string | Search in name, brand, description | - |
| `in_stock` | boolean | Filter by stock status | - |
| `min_price` | number | Minimum price | - |
| `max_price` | number | Maximum price | - |
| `sort` | string | Sort by: `price`, `-price`, `created_at`, `-created_at` | `-created_at` |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "chanel-no5-perfume",
      "name": "Chanel No. 5",
      "brand": "Chanel",
      "description": "Classic fragrance...",
      "price": 12500.00,
      "original_price": 15000.00,
      "category": "perfume",
      "product_type": "luxury",
      "in_stock": true,
      "is_new": false,
      "is_promo": true,
      "rating": 4.8,
      "viewers_count": 1523,
      "images": [
        {
          "id": "uuid",
          "image_url": "https://cdn.zst.com/products/...",
          "is_primary": true,
          "display_order": 0
        }
      ],
      "seller": {
        "id": "uuid",
        "full_name": "Boutique Paris",
        "seller_category": "importateur"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

### Get Product by ID
```http
GET /products/:id
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "slug": "chanel-no5-perfume",
    "name": "Chanel No. 5",
    "brand": "Chanel",
    "description": "Classic fragrance...",
    "price": 12500.00,
    "original_price": 15000.00,
    "category": "perfume",
    "in_stock": true,
    "rating": 4.8,
    "viewers_count": 1523,
    "benefits": ["Long-lasting", "Elegant scent"],
    "ingredients": "Alcohol, Parfum...",
    "usage_instructions": "Apply to pulse points...",
    "delivery_estimate": "2-3 days",
    "shipping_info": "Free shipping over 5000 DA",
    "returns_info": "30-day return policy",
    "payment_info": "Cash on delivery available",
    "images": [...],
    "reels": [
      {
        "id": "uuid",
        "video_url": "https://cdn.zst.com/reels/...",
        "thumbnail_url": "https://cdn.zst.com/thumbnails/...",
        "likes_count": 432,
        "comments_count": 56,
        "views_count": 2341
      }
    ],
    "seller": {
      "id": "uuid",
      "full_name": "Boutique Paris",
      "avatar_url": "https://cdn.zst.com/avatars/...",
      "seller_category": "importateur",
      "rating": 4.7,
      "is_verified": true
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error:** `404 Not Found`
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

### Create Product (Seller Only)
```http
POST /products
```

**Authorization:** Seller role required

**Request Body:**
```json
{
  "name": "Chanel No. 5",
  "brand": "Chanel",
  "description": "Classic fragrance...",
  "price": 12500.00,
  "original_price": 15000.00,
  "category": "perfume",
  "product_type": "luxury",
  "in_stock": true,
  "is_new": true,
  "is_promo": false,
  "benefits": ["Long-lasting", "Elegant scent"],
  "ingredients": "Alcohol, Parfum...",
  "usage_instructions": "Apply to pulse points...",
  "delivery_estimate": "2-3 days",
  "shipping_info": "Free shipping over 5000 DA",
  "returns_info": "30-day return policy",
  "payment_info": "Cash on delivery available"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "slug": "chanel-no5-perfume",
    ...
  }
}
```

**Validation Error:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      },
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

---

### Update Product
```http
PATCH /products/:id
```

**Authorization:** Must be product owner

**Request Body:** (partial update)
```json
{
  "price": 11500.00,
  "in_stock": false
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "price": 11500.00,
    "in_stock": false,
    ...
  }
}
```

**Authorization Error:** `403 Forbidden`
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to update this product"
  }
}
```

---

### Delete Product
```http
DELETE /products/:id
```

**Authorization:** Must be product owner

**Response:** `204 No Content`

---

### Upload Product Images
```http
POST /products/:id/images
```

**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [binary]
is_primary: true
display_order: 0
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "image_url": "https://cdn.zst.com/products/seller-id/product-id/1234567890.jpg",
    "is_primary": true,
    "display_order": 0
  }
}
```

**File Size Error:** `413 Payload Too Large`
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Image size must be less than 5MB"
  }
}
```

---

### Search Products
```http
GET /products/search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Response:** `200 OK`
```json
{
  "data": [...],
  "meta": {
    "query": "chanel",
    "page": 1,
    "total": 12
  }
}
```

---

## Orders API

### Create Order
```http
POST /orders
```

**Authorization:** Optional (supports guest checkout)

**Request Body:**
```json
{
  "customer_name": "Ahmed Benali",
  "customer_email": "ahmed@example.com",
  "customer_phone": "+213555123456",
  "customer_address": "Rue de la Liberté, Bt A, Apt 12",
  "customer_wilaya": "Alger",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    },
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "notes": "Please call before delivery"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "order_number": "ZST-1705315800-A3F2",
    "user_id": "uuid",
    "seller_id": "uuid",
    "customer_name": "Ahmed Benali",
    "customer_email": "ahmed@example.com",
    "customer_phone": "+213555123456",
    "customer_address": "Rue de la Liberté, Bt A, Apt 12",
    "customer_wilaya": "Alger",
    "total": 37500.00,
    "status": "pending",
    "payment_status": "pending",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Chanel No. 5",
        "product_image": "https://cdn.zst.com/...",
        "quantity": 2,
        "price": 12500.00,
        "subtotal": 25000.00
      },
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Dior Sauvage",
        "product_image": "https://cdn.zst.com/...",
        "quantity": 1,
        "price": 12500.00,
        "subtotal": 12500.00
      }
    ],
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Validation Error:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": [
      {
        "field": "customer_phone",
        "message": "Phone number is required"
      },
      {
        "field": "items",
        "message": "Order must have at least one item"
      }
    ]
  }
}
```

**Stock Error:** `409 Conflict`
```json
{
  "error": {
    "code": "OUT_OF_STOCK",
    "message": "Some items are out of stock",
    "details": [
      {
        "product_id": "uuid",
        "product_name": "Chanel No. 5",
        "available": 0
      }
    ]
  }
}
```

---

### Get Order by ID
```http
GET /orders/:id
```

**Authorization:** Must be order owner or seller

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "order_number": "ZST-1705315800-A3F2",
    "status": "shipped",
    "payment_status": "paid",
    "total": 37500.00,
    "tracking_number": "DZ123456789",
    "delivery_date": "2024-01-18T14:00:00Z",
    "items": [...],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T09:15:00Z"
  }
}
```

---

### List User Orders
```http
GET /orders
```

**Authorization:** Authenticated user

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `status` | enum | Filter by status |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ZST-1705315800-A3F2",
      "status": "delivered",
      "total": 37500.00,
      "items_count": 3,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 8
  }
}
```

---

### Update Order Status (Seller Only)
```http
PATCH /seller/orders/:id/status
```

**Authorization:** Seller, must be order seller

**Request Body:**
```json
{
  "status": "shipped",
  "tracking_number": "DZ123456789"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "status": "shipped",
    "tracking_number": "DZ123456789",
    "updated_at": "2024-01-16T09:15:00Z"
  }
}
```

**Invalid Transition Error:** `400 Bad Request`
```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot change status from 'delivered' to 'pending'"
  }
}
```

---

## Cart API

### Get Cart
```http
GET /cart
```

**Authorization:** Authenticated user

**Response:** `200 OK`
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Chanel No. 5",
        "product_image": "https://cdn.zst.com/...",
        "product_price": 12500.00,
        "quantity": 2,
        "subtotal": 25000.00,
        "in_stock": true
      }
    ],
    "total": 25000.00,
    "items_count": 1
  }
}
```

---

### Add to Cart
```http
POST /cart/items
```

**Request Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "quantity": 2,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Already Exists:** `200 OK` (quantity updated)
```json
{
  "data": {
    "id": "uuid",
    "quantity": 4,
    "updated_at": "2024-01-15T10:35:00Z"
  }
}
```

---

### Update Cart Item
```http
PATCH /cart/items/:id
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "quantity": 3,
    "subtotal": 37500.00
  }
}
```

---

### Remove from Cart
```http
DELETE /cart/items/:id
```

**Response:** `204 No Content`

---

### Clear Cart
```http
DELETE /cart
```

**Response:** `204 No Content`

---

## Reels API

### List Reels
```http
GET /reels
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `product_id` | uuid | Filter by product |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "video_url": "https://cdn.zst.com/reels/...",
      "thumbnail_url": "https://cdn.zst.com/thumbnails/...",
      "duration_seconds": 30,
      "likes_count": 432,
      "comments_count": 56,
      "views_count": 2341,
      "product": {
        "id": "uuid",
        "name": "Chanel No. 5",
        "price": 12500.00,
        "images": [...]
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 156
  }
}
```

---

### Get Reel by ID
```http
GET /reels/:id
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "video_url": "https://cdn.zst.com/reels/...",
    "thumbnail_url": "https://cdn.zst.com/thumbnails/...",
    "duration_seconds": 30,
    "likes_count": 432,
    "comments_count": 56,
    "views_count": 2341,
    "is_liked": true,
    "product": {...},
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Upload Reel (Seller Only)
```http
POST /reels
```

**Content-Type:** `multipart/form-data`

**Request Body:**
```
product_id: uuid
video: [binary]
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "video_url": "https://cdn.zst.com/reels/...",
    "thumbnail_url": null,
    "status": "processing"
  }
}
```

**Note:** Thumbnail generation happens asynchronously via BullMQ job.

---

### Like Reel
```http
POST /reels/:id/like
```

**Authorization:** Authenticated user

**Response:** `200 OK`
```json
{
  "data": {
    "reel_id": "uuid",
    "is_liked": true,
    "likes_count": 433
  }
}
```

---

### Unlike Reel
```http
DELETE /reels/:id/like
```

**Response:** `200 OK`
```json
{
  "data": {
    "reel_id": "uuid",
    "is_liked": false,
    "likes_count": 432
  }
}
```

---

### Get Reel Comments
```http
GET /reels/:id/comments
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 50) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "reel_id": "uuid",
      "user_id": "uuid",
      "content": "Love this product! 😍",
      "user": {
        "id": "uuid",
        "full_name": "Fatima Zahra",
        "avatar_url": "https://cdn.zst.com/avatars/..."
      },
      "created_at": "2024-01-15T10:45:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 56
  }
}
```

---

### Add Comment
```http
POST /reels/:id/comments
```

**Request Body:**
```json
{
  "content": "Love this product! 😍"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "content": "Love this product! 😍",
    "user": {...},
    "created_at": "2024-01-15T10:45:00Z"
  }
}
```

**Validation:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Comment must be between 1 and 500 characters"
  }
}
```

---

### Delete Comment
```http
DELETE /reels/comments/:id
```

**Authorization:** Must be comment owner

**Response:** `204 No Content`

---

### Increment View Count
```http
POST /reels/:id/view
```

**Authorization:** Optional

**Response:** `200 OK`
```json
{
  "data": {
    "reel_id": "uuid",
    "views_count": 2342
  }
}
```

**Note:** View counts are incremented in Redis and synced to DB every 10 seconds.

---

## B2B Marketplace API

### List B2B Offers
```http
GET /b2b/offers
```

**Authorization:** Authenticated user (filtered by seller category)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `status` | enum | active, expired, closed, sold |
| `offer_type` | enum | negotiable, auction |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "seller_id": "uuid",
      "title": "Wholesale Perfume Collection - 100 units",
      "description": "Premium perfumes...",
      "images": ["https://cdn.zst.com/..."],
      "tags": ["perfume", "wholesale", "luxury"],
      "base_price": 500000.00,
      "min_quantity": 100,
      "available_quantity": 500,
      "offer_type": "negotiable",
      "status": "active",
      "target_category": "grossiste",
      "seller": {
        "id": "uuid",
        "full_name": "Import Pro",
        "seller_category": "importateur",
        "rating": 4.8
      },
      "ends_at": "2024-01-30T23:59:59Z",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 24
  }
}
```

**Visibility Rules:**
- **Importateurs** can sell to → Grossistes & Fournisseurs
- **Grossistes** can buy from Importateurs, sell to Fournisseurs
- **Fournisseurs** can buy from Grossistes

---

### Get B2B Offer by ID
```http
GET /b2b/offers/:id
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "Wholesale Perfume Collection",
    "description": "Premium perfumes...",
    "base_price": 500000.00,
    "min_quantity": 100,
    "available_quantity": 500,
    "offer_type": "auction",
    "status": "active",
    "current_bid": 520000.00,
    "highest_bidder_id": "uuid",
    "responses_count": 12,
    "ends_at": "2024-01-30T23:59:59Z",
    "seller": {...}
  }
}
```

---

### Create B2B Offer (Seller Only)
```http
POST /b2b/offers
```

**Authorization:** Must be Importateur or Grossiste

**Request Body:**
```json
{
  "title": "Wholesale Perfume Collection",
  "description": "Premium perfumes...",
  "images": ["uuid", "uuid"],
  "tags": ["perfume", "wholesale"],
  "base_price": 500000.00,
  "min_quantity": 100,
  "available_quantity": 500,
  "offer_type": "negotiable",
  "target_category": "grossiste",
  "ends_at": "2024-01-30T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "title": "Wholesale Perfume Collection",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Authorization Error:** `403 Forbidden`
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Only Importateurs and Grossistes can create B2B offers"
  }
}
```

---

### Submit B2B Response (Bid/Negotiation)
```http
POST /b2b/offers/:id/responses
```

**Authorization:** Must be eligible buyer (based on target_category)

**Request Body:**
```json
{
  "response_type": "bid",
  "amount": 520000.00,
  "quantity": 150,
  "message": "Interested in 150 units, can we negotiate delivery?"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "offer_id": "uuid",
    "buyer_id": "uuid",
    "response_type": "bid",
    "status": "pending",
    "amount": 520000.00,
    "quantity": 150,
    "message": "...",
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

**Validation Error:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid bid amount",
    "details": [
      {
        "field": "amount",
        "message": "Bid must be higher than current bid"
      }
    ]
  }
}
```

---

### Get My B2B Offers
```http
GET /b2b/my-offers
```

**Authorization:** Seller

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Wholesale Perfume Collection",
      "status": "active",
      "responses_count": 12,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get My B2B Responses
```http
GET /b2b/my-responses
```

**Authorization:** Buyer

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "offer": {
        "id": "uuid",
        "title": "Wholesale Perfume Collection",
        "seller": {...}
      },
      "response_type": "bid",
      "status": "pending",
      "amount": 520000.00,
      "created_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

## Seller Dashboard API

### Get Seller Stats
```http
GET /seller/stats
```

**Authorization:** Seller role

**Response:** `200 OK`
```json
{
  "data": {
    "total_sales": 1250000.00,
    "total_orders": 87,
    "total_products": 23,
    "pending_orders": 5,
    "monthly_revenue": 350000.00,
    "avg_rating": 4.7,
    "total_customers": 64,
    "conversion_rate": 12.5
  }
}
```

---

### Get Seller Analytics
```http
GET /seller/analytics
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | enum | 7d, 30d, 90d, 1y |
| `metric` | enum | revenue, orders, views |

**Response:** `200 OK`
```json
{
  "data": {
    "period": "30d",
    "metric": "revenue",
    "data_points": [
      {
        "date": "2024-01-01",
        "value": 12500.00
      },
      {
        "date": "2024-01-02",
        "value": 15000.00
      }
    ],
    "total": 450000.00,
    "average": 15000.00
  }
}
```

---

### Get Seller Products
```http
GET /seller/products
```

**Authorization:** Seller

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `status` | enum | active, draft, out_of_stock |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Chanel No. 5",
      "price": 12500.00,
      "in_stock": true,
      "views": 1523,
      "orders": 45,
      "revenue": 562500.00,
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 23
  }
}
```

---

### Get Seller Orders
```http
GET /seller/orders
```

**Authorization:** Seller

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `status` | enum | Filter by status |
| `date_from` | date | Filter from date |
| `date_to` | date | Filter to date |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ZST-1705315800-A3F2",
      "customer_name": "Ahmed Benali",
      "customer_phone": "+213555123456",
      "total": 37500.00,
      "status": "pending",
      "items_count": 3,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 87
  }
}
```

---

### Get Recent Orders
```http
GET /seller/orders/recent
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ZST-1705315800-A3F2",
      "customer_name": "Ahmed Benali",
      "total": 37500.00,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Users API

### Get Current User Profile
```http
GET /users/me
```

**Authorization:** Authenticated user

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "clerk_id": "user_xxxxx",
    "email": "user@example.com",
    "full_name": "Ahmed Benali",
    "avatar_url": "https://cdn.zst.com/avatars/...",
    "phone": "+213555123456",
    "wilaya": "Alger",
    "bio": "...",
    "role": "seller",
    "seller_category": "importateur",
    "is_verified": true,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Profile
```http
PATCH /users/me
```

**Request Body:**
```json
{
  "full_name": "Ahmed Benali",
  "phone": "+213555123456",
  "wilaya": "Alger",
  "bio": "Professional importer..."
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "full_name": "Ahmed Benali",
    "phone": "+213555123456",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### Register Push Notification Token
```http
POST /users/me/push-token
```

**Request Body:**
```json
{
  "push_token": "ExponentPushToken[xxxxx]"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "push_token": "ExponentPushToken[xxxxx]",
    "registered_at": "2024-01-15T12:00:00Z"
  }
}
```

---

## Freelance API

### List Freelance Services
```http
GET /freelance/services
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `category` | enum | Filter by category |
| `experience_level` | enum | Débutant, Intermédiaire, Expert |
| `min_price` | number | Minimum price |
| `max_price` | number | Maximum price |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "service_title": "Logo Design",
      "category": "Design Graphique",
      "experience_level": "Expert",
      "rating": 4.9,
      "reviews_count": 45,
      "price": 5000.00,
      "price_type": "fixed",
      "delivery_time": "3 jours",
      "provider": {
        "id": "uuid",
        "full_name": "Yacine Design",
        "avatar_url": "...",
        "is_verified": true
      }
    }
  ]
}
```

---

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [...]
  }
}
```

---

## Error Handling

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Invalid request format |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict |
| 422 | `VALIDATION_ERROR` | Validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

### Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "value": null
      },
      {
        "field": "price",
        "message": "Price must be greater than 0",
        "value": -100
      }
    ]
  }
}
```

---

## Pagination

### Query Parameters
```
page=1
limit=20
```

### Response Meta
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Link Header (Optional)
```http
Link: <https://api.zst.com/api/v1/products?page=2>; rel="next",
      <https://api.zst.com/api/v1/products?page=8>; rel="last"
```

---

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705316400
```

### Limits

| Tier | Requests/minute |
|------|-----------------|
| Anonymous | 60 |
| Authenticated | 100 |
| Seller | 200 |
| Admin | Unlimited |

### Rate Limit Exceeded
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 30
  }
}
```

---

## WebSocket Events (Real-time)

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.zst.com', {
  path: '/socket.io',
  auth: {
    token: 'your-clerk-jwt'
  }
});
```

### Events

#### Reel Interactions
```javascript
// Join reel room
socket.emit('reel:join', reelId);

// Listen for likes
socket.on('reel:liked', (data) => {
  // { reelId, userId, timestamp, likes_count }
});

// Listen for comments
socket.on('reel:commented', (data) => {
  // { reelId, comment: {...} }
});
```

#### Order Updates
```javascript
// Subscribe to order updates
socket.emit('order:subscribe', orderId);

// Listen for status changes
socket.on('order:status_changed', (data) => {
  // { orderId, status, timestamp }
});
```

#### Seller Notifications
```javascript
// Join seller room
socket.emit('seller:join', sellerId);

// Listen for new orders
socket.on('seller:new_order', (data) => {
  // { orderId, order_number, customer_name, total }
});
```

---

## Versioning

### Current Version
`v1`

### Breaking Changes Policy
- Major version changes for breaking changes
- Minor version changes for new features
- Patch version for bug fixes

### Version Header (Alternative)
```http
Accept: application/vnd.zst.v1+json
```

---

## CORS

### Allowed Origins
- `https://zst.com`
- `https://www.zst.com`
- `exp://` (Expo development)

### Allowed Methods
- GET, POST, PATCH, PUT, DELETE, OPTIONS

### Exposed Headers
- `X-RateLimit-*`
- `Link`
- `Content-Range`

---

## Best Practices

### Idempotency
Use `Idempotency-Key` header for POST requests:

```http
POST /orders
Idempotency-Key: unique-uuid

{ ... }
```

### Conditional Requests
Use `If-None-Match` with `ETag`:

```http
GET /products/123
If-None-Match: "abc123"

Response: 304 Not Modified (if unchanged)
```

### Partial Responses
Request specific fields:

```http
GET /products?fields=id,name,price
```

---

## Testing

### Health Check
```http
GET /health

{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 12345
}
```

### API Info
```http
GET /api/v1

{
  "version": "1.0.0",
  "endpoints": {
    "docs": "/api/docs",
    "health": "/health"
  }
}
```

---

## Additional Resources

- **Swagger Documentation**: https://api.zst.com/api/docs
- **Postman Collection**: [Download](https://api.zst.com/postman)
- **API Status**: https://status.zst.com

---

**Last Updated:** 2024-01-15
**Maintained by:** ZST Backend Team
