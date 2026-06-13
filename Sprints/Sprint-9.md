Goal:
Implement payments.

Features:

- Checkout
- Stripe
- Webhooks

Tasks:

Collections:
Orders
Payments

Endpoints:

POST /checkout

POST /webhooks/stripe

Requirements:

Create Payment Intent

Verify Stripe Signature

Update Order Status

Testing:

Successful Payment
✓ order paid

Failed Payment
✓ order failed

Webhook Triggered
✓ updates order

Documentation:

Payments.md
StripeSetup.md

Definition of Done:
Payment workflow complete.
