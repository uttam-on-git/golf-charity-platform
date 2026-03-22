# Golf Charity Subscription Platform

A full-stack subscription platform that combines golf score tracking, monthly prize draws, and charity contributions.

The project includes a public-facing site, a subscriber dashboard, and an admin dashboard for operational management.

## Stack
- Frontend: Next.js 16, React 19, Tailwind CSS 4
- Backend: Node.js, Express, TypeScript
- Database: Supabase PostgreSQL
- Payments: Stripe
- Deployment targets: Vercel for the frontend and Render for the backend

## Project Structure
```text
golf-charity-platform/
|-- frontend/   Next.js application
|-- backend/    Express API and SQL migrations
|-- README.md
```

## Core Features
- Monthly and yearly Stripe subscriptions
- Stableford score entry with rolling retention of the latest five scores
- Monthly draw engine with 3-match, 4-match, and 5-match outcomes
- Charity selection, contribution tracking, and public charity profiles
- Direct donation support for charities
- Admin tooling for draws, charities, users, subscriptions, winners, and notifications
- In-app notification feed with unread tracking and test-trigger support

## Backend Modules
- `auth`
- `scores`
- `charities`
- `subscriptions`
- `draws`
- `notifications`
- `admin`

## Environment Configuration

### Backend
Create `backend/.env` from `backend/.env.example`.

Required variables:
- `PORT`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_API_VERSION`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`

### Frontend
Create `frontend/.env.local` from `frontend/.env.example`.

Required variable:
- `NEXT_PUBLIC_API_URL`

## Database Setup
Apply the SQL files in `backend/sql/` to the Supabase project before running the application. The repository currently includes migrations for:
- profile contribution percentage
- winner proof fields
- charity content and donations
- draw entries
- notifications
- notification dedupe index correction

## Local Development

### Install dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### Start the backend
```bash
cd backend
npm run dev
```

### Start the frontend
```bash
cd frontend
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Build Commands

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run lint
npm run build
```

## Current Status
Active development. Core application flows are implemented, with ongoing refinement across dashboard UX, notifications, and administrative tooling.
