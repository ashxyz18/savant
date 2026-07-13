# Deploying SAVANT (frontend on Hostinger, backend on Render)

## Architecture (this plan)

| Piece                    | Host                         | Why |
|--------------------------|------------------------------|-----|
| Frontend (Next.js)       | **Hostinger "Web Hosting Unlimited"** (`public_html`) | Shared hPanel is Apache-only and **cannot run `next start`**. We build a fully **static export** (`next build` -> `out/`) and upload it. All data is fetched client-side from the API, so the store works as static files. |
| Backend (Express API)    | **Render** (web service)     | Render runs a real Node.js server. The Express app listens on the injected `PORT` and serves `/api/*` + uploaded files. |
| Database                 | **MongoDB Atlas** (Mongoose)  | Set via `MONGODB_URI`. Data persists across Render restarts/deploys. |
| User uploads             | `backend/uploads/` on Render (ephemeral) | Files are wiped on redeploy — switch to Cloudinary or a Render disk for permanent storage (see caveats). |

> `NEXT_PUBLIC_API_URL` (frontend) points directly at the Render backend, so no server-side proxy/rewrite is used — that's why static hosting works.

---

## Part 1 - Backend on Render

1. **Create the service**
   - Render dashboard -> **New** -> **Blueprint** and connect the GitHub repo (uses `render.yaml`), **or**
   - **New** -> **Web Service** -> connect repo, then set:
     - **Root directory:** `backend`
     - **Runtime:** Node
     - **Build command:** `npm install`
     - **Start command:** `node src/index.js`
     - **Health check path:** `/api/health`
     - **Plan:** Free (or paid if you need a persistent disk — see caveats)
     - **Branch:** `master`

2. **Environment variables** (Render dashboard -> Environment):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | *(leave unset — Render injects it)* |
   | `FRONTEND_URL` | `https://your-hostinger-domain.com` (CORS allow-list; comma-separated for multiple) |
   | `JWT_SECRET` | `openssl rand -hex 32` output (a long random string) |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | Your email provider (Brevo/SendGrid/Gmail) |
    | `MONGODB_URI` | **REQUIRED** — your MongoDB Atlas connection string (`mongodb+srv://...`). The app uses Mongoose, so data persists across deploys. |
    | `CLOUDINARY_*` | only if you enable Cloudinary uploads (see caveats) |

3. **Deploy & verify**
   - Click **Deploy**. Once live, open `https://<render-url>/api/health` -> `{"status":"ok",...}`.

4. **Seed initial data** (first time only)
   - Open the Render service -> **Shell** and run `npm run seed`.
   - Default admin: `admin@roseo.com` / `admin123` — **change it immediately** in the admin panel.
   - Note: on the Free plan the disk is wiped on each deploy, so you'll need to re-seed after redeploys (or use the persistent-disk / MongoDB options in caveats).

---

## Part 2 - Frontend on Hostinger (static export)

### 2.1 Build locally (or in CI)
From the repo root:

```powershell
$env:NEXT_PUBLIC_API_URL = "https://<your-render-backend-url>/api"
cd frontend
npm install
npm run build      # outputs ./out
```

This produces a static site in `frontend/out/`. The product page is now a static route
`/products/view/?id=<id>` (so new products work without a rebuild).

### 2.2 Upload to Hostinger
1. hPanel -> **Hosting** -> **File Manager** -> open `public_html`.
2. Delete the default `index.html` / `default.php` if present.
3. Upload **everything inside `frontend/out/`** into `public_html` (keep the folder structure: `index.html`, `_next/`, `products/`, etc.).
   - Or use FTP. You can zip `out/`, upload, and extract in `public_html`.
4. Upload the sample `.htaccess` from `deploy/hostinger.htaccess` into `public_html` (rename to `.htaccess`).

### 2.3 Domain / DNS
- Point your domain's A record (or Hostinger's default) at the hosting. The frontend is served from the apex/`www` as static files — no backend proxy needed.
- Make sure `NEXT_PUBLIC_API_URL` (the Render URL) is reachable from the browser; CORS is handled by the backend's `FRONTEND_URL`.

### 2.4 (Optional) Automate rebuilds
Hostinger shared hosting has no build pipeline. Rebuild locally and re-upload `out/` whenever you change frontend code. (Render auto-redeploys the backend on git push if you connected the repo.)

---

## Part 3 - Email (optional but needed for chat / forgot-password)

Backend uses `nodemailer`. Set the `SMTP_*` vars on Render (Part 1.2). A transactional SMTP (Brevo, SendGrid) is recommended over Gmail.

---

## Part 4 - Caveats you MUST know

### Database now persists (MongoDB Atlas)
The data layer uses Mongoose against **MongoDB Atlas**, so products, orders, users, etc. survive Render restarts/deploys. Set `MONGODB_URI` on Render (and locally in `backend/.env`). The old local JSON file store is gone. Seed once with `npm run seed` (Render Shell) — you do **not** need to re-seed after redeploys.

### Uploads are still ephemeral on Render
`backend/uploads/` lives on Render's disposable disk, so product images uploaded in the admin panel are wiped on each deploy. For permanent storage, enable **Cloudinary** (the `cloudinary` dep is already installed): set `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` and switch `backend/src/middleware/upload.js` to Cloudinary storage. Until then, re-upload images after redeploys or use a Render persistent disk mounted at `/app/uploads`.

### Images are unoptimized
`next.config.js` sets `images.unoptimized: true` because there is no image server on static hosting. Product images are served straight from the Render backend's `/uploads`, so those URLs must be reachable (and CORS/`FRONTEND_URL` correct).

### Product URLs changed
Old: `/products/<id>` (server route). New: `/products/view/?id=<id>` (static). Search engines / old bookmarks to the old format will 404 — add redirects in `.htaccess` if you had them indexed.

### No server-side rendering
The store is a client-rendered SPA. SEO for product pages is weaker than the old SSR setup; acceptable for this hosting constraint.

---

## Part 5 - Post-deploy checklist
- [ ] `https://<render>/api/health` returns `{"status":"ok"}`
- [ ] `https://<hostinger-domain>` loads the storefront
- [ ] A product opens at `https://<hostinger-domain>/products/view/?id=<some-id>`
- [ ] Admin login works with seeded creds; **change the admin password**
- [ ] No CORS errors in the browser console when the frontend calls the API
- [ ] Forgot-password email sends and the reset link uses `FRONTEND_URL`
- [ ] Product image upload works and displays (see storage caveat)
- [ ] Back up `backend/data/` and `backend/uploads/` if using a persistent disk

---

## Local dev (unchanged)
Backend: `cd backend && npm install && npm run dev` (PORT 5000)
Frontend: `cd frontend && npm install && npm run dev` (proxies `/api` to `http://localhost:5000`)
Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` for local frontend dev if needed.
