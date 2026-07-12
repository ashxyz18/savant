# Deploying SAVANT to production

Architecture for this project:

| Piece        | Host              | Why                                            |
|--------------|-------------------|------------------------------------------------|
| Frontend (Next.js) | **Vercel** (free) | Next.js SSR + dynamic `/products/[id]` need a long-running Node server. hPanel shared hosting can't run `next start` reliably. |
| Backend (Express) | **Hostinger** shared hPanel | Plain request/response Express app. Runs fine under Passenger. |
| Database     | **Local JSON files** in `backend/data/` | The app uses a file-based store, NOT MongoDB. Atlas is not needed despite the dep in package.json. |
| User uploads | `backend/uploads/` on Hostinger | Files persist in the hPanel Node app root. |

---

## Part 1 - Backend on Hostinger (hPanel)

### 1.1 Get SSH access (recommended)
hPanel > **Advanced** > **SSH access** > enable SSH and copy your credentials.
You can use the File Manager instead of SSH, but SSH is much easier for `npm install` and `npm run seed`.

### 1.2 Create the Node.js app
hPanel > **Advanced** > **Node.js** > **Create application**:

- **Node.js version:** 18.x (matches your `package.json`)
- **Application mode:** Production
- **Application URL / domain:** the subdomain you'll serve the API on, e.g. `api.savantbd.com`
- **Application root:** e.g. `domains/api.savantbd.com/app`
- **App startup file:** `app.js`
- **Package manager:** `npm`

Click **Create**.

### 1.3 Generate an SSH key for GitHub Actions
On your PC (PowerShell):
```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\hostinger_deploy" -N '""'
```
This produces two files:
- `hostinger_deploy` (private key) -> paste as the GitHub Secret `HOSTINGER_SSH_KEY`
- `hostinger_deploy.pub` (public key) -> append to Hostinger

On Hostinger (hPanel > Advanced > SSH access > Manage SSH keys), upload `hostinger_deploy.pub` and click **Import** so the key is authorized for your account.

### 1.4 Add GitHub Secrets
GitHub repo (https://github.com/ashxyz18/savant) > **Settings > Secrets and variables > Actions** > **New repository secret**:

| Secret name              | Value                                                                          |
|--------------------------|--------------------------------------------------------------------------------|
| `HOSTINGER_SSH_HOST`     | Your account's SSH host (seen in hPanel > SSH access). Example: `ssh.hostinger.com` or the server IP. |
| `HOSTINGER_SSH_USER`     | Your hPanel SSH username, e.g. `u123456789`.                                  |
| `HOSTINGER_SSH_PORT`     | `65022` (Hostinger's default SSH port; confirm in hPanel).                    |
| `HOSTINGER_SSH_KEY`      | Full contents of the **private** key file `hostinger_deploy`.                 |
| `REPO_URL`               | The HTTPS URL of your repo with a Personal Access Token embedded, so the server can clone a private repo: `https://<token>@github.com/ashxyz18/savant.git` (use a fine-grained PAT with **Contents: Read** only, scoped to this repo). If your repo is public, just use `https://github.com/ashxyz18/savant.git`. |

### 1.5 First-time clone of the backend on the server
The auto-deploy workflow clones the repo on its **first run**. To trigger it:
1. Push a commit on the default branch (`main` or `master`) that touches `backend/`.
2. GitHub repo > **Actions** tab > watch the **Deploy backend to Hostinger** run.
3. The workflow will SSH in, clone the repo into `~/domains/api.savantbd.com/app`, run `npm install --omit=dev`, and touch `tmp/restart.txt` (Passenger picks up the restart).

> If your repo's default branch is `master` instead of `main`, edit `.github/workflows/deploy-backend.yml` and change `branches: [main]` and `BRANCH="main"` to `master` before pushing.

### 1.6 Configure the production `.env` (one-time, on the server)
The `.env` file is git-ignored (never committed). Create it on the server once via SSH:

```bash
ssh -p 65022 <user>@<host>
cd ~/domains/api.savantbd.com/app/backend
cp .env.example .env
nano .env   # or use hPanel File Manager to edit
```

Fill in:

| Variable      | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| `PORT`        | Leave unset for Passenger (it injects `PORT`). Only set for manual `npm start` tests. |
| `FRONTEND_URL`| `https://savantbd.com,https://www.savantbd.com` (comma-separated).   |
| `JWT_SECRET`  | A long random string. Generate with `openssl rand -hex 32`.           |
| `SMTP_*`      | Your email provider details (see Part 3).                             |

> MongoDB and Cloudinary vars can be left blank - the app doesn't use them yet.

After saving `.env`, restart the app from hPanel > Node.js > Restart, or SSH in and run `touch tmp/restart.txt` from the app root. **Future deploys preserve this `.env` file** because it's git-ignored and the workflow only does `git pull`, not `git clean`.

### 1.7 Seed initial data (first deploy only)
The seed script writes demo products/categories/users into `backend/data/*.json`. Run it once via SSH:

```bash
cd ~/domains/api.savantbd.com/app/backend
npm run seed
```

Default seeded admin login: `admin@roseo.com` / `admin123`. **Change this immediately** after logging into the admin panel. You can re-run this any time later to reset demo data (it wipes and rebuilds).

### 1.8 Verify the backend
Open `https://api.savantbd.com/api/health` in your browser. You should get:
```json
{"status":"ok","timestamp":"..."}
```

### 1.9 SSL for the API subdomain
hPanel > **Security** > **SSL** > issue a free Let's Encrypt cert for `api.savantbd.com`. Enable **Force HTTPS**.

---

## Part 2 - Frontend on Vercel

### 2.1 Import the existing repo
Vercel deploys from Git. Your repo is already at `github.com/ashxyz18/savant`.
- vercel.com > **Add New** > **Project** > import the `ashxyz18/savant` repo.
- **Framework preset:** Next.js
- **Root Directory:** `frontend` (this is a monorepo - the Next.js app lives in the `frontend/` subfolder)
- **Build command:** `next build` (default, also declared in `frontend/vercel.json`)
- **Output directory:** leave default (Vercel handles `output: 'standalone'` automatically)
- **Node version:** 18.x (Vercel uses 20 by default; set `engines.node: "18.x"` in `frontend/package.json` if you want to pin)

### 2.3 Set Vercel environment variables
Project > Settings > Environment Variables. Add to **Production** and **Preview**:

| Variable                | Value                                   | Purpose |
|-------------------------|-----------------------------------------|---------|
| `BACKEND_URL`           | `https://api.savantbd.com`            | Used by `next.config.js` `rewrites()` to proxy `/api/*` from the Vercel domain to the Hostinger backend. **Recommended** because it avoids CORS. |
| `BACKEND_HOSTNAME`      | `api.savantbd.com`                   | Lets `next/image` optimize images served from your backend's `/uploads`. |
| `BACKEND_PROTOCOL`      | `https`                                 | Same. |
| `NEXT_PUBLIC_API_URL`   | **Leave unset** if you use the rewrite proxy. If you'd rather call the backend directly, set this to `https://api.savantbd.com/api` (and make sure backend CORS includes the Vercel origin). | |

### 2.4 Add your custom domain
Vercel project > **Settings** > **Domains** > add `savantbd.com` and `www.savantbd.com`.
Vercel shows you the DNS records to add at your registrar/hPanel DNS.

### 2.5 Configure DNS at Hostinger
hPanel > **Domains** > your domain > **DNS / Nameservers**:

- Add/point an **A record** or **CNAME** to the host Vercel gives you (e.g. ` cname.vercel-dns.com`).
- The `api` subdomain stays pointing at Hostinger (either an A record to your hosting IP, or leave as the default subdomain hPanel created in step 1.2). Keep it on Hostinger.

### 2.6 SSL
Vercel issues the SSL cert automatically when you add the domain in 2.4 and point DNS in 2.5.

---

## Part 3 - Email (optional, but the chat/forgot-password features need it)

The backend uses `nodemailer`. Recommended: a transactional SMTP (Brevo, SendGrid, Mailgun) so you don't hit Gmail's rate limits or need app passwords.

Set in the backend `.env`:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login@example.com
SMTP_PASSWORD=your_brevo_smtp_key
```

---

## Part 4 - Important caveats on shared hPanel hosting

### File-based database
`backend/data/*.json` is the database. On shared hosting:
- Files persist across app restarts (good).
- Passenger may **recycle the app process** between requests when load is low, reloading files from disk. This means data written by one request is picked up by the next, but very-high concurrent write traffic can race. For a normal storefront this is fine; for heavy admin use, schedule a move to MongoDB Atlas later (the `mongoose` dep is already there).
- **Back up `data/` regularly.** Download it via File Manager or add a cron via hPanel > **Cron Jobs** to `tar` it nightly elsewhere.

### Uploads
Uploaded product images land in `backend/uploads/`. They persist, but they're lost if hPanel restores your account from a backup snapshot. For production resilience, change the upload flow later to push to Cloudinary (the dep is present) instead of local disk.

### Long-running processes / WebSockets
The chat feature is plain HTTP polling-style (no WebSockets), so it works on Passport. Do not add `socket.io` to the backend while on shared hosting.

### Process limits
Hostinger shared plans cap CPU minutes per month and concurrent processes. For a typical store this is plenty; if you hit limits, the upgrade path is Hostinger Cloud / VPS.

---

## Part 5 - Post-deploy checklist

- [ ] `https://api.savantbd.com/api/health` returns `{"status":"ok"}` over HTTPS
- [ ] `https://savantbd.com` loads the storefront
- [ ] A product page like `https://savantbd.com/products/<some-id>` loads (verifies SSR rewrites to backend)
- [ ] Admin login at `https://savantbd.com/admin/login` works with seeded creds
- [ ] Change the seeded admin password immediately
- [ ] CORS: confirm the browser console shows no CORS errors when the frontend calls `/api/*`
- [ ] Test `Forgot password` email sends and the reset link uses `FRONTEND_URL` correctly
- [ ] Test product image upload in admin works and the image displays on the storefront
- [ ] Back up `backend/data/` and `backend/uploads/`

---

## Local dev reminder (unchanged)

Backend: `cd backend && npm install && npm run dev` (PORT 5000)
Frontend: `cd frontend && npm install && npm run dev` (proxies `/api` to `http://localhost:5000`)

The deploy changes do not affect local development.
