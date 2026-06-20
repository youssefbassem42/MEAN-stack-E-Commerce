# 🪐 Z-A E-Commerce Platform
> **The Luxury Full-Stack Storefront & Administration Ecosystem**

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)

Welcome to **Z-A**, a state-of-the-art full-stack e-commerce solution. This platform is engineered with a strict adherence to **Clean Architecture** patterns on the backend and **Standalone Component-driven Architecture** on the frontend, wrapped inside a bespoke glassmorphic slate-indigo design system.

---

## 💎 Features & Capabilities

* **🔒 Role-Based Access Control (RBAC):** Fully secured admin administration panel allowing verified administrators to manage system statistics, modify user role levels, monitor catalog products, and process orders.
* **📦 Real-time Inventory Audit Logging:** Built-in automated transaction tracking (`purchase`, `cancel`, `restock`, `adjustment`) logging stock levels on checkout and automatically restoring stock on order cancellations.
* **💳 Seamless Checkout Flow:** Dual payment integration supporting both Cash on Delivery (COD) checkouts with dynamic fee computations and instant credit card processing through Stripe with full asynchronous Webhook verification.
* **🚀 Real-time Viewer Counts:** Integrates with Socket.io on the product detail pages, showing the real-time active customer viewers count on catalog items.
* **✨ Reusable Shell Layout:** Global dark and light theme toggles with smooth transition animations, premium typography, responsive layouts, and unified glassmorphic elements.

---

## 🏛 Clean Architecture & Workspace Layout

The repository utilizes a modular structure, keeping domain business rules completely decoupled from infrastructure databases, user interfaces, or payment gateways.

```
├── backend/
│   ├── src/
│   │   ├── domain/               # Core business entities
│   │   ├── application/          # Application use-cases and ports/interfaces
│   │   ├── infrastructure/       # Database models, security utilities, Stripe
│   │   ├── presentation/         # HTTP routes and controllers
│   │   └── shared/               # Centralized error handling and middlewares
│   └── tests/                    # Backend integration test suites
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # Route guards, authentication, interceptors
│   │   │   ├── features/         # Catalog, cart, checkout, admin dashboard
│   │   │   └── layout/           # Global navigation shell and theme toggles
│   │   └── styles.css            # Bespoke design system tokens
│
└── Sprints/                      # Delivery roadmap and sprint backlogs
```

---

## ⚙️ Prerequisites & Environment Setup

Ensure you have the following prerequisites installed:
* **Node.js** `24.x` (or newer)
* **npm** `11.x` (or newer)
* **MongoDB** instance (local server or Atlas connection string)

### Environment Configurations

Configure your local environments by copying the example env file:
```bash
cp backend/.env.example backend/.env
```

Within `backend/.env`, populate the required variables:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce
ACCESS_TOKEN_SECRET=your-super-secret-access-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🛠 Running the Development Workspace

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Backend Dev Server:**
   ```bash
   npm run dev:backend
   ```
   *The API will boot up on [http://localhost:3000](http://localhost:3000).*

3. **Start Frontend Dev Server:**
   ```bash
   npm run dev:frontend
   ```
   *The storefront will boot up on [http://localhost:4200](http://localhost:4200).*

---

## 🧪 Testing Pipeline

The repository features comprehensive integration test suites with 50 passing backend tests.

To run the complete test pipeline:
```bash
# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend
```

---

## 📸 Visual Showcase

### Live Admin Dashboard Overview
*Real-time stats tracking, user role toggling, inventory auditing logs, and order lifecycle management.*

![Admin Dashboard](/home/youssef/.gemini/antigravity/brain/16fdd0e3-09dc-4a06-82d0-39e88be4e05a/admin_dashboard_1781968002889.png)
