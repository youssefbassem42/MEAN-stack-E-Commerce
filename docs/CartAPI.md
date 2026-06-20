# Cart API Documentation

This document covers the database schema, calculations, and endpoints for the Shopping Cart system.

---

## Database Schema

Carts are stored in the `carts` collection in MongoDB.

### Collection Schema (`Cart`)

| Field | Type | Description | Constraints |
|---|---|---|---|
| `userId` | ObjectId | Reference to the `User` owner of the cart. | Required, Unique, Indexed |
| `items` | Array | List of product items in the cart. | Required |
| `items[].productId` | ObjectId | Reference to the `Product` in the cart. | Required |
| `items[].quantity` | Number | Quantity of the product. | Required, Min: 1 |
| `shippingMethod` | String | Shipping payment method (`COD` or `CARD`). | Required, Default: `COD` |

---

## Business & Calculation Rules

### Calculations Formula

1. **Subtotal:**
   $$\text{subtotal} = \sum (\text{product.price} \times \text{item.quantity})$$

2. **VAT:**
   $$\text{vat} = \text{subtotal} \times 0.15 \quad (15\%)$$

3. **Shipping Fee:**
   - Cash On Delivery (`COD`): **50 EGP**
   - Card Payment (`CARD`): **0 EGP** (Free Shipping)

4. **Grand Total:**
   $$\text{grandTotal} = \text{subtotal} + \text{vat} + \text{shipping}$$

---

## API Endpoints

All endpoints require a valid bearer JWT access token in the `Authorization` header.

### 1. Get or Create Cart
* **Endpoint:** `GET /cart`
* **Access:** Private

**Success Response — 200 OK**
```json
{
  "_id": "603d4e…",
  "userId": "603d1a…",
  "items": [
    {
      "productId": {
        "id": "603d2e…",
        "title": "Smart Phone X",
        "price": 100.0,
        "images": ["/images/phone.jpg"],
        "stock": 10
      },
      "quantity": 2,
      "_id": "603d4f…"
    }
  ],
  "shippingMethod": "COD",
  "subtotal": 200.0,
  "vat": 30.0,
  "shipping": 50,
  "grandTotal": 280.0,
  "createdAt": "2026-06-19T20:00:00.000Z",
  "updatedAt": "2026-06-19T20:00:00.000Z"
}
```

---

### 2. Add Item to Cart
* **Endpoint:** `POST /cart/items`
* **Access:** Private

**Request Body**
```json
{
  "productId": "603d2e…",
  "quantity": 1
}
```

**Success Response — 200 OK**
Returns the updated cart object containing the newly added item and recalculated totals.

---

### 3. Update Cart Item Quantity
* **Endpoint:** `PUT /cart/items/:id` (where `:id` is the product ID)
* **Access:** Private

**Request Body**
```json
{
  "quantity": 3
}
```

**Success Response — 200 OK**
Returns the updated cart object with the modified item quantity and recalculated totals.

---

### 4. Delete Cart Item
* **Endpoint:** `DELETE /cart/items/:id` (where `:id` is the product ID)
* **Access:** Private

**Success Response — 200 OK**
Returns the updated cart object with the item removed and recalculated totals.

---

### 5. Update Shipping Method
* **Endpoint:** `PUT /cart/shipping`
* **Access:** Private

**Request Body**
```json
{
  "shippingMethod": "CARD"
}
```

**Success Response — 200 OK**
Returns the updated cart object with the updated shipping method and recalculated totals (e.g., shipping fee set to `0`).
