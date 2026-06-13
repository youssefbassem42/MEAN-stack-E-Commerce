# Architecture

## Overview

The project is split into independent frontend and backend applications to keep deployment boundaries clear while preserving a consistent roadmap across sprints.

## Backend

The backend follows Clean Architecture with five top-level layers:

- `domain`: enterprise entities and core contracts
- `application`: use cases and business orchestration
- `infrastructure`: framework and persistence integrations
- `presentation`: HTTP controllers and route composition
- `shared`: cross-cutting middleware, errors, and helpers

Request flow:

1. An Express route in `presentation/http/routes` receives the request.
2. Controllers delegate to `application` use cases.
3. Use cases operate on `domain` types and consume `infrastructure` services.
4. Shared middleware handles validation, errors, and fallback responses.

## Frontend

The frontend uses standalone Angular components with routing and a layout-first structure:

- `core`: singleton services, config, and interceptors
- `layout`: reusable shell and navigation structure
- `features`: page-level features grouped by business capability
- `environments`: runtime endpoint configuration

UI flow:

1. `App` initializes providers and global services.
2. `ShellComponent` provides the persistent layout.
3. Feature routes lazy-load business pages.
4. `ApiService` centralizes HTTP access through a base URL interceptor.
5. `ThemeService` manages the user theme state across the application.

## Cross-Sprint Direction

- Authentication and session handling will extend the `core` service layer and backend application services in Sprint 1.
- Profile, catalog, cart, wishlist, checkout, and admin features will be added as isolated vertical slices under `features/` and matching backend modules.
- MongoDB collections will be introduced per sprint without breaking the existing layer boundaries.
