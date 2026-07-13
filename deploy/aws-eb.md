# Deploying SAVANT — Easiest AWS (Elastic Beanstalk + S3/CloudFront)

This is the lowest-effort full-stack AWS setup. Elastic Beanstalk runs the
backend like Render (upload code, AWS manages the Node server, health, scaling),
and CloudFront serves the static frontend **and** proxies `/api` to Beanstalk —
so you only configure **one** TLS certificate.

```
Browser ──HTTPS──▶ CloudFront ──┬─ /api, /uploads ──HTTP──▶ Elastic Beanstalk (Node)
                                └─ everything else ─────────▶ S3 (static frontend)
```

| Piece | AWS service |
|-------|-------------|
| Backend (Node API) | **Elastic Beanstalk** (single-instance is fine) |
| Database | **MongoDB Atlas** (already wired via `MONGODB_URI`) |
| Frontend (static export) | **S3** |
| CDN + HTTPS + API proxy | **CloudFront** (one ACM cert) |

> Code changes already made for this: a root `/` health route (Beanstalk checks
> `/`), and **automatic seeding** on first run (no manual `eb ssh` needed).

---

## Part A — Backend on Elastic Beanstalk

### A.1 Prepare the deploy package (local)
Beanstalk runs `npm start` from the **root** of the zip, so zip the *contents*
of `backend/`, not the folder itself:
```powershell
cd D:\savant
Compress-Archive -Path backend\* -DestinationPath backend-deploy.zip
```

### A.2 Create the environment (Console)
1. AWS → **Elastic Beanstalk → Create Application** (name: `savant`).
2. **Create environment → Web server environment**:
   - Platform: **Node.js** (pick a **Node 20** version if offered).
   - Application code: **Upload your code** → choose `backend-deploy.zip`.
   - Presets: **Single instance** (cheapest; CloudFront handles HTTPS in front).
3. Click **Create environment**. Wait a few minutes.
4. Once healthy, open the environment URL and visit `/api/health` → `{"status":"ok"}`.

### A.3 Environment variables (Console)
Environment → **Configuration → Environment properties → Edit**, add:
| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | a long random string (`openssl rand -hex 32`) |
| `FRONTEND_URL` | `https://www.yourdomain.com` (the CloudFront domain) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | email provider |

Save → Beanstalk redeploys. The app auto-seeds the DB on first run
(`admin@roseo.com` / `admin123` — change it after login).

> **CLI alternative:** `eb init -p node.js savant && eb create savant-env && eb deploy`.

---

## Part B — Frontend on S3 + CloudFront (API proxied)

### B.1 Build the static export (local)
```powershell
$env:NEXT_PUBLIC_API_URL = "https://www.yourdomain.com/api"
cd D:\savant\frontend
npm install
npm run build
aws s3 sync frontend\out s3://savant-frontend --delete
```

### B.2 CloudFront (the key part)
1. **S3 bucket** `savant-frontend`, static website hosting on, index = `index.html`.
2. **CloudFront → Create distribution**:
   - **Origins**:
     - `s3-savant` → the S3 bucket.
     - `eb-api` → **Custom origin**, Origin domain = your Beanstalk environment URL
       (e.g. `savant.us-east-1.elasticbeanstalk.com`), Protocol = **HTTP only**.
   - **Cache behaviors** (most-specific first):
     - Path `/api/*` → origin `eb-api`, **Caching disabled**, forward **all**
       headers/cookies/query strings.
     - Path `/uploads/*` → origin `eb-api`, Caching disabled, forward all.
     - Default `*` → origin `s3-savant` (caching allowed).
   - **Default root object:** `index.html`.
   - **Custom error responses:** `403` and `404` → `/index.html` (HTTP 200).
   - **Alternate domain names:** `www.yourdomain.com`, `yourdomain.com`.
   - **SSL certificate:** request a free **ACM** cert in **us-east-1** and attach it.
3. Create, wait for deployment, then point DNS (`www` + apex) at the CloudFront domain.

> Why this works: the browser only ever talks HTTPS to CloudFront. CloudFront
> calls Beanstalk over HTTP on port 80, so Beanstalk needs **no certificate** and
> no Nginx. (Optionally restrict the Beanstalk instance's SG to CloudFront's
> managed prefix list; otherwise allow 80 from anywhere.)

---

## Part D — Deploy from GitHub (CI/CD)

Once the EB environment and S3/CloudFront exist, push-to-deploy is automatic:

1. **Create the EB environment and S3/CloudFront once** (Parts A & B) — the
   workflows below only *deploy*, they don't create infrastructure.
2. In the GitHub repo → **Settings → Secrets and variables → Actions**, add:
   | Secret | Value |
   |--------|-------|
   | `AWS_ACCESS_KEY_ID` | IAM user key with Elastic Beanstalk + S3 + CloudFront rights |
   | `AWS_SECRET_ACCESS_KEY` | IAM user secret |
   | `AWS_REGION` | e.g. `us-east-1` |
   | `EB_APP_NAME` | `savant` |
   | `EB_ENV_NAME` | your EB environment name |
   | `NEXT_PUBLIC_API_URL` | `https://www.yourdomain.com/api` |
   | `S3_FRONTEND_BUCKET` | `savant-frontend` |
   | `CLOUDFRONT_DIST_ID` | your distribution ID |
3. Commit & push `.github/workflows/deploy-backend.yml` and
   `deploy-frontend.yml`. From then on:
   - push to `backend/**` → auto-deploys to Elastic Beanstalk
   - push to `frontend/**` → auto-builds + syncs to S3 + invalidates CloudFront

> The IAM user needs at least `elasticbeanstalk:*`, `s3:PutObject` on the EB
> bucket + frontend bucket, and `cloudfront:CreateInvalidation`. Use a
> dedicated least-privilege user, not your root keys.
> If your default branch is `main` (not `master`), change `branches: [master]`
> in both workflow files.

---
