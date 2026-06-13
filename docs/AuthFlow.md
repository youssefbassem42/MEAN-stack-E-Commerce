# Auth Flow

End-to-end description of every authentication flow implemented in Sprint 1.

---

## 1. Registration & Email Verification

```
User fills register form
  → POST /auth/register
  → Backend hashes password with bcrypt (cost 12)
  → Creates User document (isEmailVerified: false)
  → Generates random token, hashes it, stores in EmailVerifications
  → Sends verification email via Brevo with token link
  → Returns 201 with message

User opens email, clicks link (?token=…)
  → Browser opens /auth/verify-email?token=…
  → Frontend auto-calls POST /auth/verify-email
  → Backend hashes token, looks up EmailVerifications
  → Checks: not expired, not already used
  → Sets user.isEmailVerified = true
  → Marks verification record as used
  → Returns 200

User can now log in.
```

---

## 2. Login

```
User submits login form
  → POST /auth/login
  → Backend normalises email (trim + lowercase)
  → Finds user by email
  → Checks isEmailVerified — rejects with 403 if false
  → Compares password with bcrypt
  → Issues JWT accessToken (short-lived) + refreshToken (long-lived)
  → Stores hash of refreshToken on user document
  → Returns 200 with tokens and user object

Frontend stores tokens in localStorage.
AccessToken is sent in Authorization header for protected routes.
```

---

## 3. Logout

```
User triggers logout
  → POST /auth/logout { refreshToken }
  → Backend verifies refresh token signature
  → Finds user by userId in token payload
  → Clears refreshTokenHash from user document
  → Returns 200

Frontend clears localStorage and redirects to /auth/login.
```

---

## 4. Resend Verification Email

```
Unverified user requests resend
  → POST /auth/resend-verification { email }
  → Backend verifies user exists and is not yet verified
  → Deletes old EmailVerification record for this user
  → Creates new record with fresh token and TTL
  → Sends new email via Brevo
  → Returns 200
```

---

## 5. Forgot Password

```
User clicks "Forgot password"
  → Enters email on /auth/forgot-password
  → POST /auth/forgot-password { email }
  → Backend looks up user — returns generic success even if not found (anti-enumeration)
  → If user exists: generates reset token, stores hash in PasswordResets, sends email
  → Returns 200 with generic message
```

---

## 6. Reset Password

```
User opens reset email, clicks link (?token=…)
  → Browser opens /auth/reset-password?token=…
  → User enters and confirms new password
  → POST /auth/reset-password { token, password }
  → Backend hashes token, looks up PasswordResets
  → Checks: not expired, not already used
  → Hashes new password, updates user document
  → Clears refreshTokenHash (invalidates all sessions)
  → Marks reset record as used
  → Returns 200
```

---

## Token Strategy

| Token        | Storage              | TTL       | Purpose                        |
|--------------|----------------------|-----------|--------------------------------|
| accessToken  | localStorage         | Short     | Authorise API requests         |
| refreshToken | localStorage + DB hash | Long   | Exchange for new access tokens |
| verifyToken  | Email link only      | Configurable (env) | One-time email verification |
| resetToken   | Email link only      | Configurable (env) | One-time password reset     |

---

## Security Measures

- Passwords hashed with **bcrypt** (cost 12)
- Sensitive tokens stored as **SHA-256 hashes** in the database
- Rate limiting on register, login, and recovery endpoints
- `express-validator` input validation on every route
- Anti-enumeration response on `/auth/forgot-password`
- Refresh token invalidated on logout and password reset
