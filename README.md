# FindIt — Campus Lost & Found Management System

A full-stack lost & found platform for a college campus: students report/search/claim items,
admins verify claims and moderate reports. Built to run entirely on your own machine with
zero paid services required to try it out.

## What's included vs. scoped out

This is a complete, working MVP covering the core flows end‑to‑end:

- Separate **student** and **admin** login/register screens, JWT auth, bcrypt password hashing
- Report lost items / report found items, with image upload
- Browse, filter, and fuzzy/typo‑tolerant search ("AI smart search" approximation)
- Automatic lost↔found matching + notifications when a new report looks similar to an existing one
- Claim workflow: student submits proof of ownership → admin reviews → approve/reject/complete
- Admin dashboard: stats, category/claim charts, claim review, user suspension, item moderation, campus-wide announcements
- Student dashboard: my reports, my claims, bookmarks, notifications, profile + password change
- Attractive, responsive dark UI with a coral/charcoal palette matching your reference image

A few items from the original wishlist need real external services or heavy ML models and
were intentionally left out of this local build (but the code is structured so you can add
them later without a rewrite):

- **Real embeddings / CLIP image matching** — replaced with a lightweight token-overlap
  similarity scorer (`backend/utils/matching.js`). Swap in an OpenAI/CLIP embeddings call there.
- **MongoDB Atlas / Cloudinary** — replaced with a local JSON file "database" (`backend/utils/db.js`)
  and local disk image storage (`backend/uploads/`), so there's nothing to sign up for to run this.
  Swapping in real Mongoose models or Cloudinary later only touches those two files.
- **Interactive campus map, QR code scanning, PDF/CSV export** — not included; flag if you'd like
  these added next.

## Project structure

```
lostfound/
  backend/     Express API (JWT auth, file-based DB, image uploads, matching engine)
  frontend/    React + Tailwind + Vite single-page app
```

## Running it locally

You'll need Node.js 18+ installed.

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit JWT_SECRET if you like
npm install
npm run seed               # creates demo admin + student accounts and sample items
npm run dev                 # starts the API on http://localhost:5000
```

Demo accounts created by the seed script:

- **Admin** — `admin@college.edu` / `Admin@123`
- **Student** — `asha.kumar@college.edu` / `Student@123`

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open `http://localhost:5173`. The dev server proxies `/api` and `/uploads` to the backend,
so no extra config is needed.

## Notes on registration

New student sign-ups are restricted to the `@college.edu` email domain (see
`COLLEGE_EMAIL_DOMAINS` in `backend/routes/auth.js`) — change that to your real institution's
domain(s). Admin accounts aren't self-serve; create additional ones directly in
`backend/utils/seed.js` or via a follow-up admin-management endpoint.

## Moving to production

- Swap `backend/utils/db.js` for Mongoose models against a real MongoDB Atlas cluster.
- Swap local disk storage in `backend/middleware/upload.js` for Cloudinary's SDK.
- Deploy the backend to Render/Railway and the frontend to Vercel, pointing the frontend's
  API base URL at your deployed backend instead of the Vite dev proxy.
- Set a strong, unique `JWT_SECRET` and restrict `CORS_ORIGIN` to your real frontend domain.
