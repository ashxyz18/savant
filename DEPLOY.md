# Deploying SAVANT — Render (backend) + Vercel (frontend) + Hostinger (domain)

## Architecture
| Piece | Service | Notes |
|-------|---------|-------|
| Frontend (Next.js) | **Vercel** | Connect the GitHub repo; Vercel builds & serves it (SSR). |
| Backend (Express API) | **Render** | Web service; listens on `$PORT`, serves `/api/*`. |
| Database | **MongoDB Atlas** | Set via `MONGODB_URI` (Mongoose). Persists across deploys. |
| Domain | **Hostinger** | You only use Hostinger for the domain — point its DNS at Vercel. |

```
Browser ─HTTPS─▶ Vercel (www.yourdomain.com) ──▶ calls /api ──▶ Render (api.onrender.com)
                                   │                                  │
                              Hostinger DNS                    MongoDB Atlas
```

> `NEXT_PUBLIC_API_URL` (frontend, build-time) points at the Render backend, so
> the browser calls Render directly. CORS is handled by the backend's
> `FRONTEND_URL` (your domain). No server-side proxy is needed.

---

## Part 1 — Backend on Render
1. Render dashboard → **New → Blueprint**, connect the GitHub repo (uses
   `render.yaml`), **or** create a **Web Service** manually:
   - **Root directory:** `backend`
   - **Build:** `npm install`  **Start:** `node src/index.js`
   - **Health check:** `/api/health`
2. **Environment variables** (Render → Environment):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | MongoDB Atlas connection string (**required**) |
   | `JWT_SECRET` | `openssl rand -hex 32` |
   | `FRONTEND_URL` | `https://www.yourdomain.com` (CORS allow-list) |
   | `SMTP_*` | email provider |
3. Deploy. Open `https://<render-url>/api/health` → `{"status":"ok"}`.
4. **Seed** (first time): Render service → **Shell** → `npm run seed`.
   Admin: `admin@roseo.com` / `admin123` — change it after login.

(The app auto-seeds on first run too, so manual seed is optional.)

---

## Part 2 — Frontend on Vercel
1. Vercel dashboard → **Add New → Project** → import the GitHub repo.
2. **Settings:**
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** `npm run build`  **Output:** `.next` (default)
3. **Environment Variables** (Project → Settings → Environment):
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://<your-render-url>/api` |
4. **Deploy**. Vercel gives `https://<project>.vercel.app`.

Any push to `frontend/**` (or `master`) redeploys automatically.

---

## Part 3 — Point the Hostinger domain at Vercel
1. Vercel → Project → **Settings → Domains** → add `www.yourdomain.com` and
   `yourdomain.com`. Vercel shows the DNS records to create.
2. In **Hostinger hPanel → DNS Zone** for the domain, add the records Vercel
   lists, typically:
   - `www` → CNAME → `cname.vercel-dns.com` (or the value Vercel shows)
   - `@` (apex) → A / AAAA records Vercel provides (or use Vercel's
     nameservers if you prefer).
3. Wait for DNS propagation (~minutes–hours). Vercel issues a free TLS cert
   automatically.

Now `https://www.yourdomain.com` serves the storefront and calls the Render API.

---

## Part 4 — Environment recap
| Where | Variable | Value |
|-------|----------|-------|
| Render | `MONGODB_URI` | Atlas connection string |
| Render | `FRONTEND_URL` | `https://www.yourdomain.com` |
| Render | `JWT_SECRET`, `SMTP_*` | as before |
| Vercel | `NEXT_PUBLIC_API_URL` | `https://<render-url>/api` |

## Caveats
- **Uploads** on Render are on ephemeral storage — wiped on each deploy (like
  before). For permanent storage use Cloudinary (dep present) or a Render
  persistent disk.
- **Render free plan** spins the service down when idle; first request after
  idle is slow. Upgrade for production.
- The **database is Atlas**, independent of Render — data persists.
- Hostinger is used **only for the domain**; nothing is hosted there.

## Post-deploy checklist
- [ ] `https://<render>/api/health` → `{"status":"ok"}`
- [ ] `https://www.yourdomain.com` loads the storefront
- [ ] A product opens and displays images (from Render `/uploads`)
- [ ] Admin login works; change the admin password
- [ ] No CORS errors in the browser console
- [ ] Forgot-password email sends

---

## Alternative / earlier AWS docs
`deploy/aws.md`, `deploy/aws-eb.md`, `deploy/aws-amplify.md` cover EC2 /
Elastic Beanstalk / Amplify setups if you ever switch hosting.
