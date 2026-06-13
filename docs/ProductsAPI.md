# Products API

All product management endpoints are currently open. Admin role protection will be added in Sprint 12.

---

## GET /products

Returns a paginated list of products. Optionally filter by category.

**Query parameters**

| Param      | Type   | Default | Notes                              |
|------------|--------|---------|------------------------------------|
| categoryId | string | —       | MongoDB ObjectId; filters by category |
| page       | number | 1       | Page number (≥ 1)                  |
| limit      | number | 20      | Items per page (1–100)             |

**Success — 200**

```json
{
  "data": [
    {
      "id": "…",
      "title": "Wireless Headphones",
      "slug": "wireless-headphones",
      "price": 299.99,
      "stock": 42,
      "description": "…",
      "images": ["https://…"],
      "categoryId": "…",
      "tags": ["audio", "wireless"],
      "createdAt": "…",
      "updatedAt": "…"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

## GET /products/:id

Returns a single product by ID.

**Path param** — `id`: MongoDB ObjectId.

**Success — 200** — Returns product object.

**Errors**

| Status | Reason            |
|--------|-------------------|
| 404    | Product not found |

---

## POST /products

Creates a new product. Slug is auto-generated from `title` if not provided.

**Request body**

| Field       | Type     | Required | Constraints                         |
|-------------|----------|----------|-------------------------------------|
| title       | string   | ✓        | Non-empty                           |
| slug        | string   | optional | Lowercase + hyphens; auto-derived   |
| price       | number   | ✓        | ≥ 0                                 |
| stock       | number   | optional | ≥ 0, defaults to 0                  |
| description | string   | ✓        | Non-empty                           |
| images      | string[] | optional | Array of valid URLs                 |
| categoryId  | string   | ✓        | Valid MongoDB ObjectId of a category|
| tags        | string[] | optional | Array of strings                    |

**Success — 201** — Returns created product object.

**Errors**

| Status | Reason                            |
|--------|-----------------------------------|
| 404    | Referenced category not found     |
| 409    | Slug already in use               |
| 422    | Validation failed                 |

---

## PUT /products/:id

Updates a product. All fields are optional.

**Path param** — `id`: MongoDB ObjectId.

**Request body** — Same fields as POST, all optional.

**Success — 200** — Returns updated product object.

**Errors**

| Status | Reason                            |
|--------|-----------------------------------|
| 404    | Product or referenced category not found |
| 409    | New slug conflicts with existing  |

---

## DELETE /products/:id

Deletes a product.

**Path param** — `id`: MongoDB ObjectId.

**Success — 200**

```json
{ "message": "Product deleted." }
```

**Errors**

| Status | Reason            |
|--------|-------------------|
| 404    | Product not found |

---

## Auto-slug Generation

If `slug` is omitted on create/update, the service derives it from `title`:

1. Trim and lowercase
2. Remove non-word characters
3. Replace whitespace / underscores with `-`
4. Strip leading/trailing hyphens

Example: `"Wireless Headphones!"` → `"wireless-headphones"`
