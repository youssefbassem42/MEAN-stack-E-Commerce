# Folder Structure

## Repository

```text
.
|-- Architecture.md
|-- FolderStructure.md
|-- README.md
|-- Sprints/
|-- backend/
`-- frontend/
```

## Backend

```text
backend/
|-- src/
|   |-- application/
|   |   `-- use-cases/
|   |-- domain/
|   |   `-- entities/
|   |-- infrastructure/
|   |   |-- config/
|   |   `-- database/
|   |-- presentation/
|   |   `-- http/
|   |       |-- controllers/
|   |       `-- routes/
|   `-- shared/
|       |-- errors/
|       `-- middleware/
|-- .env.example
|-- package.json
`-- tsconfig.json
```

## Frontend

```text
frontend/
|-- src/
|   |-- app/
|   |   |-- core/
|   |   |   |-- config/
|   |   |   |-- interceptors/
|   |   |   `-- services/
|   |   |-- features/
|   |   |   `-- home/
|   |   |-- layout/
|   |   `-- app.routes.ts
|   `-- environments/
|-- angular.json
|-- package.json
`-- .postcssrc.json
```

## Conventions

- Backend route composition stays inside `presentation`; business rules stay inside `application`.
- Shared middleware and errors stay framework-agnostic where possible.
- Frontend features must be lazy-loadable and should depend on `core` abstractions rather than each other.
- Styling is centralized in Tailwind utilities plus global design tokens in `src/styles.css`.
