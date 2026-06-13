# Auth API

Base URL: `http://localhost:3000`

All auth endpoints are prefixed with `/auth`.

---

## POST /auth/register

Creates a new user account and sends a verification email.

**Request body**

| Field       | Type   | Required | Constraints           |
|-------------|--------|----------|-----------------------|
| firstName   | string | ✓        | Non-empty             |
| lastName    | string | ✓        | Non-empty             |
| email       | string | ✓        | Valid email           |
| password    | string | ✓        | Min. 8 characters     |

**Success — 201**

```json
{
  "message": "Registration successful. Verification email sent.",
  "user": { "id": "…", "email": "…", "firstName": "…", "lastName": "…" }
}
```

**Errors**

| Status | Reason                  |
|--------|-------------------------|
| 409    | Email already in use    |
| 422    | Validation failed        |
| 429    | Rate limit exceeded      |

---

## POST /auth/login

Authenticates a verified user and returns JWT tokens.

**Request body**

| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | ✓        |
| password | string | ✓        |

**Success — 200**

```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<token>",
  "user": { "id": "…", "email": "…", "firstName": "…", "lastName": "…" }
}
```

**Errors**

| Status | Reason                       |
|--------|------------------------------|
| 401    | Invalid credentials          |
| 403    | Email not verified           |
| 429    | Rate limit exceeded          |

---

## POST /auth/logout

Invalidates the refresh token stored server-side.

**Request body**

| Field        | Type   | Required |
|--------------|--------|----------|
| refreshToken | string | ✓        |

**Success — 200**

```json
{ "message": "Logged out successfully." }
```

---

## POST /auth/verify-email

Marks the user's email as verified using the token from the verification email.

**Request body**

| Field | Type   | Required |
|-------|--------|----------|
| token | string | ✓        |

**Success — 200**

```json
{ "message": "Email verified successfully." }
```

**Errors**

| Status | Reason                        |
|--------|-------------------------------|
| 400    | Token invalid, expired, or used |

---

## POST /auth/resend-verification

Re-issues and resends a verification email.

**Request body**

| Field | Type   | Required |
|-------|--------|----------|
| email | string | ✓        |

**Success — 200**

```json
{ "message": "Verification email resent." }
```

---

## POST /auth/forgot-password

Initiates a password reset flow by sending a reset link. Always returns a generic message to prevent user enumeration.

**Request body**

| Field | Type   | Required |
|-------|--------|----------|
| email | string | ✓        |

**Success — 200**

```json
{ "message": "If the account exists, a reset email has been sent." }
```

---

## POST /auth/reset-password

Sets a new password using the token from the reset email.

**Request body**

| Field    | Type   | Required | Constraints       |
|----------|--------|----------|-------------------|
| token    | string | ✓        |                   |
| password | string | ✓        | Min. 8 characters |

**Success — 200**

```json
{ "message": "Password reset successfully." }
```

**Errors**

| Status | Reason                        |
|--------|-------------------------------|
| 400    | Token invalid, expired, or used |

---

## Rate Limits

| Route                     | Window  | Max Requests |
|---------------------------|---------|--------------|
| POST /auth/register       | 15 min  | 5            |
| POST /auth/login          | 15 min  | 10           |
| POST /auth/forgot-password| 15 min  | 5            |
| POST /auth/reset-password | 15 min  | 5            |
