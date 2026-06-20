# Stripe Setup Guide

This document describes how to configure Stripe API keys and local webhook handlers for local development and testing.

---

## 1. Environment Configurations

Configure the following variables in your local `.env` file:

```env
# Stripe API Keys (obtain from Dashboard -> Developers -> API Keys)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 2. Setting Up Local Webhook Tunneling

Since Stripe webhooks are triggered from Stripe's cloud server to your local development machine, you must run a proxy tunnel to route these calls locally.

### Step 1: Install Stripe CLI
Install the Stripe CLI on your system:
- **macOS (via Homebrew):** `brew install stripe/stripe-cli/stripe`
- **Linux / Debian / Ubuntu:** Refer to the official Stripe CLI documentation to install via `apt`.

### Step 2: Login to Stripe CLI
Run the authentication command:
```bash
stripe login
```

### Step 3: Forward Webhook Events
Forward webhook events from Stripe to your local Express server endpoint `/webhooks/stripe`:
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```
Once started, the CLI will output a local webhook signing secret starting with `whsec_`. Copy this key and set it as your `STRIPE_WEBHOOK_SECRET` environment variable in `.env`.

---

## 3. Simulating Webhooks during testing

For automated testing, mock headers and signatures can be generated dynamically:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(env.stripeSecretKey);

const payload = JSON.stringify({
  id: 'evt_test_success',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_mock_123',
      object: 'payment_intent',
      amount: 34500,
      currency: 'egp',
      status: 'succeeded',
    },
  },
});

const header = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: env.stripeWebhookSecret,
});

// Set 'Stripe-Signature' request header to 'header' value
```
This is fully tested and integrated in our `payment.routes.test.ts` file.
