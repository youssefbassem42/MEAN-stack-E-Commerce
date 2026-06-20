# Wishlist API Documentation

This document covers the database schema, features, and endpoints for the Wishlist system.

---

## Database Schema

Wishlists are stored in the `wishlists` collection in MongoDB.

### Collection Schema (`Wishlist`)

| Field | Type | Description | Constraints |
|---|---|---|---|
| `userId` | ObjectId | Reference to the `User` owner of the wishlist. | Required, Unique, Indexed |
| `products` | Array | List of product references saved in the wishlist. | Required |
| `products[]` | ObjectId | Reference to a `Product` document. | Required |

---

## API Endpoints

All endpoints require a valid bearer JWT access token in the `Authorization` header.

### 1. Get or Create Wishlist
* **Endpoint:** `GET /wishlist`
* **Access:** Private

**Success Response — 200 OK**
```json
{
  "_id": "603d4f…",
  "userId": "603d1a…",
  "products": [
    {
      "id": "603d2e…",
      "title": "Smart Phone Y",
      "price": 150.0,
      "images": ["/images/phone-y.jpg"],
      "stock": 10
    }
  ],
  "createdAt": "2026-06-19T20:00:00.000Z",
  "updatedAt": "2026-06-19T20:00:00.000Z"
}
```

---

### 2. Add Product to Wishlist
* **Endpoint:** `POST /wishlist`
* **Access:** Private

**Request Body**
```json
{
  "productId": "603d2e…"
}
```

**Success Response — 200 OK**
Returns the updated wishlist object containing the newly added product.

---

### 3. Remove Product from Wishlist
* **Endpoint:** `DELETE /wishlist/:id` (where `:id` is the product ID)
* **Access:** Private

**Success Response — 200 OK**
Returns the updated wishlist object with the product removed.

---

### 4. Move Product to Cart
* **Endpoint:** `POST /wishlist/move-to-cart`
* **Access:** Private

Adds the product to the user's shopping cart (quantity 1, or increments if already in cart), removes it from the user's wishlist, and returns the updated wishlist.

**Request Body**
```json
{
  "productId": "603d2e…"
}
```

**Success Response — 200 OK**
Returns the updated wishlist object with the product removed.

---

### 5. Move All Products to Cart
* **Endpoint:** `POST /wishlist/move-all`
* **Access:** Private

Adds all products in the wishlist to the user's shopping cart, clears the wishlist products array, and returns the updated wishlist.

**Success Response — 200 OK**
Returns the updated empty wishlist object:
```json
{
  "_id": "603d4f…",
  "userId": "603d1a…",
  "products": []
}
```
