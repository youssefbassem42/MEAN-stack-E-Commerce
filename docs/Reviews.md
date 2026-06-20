# Reviews System Documentation

This document covers the database schema, business rules, API endpoints, and validation requirements for the product reviews system.

---

## Database Schema

Reviews are stored in the `reviews` collection in MongoDB.

### Fields

| Field | Type | Description | Constraints |
|---|---|---|---|
| `productId` | ObjectId | Reference to the `Product` being reviewed. | Required, Index |
| `userId` | ObjectId | Reference to the `User` who wrote the review. | Required, Index |
| `rating` | Number | Integer rating between 1 and 5. | Required, Min: 1, Max: 5 |
| `comment` | String | Written comment review. | Required, Trimmed |
| `createdAt` | Date | Auto-generated timestamp. | Read-Only |
| `updatedAt` | Date | Auto-generated timestamp. | Read-Only |

---

## Business & Security Rules

1. **Only Verified Buyers Can Review:**
   - When a user submits a review, the server checks the `orders` collection.
   - The user must have a completed order (status `'delivered'` or `'paid'`) that contains the target `productId`.
   - If no eligible order is found, a `403 Forbidden` response is returned.

2. **One Review Per Product:**
   - A user can only submit one review per product. Subsequent submissions return a `409 Conflict` response.

3. **Authentication Required:**
   - Writing a review (`POST /reviews`) requires a valid bearer JWT access token.
   - Fetching reviews (`GET /reviews/:productId`) is public.

---

## API Endpoints

### 1. Submit a Review
* **Endpoint:** `POST /reviews`
* **Access:** Private (Authenticated User)

**Request Body**
```json
{
  "productId": "603d2e…",
  "rating": 5,
  "comment": "Exceptional quality. Exceeded expectations!"
}
```

**Success Response — 201 Created**
```json
{
  "id": "603d3f…",
  "productId": "603d2e…",
  "userId": "603d1a…",
  "rating": 5,
  "comment": "Exceptional quality. Exceeded expectations!",
  "createdAt": "2026-06-19T20:00:00.000Z",
  "updatedAt": "2026-06-19T20:00:00.000Z"
}
```

---

### 2. Get Product Reviews
* **Endpoint:** `GET /reviews/:productId`
* **Access:** Public

**Success Response — 200 OK**
```json
[
  {
    "id": "603d3f…",
    "productId": "603d2e…",
    "userId": {
      "id": "603d1a…",
      "firstName": "John",
      "lastName": "Buyer",
      "email": "buyer@example.com"
    },
    "rating": 5,
    "comment": "Exceptional quality. Exceeded expectations!",
    "createdAt": "2026-06-19T20:00:00.000Z"
  }
]
```
