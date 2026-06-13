# Categories API

All category management endpoints are currently open. Admin role protection will be added in Sprint 12.

---

## GET /categories

Returns all categories sorted alphabetically.

**Success — 200**

```json
[
  { "id": "…", "name": "Electronics", "slug": "electronics", "createdAt": "…", "updatedAt": "…" },
  { "id": "…", "name": "Clothing",    "slug": "clothing",    "createdAt": "…", "updatedAt": "…" }
]
```

---

## POST /categories

Creates a new category. If `slug` is omitted it is auto-generated from `name`.

**Request body**

| Field | Type   | Required | Notes                             |
|-------|--------|----------|-----------------------------------|
| name  | string | ✓        | Category display name             |
| slug  | string | optional | Lowercase, hyphens only; auto-derived if absent |

**Success — 201** — Returns created category object.

**Errors**

| Status | Reason                        |
|--------|-------------------------------|
| 409    | Slug already exists           |
| 422    | Validation failed             |

---

## PUT /categories/:id

Updates a category's name and/or slug.

**Path param** — `id`: MongoDB ObjectId.

**Request body** — Same fields as POST, all optional.

**Success — 200** — Returns updated category object.

**Errors**

| Status | Reason                        |
|--------|-------------------------------|
| 404    | Category not found            |
| 409    | New slug conflicts with existing |

---

## DELETE /categories/:id

Deletes a category.

**Path param** — `id`: MongoDB ObjectId.

**Success — 200**

```json
{ "message": "Category deleted." }
```

**Errors**

| Status | Reason             |
|--------|--------------------|
| 404    | Category not found |

---

## Slug Format

Slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` — lowercase letters, numbers, and hyphens; no leading/trailing hyphens.
