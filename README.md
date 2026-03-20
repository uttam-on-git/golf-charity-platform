# Golf Charity Subscription Platform

A subscription-based golf performance tracker with monthly prize draws 
and charity contributions.

## Stack
- **Frontend:** Next.js (App Router)
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Deploy:** Vercel (frontend) + Render (backend)

## Project Structure
```
golf-charity-platform/
├── frontend/   → Next.js app
├── backend/    → Express API
```

## Features
- Monthly/Yearly subscription via Stripe
- Golf score entry (rolling 5 scores, Stableford format)
- Monthly draw engine (3/4/5 number match)
- Charity selection & contribution tracking
- Admin dashboard (draw control, winner verification)

## Status
In development