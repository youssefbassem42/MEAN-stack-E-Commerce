# Profile API

All profile and address endpoints require a valid **JWT access token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

---

## GET /profile

Returns the authenticated user's profile.

**Success — 200**

```json
{
  "id": "…",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "createdAt": "2026-06-01T00:00:00.000Z"
}
```

---

## PUT /profile

Updates first and/or last name.

**Request body**

| Field     | Type   | Required | Constraints   |
|-----------|--------|----------|---------------|
| firstName | string | optional | Non-empty     |
| lastName  | string | optional | Non-empty     |

**Success — 200** — Returns updated profile object.

---

## PUT /profile/change-password

Changes the user's password. Invalidates all active sessions (clears `refreshTokenHash`).

**Request body**

| Field           | Type   | Required | Constraints        |
|-----------------|--------|----------|--------------------|
| currentPassword | string | ✓        |                    |
| newPassword     | string | ✓        | Min. 8 characters  |

**Success — 200**

```json
{ "message": "Password changed successfully. Please log in again." }
```

**Errors**

| Status | Reason                         |
|--------|--------------------------------|
| 400    | Current password is incorrect  |
| 401    | Not authenticated              |

---

## GET /addresses

Returns all saved addresses for the authenticated user, sorted by default first.

**Success — 200**

```json
[
  {
    "id": "…",
    "userId": "…",
    "city": "Cairo",
    "street": "123 Main St",
    "building": "Block 7",
    "apartment": "Apt 4B",
    "isDefault": true,
    "createdAt": "…",
    "updatedAt": "…"
  }
]
```

---

## POST /addresses

Creates a new address. If `isDefault` is `true`, all other addresses for this user are unset as default.

**Request body**

| Field     | Type    | Required | Notes                          |
|-----------|---------|----------|--------------------------------|
| city      | string  | ✓        |                                |
| street    | string  | ✓        |                                |
| building  | string  | ✓        |                                |
| apartment | string  | ✓        |                                |
| isDefault | boolean | optional | Defaults to `false`            |

**Success — 201** — Returns created address object.

---

## PUT /addresses/:id

Updates an existing address. Only the owner may update.

**Path param** — `id`: MongoDB ObjectId of the address.

**Request body** — Same fields as POST, all optional.

**Success — 200** — Returns updated address object.

**Errors**

| Status | Reason                    |
|--------|---------------------------|
| 403    | Address belongs to another user |
| 404    | Address not found         |

---

## DELETE /addresses/:id

Deletes an address. Only the owner may delete.

**Path param** — `id`: MongoDB ObjectId of the address.

**Success — 200**

```json
{ "message": "Address deleted." }
```
