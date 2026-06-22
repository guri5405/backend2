# Property Rental Management System — API

A REST API for a property rental platform. Landlords list properties and review applications;
tenants browse listings and apply. Approving an application atomically marks the property as
rented and rejects all other pending applications for it.

Built with **Node.js**, **Express**, **TypeScript** (strict mode), **PostgreSQL**, **Knex**, and **JWT** auth.

## Features

- JWT-based authentication with two roles: `landlord` and `tenant`
- Landlords: create/update/delete properties, view & approve/reject applications
- Tenants: browse/filter/sort properties, apply, track their applications
- Atomic approval flow: approving one application rejects the others for that property and
  notifies every affected tenant, all inside a single DB transaction
- In-app notifications (new application, approved, rejected)
- Dashboard stats for both roles
- Pagination, filtering, and sorting on list endpoints
- Centralized error handling with consistent JSON error shapes
- Request validation via Joi
- Rate limiting, Helmet security headers, gzip compression, request logging
- Strictly typed end-to-end (TypeScript `strict: true`)

## Tech stack

| Layer       | Technology |
|-------------|------------|
| Runtime     | Node.js 18+ |
| Language    | TypeScript (strict) |
| Framework   | Express |
| Database    | PostgreSQL |
| Query layer | Knex.js |
| Auth        | JWT (jsonwebtoken) + bcryptjs |
| Validation  | Joi |
| Logging     | Winston + Morgan |
| Testing     | Jest + ts-jest + Supertest |

## Project structure

```
src/
  app.ts                   Express app wiring (middleware, routes, error handlers)
  server.ts                Process entrypoint: starts HTTP server, graceful shutdown
  config/
   migrations/                Knex migrations
    env.ts                 Centralized environment config
    db.ts                  Knex instance
  controllers/             HTTP layer — parses req, calls services, shapes responses
  services/                Business logic
  models/                  Knex query builders, one per table
  middleware/
    auth.ts                JWT verification + role-based authorization
    validate.ts            Joi-schema request validation
    errorHandler.ts        Centralized error handling
  validations/             Joi schemas
  utils/
    ApiError.ts            Typed application error class
    logger.ts              Winston logger
    pagination.ts          Pagination helpers
    serializers.ts         DB row -> API response shaping
  types/                   Shared TS types (DB rows, DTOs, Express augmentation)

knexfile.ts
```

## Data model

| Table                | Key columns |
|-----------------------|-------------|
| `users`               | `id`, `name`, `email`, `password` (hashed), `role` (`landlord` \| `tenant`) |
| `properties`          | `id`, `landlord_id`, `title`, `description`, `address`, `rent_amount`, `bedrooms`, `bathrooms`, `status` (`active` \| `rented`) |
| `rental_applications` | `id`, `property_id`, `tenant_id`, `message`, `status` (`pending` \| `approved` \| `rejected`) |
| `notifications`       | `id`, `user_id`, `title`, `message`, `is_read` |

A tenant can only apply once per property (unique constraint), and only to properties with
status `active`.

## Getting started

### Prerequisites

- Node.js >= 18
- PostgreSQL (local install or a connection string to a hosted instance)

### 1. Clone & install

```bash
git clone https://github/guri5405/backend2.git
cd property-rental-backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` (or edit `.env` directly) and fill in your values:

```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_db
DB_USER=rental_user
DB_PASSWORD=rental_pass
# Alternatively, set DATABASE_URL and it takes precedence over the DB_* fields above

JWT_SECRET=change_me_to_a_real_secret
JWT_EXPIRES_IN=1d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 3. Create the database, then run migrations & seed data

```bash
npm run migrate:latest
npm run seed:run
```

This creates demo accounts (password `Password123` for all):

| Role     | Email             |
|----------|-------------------|
| Landlord | alice@demo.com    |
| Tenant   | bob@demo.com      |
| Tenant   | carol@demo.com    |

### 4. Run it

```bash
npm run dev      # ts-node + nodemon, restarts on change
# or
npm run build && npm start
```

The API is now available at `http://localhost:4000/api`. Check `GET /api/health` first.

## Scripts

| Script                        | Description |
|------------------------------ |--------------|
| `npm run dev`                 | Run with ts-node + nodemon (auto-restart) |
| `npm run build`               | Compile TypeScript to `dist/` |
| `npm start`                   | Run the compiled build (`dist/src/server.js`) |
| `npm run typecheck`           | `tsc --noEmit` |
| `npm run lint`                | ESLint over `src/` |
| `npm run migrate:make`        | Create a new migration |
| `npm run migrate:latest`      | Run pending migrations |
| `npm run migrate:rollback`    | Roll back the last migration batch |
| `npm run migrate:rollback:all`| Roll back all migrations |
| `npm run migrate:status`      | Show migration status |
| `npm run seed:run`            | Run seed files |
| `npm run db:reset`            | Rollback all + migrate + seed, in one go |
| `npm test`                    | Run the test suite (Jest) |

## API reference

All responses follow the shape `{ success: boolean, data?, error?, pagination? }`.
Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route                 | Auth | Description |
|--------|---------------------- |------|--------------|
| POST   | `/api/auth/register`  | —    | Create an account (`name`, `email`, `password`, `role`) |
| POST   | `/api/auth/login`     | —    | Log in, returns a JWT |
| GET    | `/api/auth/me`        | Any  | Get the current authenticated user |

### Properties

| Method | Route                                    |  Auth                | Description |
|--------|----------------------------------------  |-----------           |--------------|
| GET    | `/api/properties`                          | —                    | List properties (pagination, filters, sorting) |
| GET    | `/api/properties/:propertyId`              | —                    |  Get a single property |
| POST   | `/api/properties`                          | Landlord             | Create a property |
| PUT    | `/api/properties/:propertyId`              | Landlord (owner)     | Update a property |
| DELETE | `/api/properties/:propertyId`              | Landlord (owner)     | Delete a property |
| POST   | `/api/properties/:propertyId/apply`        | Tenant               | Apply to a property |
| GET    | `/api/properties/:propertyId/applications` | Landlord (owner)     | View applications for a property |

`GET /api/properties` query params: `page`, `limit`, `minRent`, `maxRent`, `bedrooms`, `status`
(`active`/`rented`), `sortBy` (`rentAmount`/`createdAt`/`bedrooms`/`bathrooms`/`title`),
`order` (`asc`/`desc`).

### Applications

| Method | Route                                  | Auth      | Description |
|--------|-------------------------------------------|-----------|--------------|
| GET    | `/api/applications/my-applications`        | Tenant     | List the tenant's own applications |
| PUT    | `/api/applications/:applicationId/approve` | Landlord   | Approve an application (rejects competing pending applications, marks property rented) |
| PUT    | `/api/applications/:applicationId/reject`  | Landlord   | Reject an application |

### Notifications

| Method | Route                                  | Auth | Description |
|--------|-------------------------------------------|------|--------------|
| GET    | `/api/notifications`                       | Any  | List the user's notifications |
| PUT    | `/api/notifications/:notificationId/read`  | Any  | Mark a notification as read |

### Dashboard

| Method | Route                    | Auth      | Description |
|--------|---------------------------|-----------|--------------|
| GET    | `/api/dashboard/landlord`  | Landlord   | Property/application stats for a landlord |
| GET    | `/api/dashboard/tenant`    | Tenant     | Application stats for a tenant |

## Environment variables

| Variable               | Default              | Notes |
|-------------------------|-----------------------|-------|
| `NODE_ENV`               | `development`          | `development` \| `test` \| `production` |
| `PORT`                   | `4000`                 | |
| `DB_HOST`                | `localhost`            | Ignored if `DATABASE_URL` is set |
| `DB_PORT`                | `5432`                 | |
| `DB_NAME`                | `rental_db`            | |
| `DB_USER`                | `rental_user`          | |
| `DB_PASSWORD`            | `rental_pass`          | |
| `DATABASE_URL`           | —                      | Overrides the `DB_*` fields above |
| `TEST_DB_NAME`           | `rental_db_test`       | Used when `NODE_ENV=test` |
| `JWT_SECRET`             | —                      | **Required** — set a real secret |
| `JWT_EXPIRES_IN`         | `1d`                   | |
| `RATE_LIMIT_WINDOW_MS`   | `900000` (15 min)      | |
| `RATE_LIMIT_MAX`         | `100`                  | Requests per window per IP |

## Testing

```bash
npm test
```

Uses Jest + ts-jest + Supertest. Set `TEST_DB_NAME` and run migrations against the test
database before running the suite.

## License

MIT
