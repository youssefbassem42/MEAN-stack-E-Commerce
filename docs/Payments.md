# Payments Implementation Documentation

This document explains the technical flow, payment calculation formulas, and state lifecycle transitions of the Payment and Checkout system.

---

## Architecture Flow

The payment flow leverages **Stripe Payment Intents** in combination with local Mongoose models to capture transaction logs securely.

```mermaid
sequenceDiagram
    autonumber
    actor User as Buyer (Frontend)
    participant API as API Server
    participant DB as MongoDB
    participant Stripe as Stripe API

    User->>API: POST /checkout
    activate API
    API->>DB: Fetch user Cart
    API->>DB: Create Order (status: 'pending')
    API->>Stripe: stripe.paymentIntents.create (amount, metadata)
    Stripe-->>API: Return client_secret & intentId
    API->>DB: Save Payment record (status: 'pending')
    API->>DB: Clear user Cart
    API-->>User: Return clientSecret & orderId
    deactivate API

    Note over User, Stripe: User inputs card detail & submits payment directly to Stripe

    Stripe->>API: POST /webhooks/stripe (payment_intent.succeeded)
    activate API
    API->>API: Verify webhook signature
    API->>DB: Update Payment record (status: 'succeeded')
    API->>DB: Update Order status to 'paid'
    API-->>Stripe: 200 OK (received: true)
    deactivate API
```

---

## Database Schemas

### 1. Payment Schema (`PaymentModel`)
Tracks Stripe payment intent transactions.

| Field | Type | Description |
|---|---|---|
| `orderId` | ObjectId | Reference to the associated Order document. |
| `paymentIntentId` | String | Unique Stripe Payment Intent Identifier. |
| `amount` | Number | Total transaction value in EGP. |
| `status` | String | Transaction status: `pending`, `succeeded`, `failed`. |

### 2. Order Schema Updates (`OrderModel`)
Orders are initialized as `pending` upon checkout creation, and transitioned by Stripe webhook outcomes:
- **Success:** Status transitions to `paid`.
- **Failure:** Status transitions to `failed`.

---

## Webhook Signature Verification

The webhook endpoint verifies all incoming Stripe events securely using Stripe's native HMAC-SHA256 signature verification helper. Express parses raw buffers using customized verify middleware:

```typescript
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
```
This enables `stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret)` to run correctly.
