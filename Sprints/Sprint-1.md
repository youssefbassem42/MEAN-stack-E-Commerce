Goal:
Implement complete authentication system.

Features:

- Register
- Login
- Email Verification
- Resend Verification
- Forgot Password
- Reset Password
- Logout

Tasks:

Backend:

Create collections:

- Users
- EmailVerifications
- PasswordResets

Implement:

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/verify-email
POST /auth/resend-verification
POST /auth/forgot-password
POST /auth/reset-password

Requirements:

Register:

- hash password
- create verification token
- send Brevo email

Login:

- JWT Access Token
- Refresh Token

Email Verification:

- token expiration

Forgot Password:

- reset token expiration

Security:

- bcrypt
- rate limiting
- validation

Frontend:

Create pages:

- login
- register
- forgot-password
- reset-password
- verify-email

Testing:

Register:
✓ creates user

Duplicate Email:
✓ rejected

Login:
✓ returns token

Unverified User:
✓ blocked

Verify Email:
✓ activates account

Forgot Password:
✓ sends email

Reset Password:
✓ changes password

Documentation:

AuthAPI.md
AuthFlow.md

Definition of Done:
All auth endpoints tested successfully.
