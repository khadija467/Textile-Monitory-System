# TextileFlow — Textile Factory Machine Monitoring & Management System

A full-stack enterprise system for monitoring textile factory machines, workers,
maintenance, inventory, and production — with role-based access for Admins and Workers.

**Theme:** Industrial teal & emerald, with a warm off-white surface and a signature
"running-stitch" dashed-border motif on cards (a nod to textile manufacturing).
Full dark/light mode support.

---

## Project Structure

```
textile-system/
├── backend/          Node.js + Express + Prisma + PostgreSQL REST API
└── frontend/         React + Vite + Tailwind CSS v4 SPA
```

---

## 1. Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally or remotely

### Steps

```bash
cd backend
npm install

# Copy and edit environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres connection string,
# and set strong random values for JWT_ACCESS_SECRET / JWT_REFRESH_SECRET

# Generate the Prisma client
npx prisma generate

# Create the database tables
npx prisma migrate dev --name init

# Seed realistic demo data (admin, technician, workers, machines, etc.)
npm run seed

# Start the API server (with auto-reload)
npm run dev
# or for production: npm start
```

The API will run on **http://localhost:5000** by default. Health check: `GET /health`.

### Demo Credentials (after seeding)
| Role        | Email                              | Password      |
|-------------|-------------------------------------|---------------|
| Admin       | admin@textilefactory.com           | Password@123  |
| Technician  | technician@textilefactory.com      | Password@123  |
| Worker      | hassan@textilefactory.com          | Password@123  |

---

## 2. Frontend Setup

### Steps

```bash
cd frontend
npm install
npm run dev
```

The app will run on **http://localhost:5173** and automatically proxy `/api` requests
to the backend at `http://localhost:5000` (configured in `vite.config.js`).

For production builds:
```bash
npm run build   # outputs to frontend/dist
npm run preview # preview the production build locally
```

---

## 3. Key Features

- **JWT authentication** with access + refresh token rotation, "remember me," and
  automatic silent refresh on 401s.
- **Role-based access control** (Admin / Worker / Technician) enforced both in API
  middleware and in frontend route guards.
- **Admin modules:** Dashboard analytics, Machine CRUD, Worker management, Maintenance
  tickets with technician assignment, Inventory with low-stock alerts, Production
  analytics (daily/weekly/monthly/yearly), Reports with PDF & Excel export, Settings.
- **Worker modules:** Simplified dashboard, assigned machines, attendance check-in/out,
  work schedule, notifications.
- **Audit logging** on all create/update/delete actions for traceability.
- **Dark/light mode** with persisted preference.

---

## 4. Database Schema

See `backend/prisma/schema.prisma` for the full schema. Core models: `User`, `Machine`,
`Attendance`, `Maintenance`, `Inventory`, `StockHistory`, `Production`, `Notification`,
`AuditLog`, `RefreshToken`.

---

## 5. Notes on Deployment

- Update `CORS_ORIGIN` in backend `.env` to your deployed frontend URL.
- For the frontend, if deploying frontend/backend to different domains, set
  `VITE_API_URL` and update `src/services/api.js`'s `baseURL` accordingly (currently
  set to relative `/api` to work with the Vite dev proxy).
- Rotate JWT secrets and the seeded demo passwords before going to production.
