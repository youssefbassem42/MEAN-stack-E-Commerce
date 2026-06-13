# E-Commerce Platform

Sprint 0 establishes the production foundation for a full-stack e-commerce platform built with Angular, Tailwind CSS, Node.js, Express, MongoDB Atlas, Brevo, Stripe, and Clean Architecture.

## Workspace Layout

- `backend/`: Express API with Clean Architecture layers.
- `frontend/`: Angular storefront shell with Tailwind, routing, theme support, and reusable API service.
- `Sprints/`: delivery roadmap used to drive implementation sprint by sprint.

## Prerequisites

- Node.js `24.x`
- npm `11.x`
- MongoDB Atlas connection string for backend runtime validation

## Environment

Create `backend/.env` from `backend/.env.example`.

Required values:

- `PORT`
- `CLIENT_ORIGIN`
- `MONGODB_URI`

## Development Commands

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend:

```bash
npm run dev:frontend
```

Build both applications:

```bash
npm run build:backend
npm run build:frontend
```

Run tests:

```bash
npm run test:backend
npm run test:frontend
```

## Sprint 0 Scope

- Express backend foundation with Clean Architecture folders
- Environment, security, logging, validation, and MongoDB bootstrap
- Centralized API error handling
- `GET /health` endpoint
- Angular application bootstrap with Tailwind, routing, layout shell, theme service, and API service layer
- Core documentation for architecture and folder structure
