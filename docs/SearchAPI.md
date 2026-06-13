# Search & Discovery API Documentation

This document outlines the API specification and implementation details for the search, filtering, and sorting systems.

---

## Backend APIs

### Search Products
* **Endpoint:** `GET /products/search`
* **Access:** Public

**Query Parameters**

| Field | Type | Description |
|---|---|---|
| `q` | string | Search query string (searches indexes on `title` and `description`). |
| `category` | string | Category slug or 24-character hex ID. |
| `minPrice` | number | Optional minimum product price (non-negative). |
| `maxPrice` | number | Optional maximum product price (non-negative). |
| `sort` | string | Options: `newest` (default), `oldest`, `price_asc`, `price_desc`, `relevance` (only if `q` is active). |
| `page` | number | Page number for pagination (starts at 1). |
| `limit` | number | Maximum products per page (1–100, default: 20). |

**Success — 200**

```json
{
  "data": [
    {
      "id": "603d2e…",
      "title": "Alpha Wireless Headphone",
      "slug": "alpha-wireless-headphone",
      "price": 199.99,
      "stock": 10,
      "description": "Premium sound quality.",
      "images": ["https://…"],
      "categoryId": "603d2f…",
      "tags": ["audio", "wireless"],
      "createdAt": "2026-06-19T00:00:00.000Z",
      "updatedAt": "2026-06-19T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

## Database Performance & Indexing

To support fast discovery on large datasets, the following MongoDB indexes have been configured:

1. **Text Index:** Created on `title` and `description` to enable full-text keyword queries.
   ```javascript
   productSchema.index({ title: 'text', description: 'text' });
   ```
2. **Price Index:** Created on `price` to optimize range requests and sorting.
   ```javascript
   productSchema.index({ price: 1 });
   ```
3. **Category Reference Index:** Existing index on `categoryId` optimizes category filtering.

---

## Frontend Integration

### Debounced Search Input
* Utilizes RxJS `debounceTime(300)` and `distinctUntilChanged()` to throttle search requests as the user types, minimizing backend API load.

### Filters Sidebar
* Incorporates reactive min/max price range forms, category select toggles, and sorting options.
* Synchronizes filter states with active browser route queries (`?q=...&category=...&minPrice=...`). This allows users to bookmark search results or copy links directly.

### Pagination
* Displays standard numeric navigation buttons with disabled limits depending on the total query counts.
