# Deploying SAVANT with AWS Amplify (frontend) + Elastic Beanstalk (backend)

Amplify is the easiest GitHub-based deploy, but **Amplify Hosting does not run a
long-lived Express server**. So:

```
Browser ─HTTPS─▶ AWS Amplify  (serves static frontend, builds from GitHub)
                     │ proxies /api + /uploads
                     ▼
               Elastic Beanstalk  (Node/Express API, also deployable from GitHub)
                     │
               MongoDB Atlas
```

| Piece | AWS service |
|-------|-------------|
| Frontend (static export) | **Amplify Hosting** (GitHub → build → CDN + HTTPS) |
| Backend (Express API) | **Elastic Beanstalk** (`.github/workflows/deploy-backend.yml`) |
| Database | **MongoDB Atlas** |
| API proxy | Amplify **Rewrites** forward `/api` and `/uploads` to Beanstalk |

Only **one** TLS certificate (Amplify's). Beanstalk needs none.

---

## Part A — Backend on Elastic Beanstalk (unchanged)
Follow `deploy/aws-eb.md` **Part A** to create the EB environment once. Keep the
`.github/workflows/deploy-backend.yml` workflow so the backend auto-deploys
from GitHub. Note the Beanstalk environment URL
(`savant.us-east-1.elasticbeanstalk.com`) — you'll need it for the proxy.

---

## Part B — Frontend on Amplify

1. **AWS → Amplify → New app → Host web app → GitHub** → pick the repo.
2. **App root directory:** `frontend` (so Amplify reads `frontend/amplify.yml`).
3. **Build settings:** Amplify auto-detects Next.js and uses the `amplify.yml`
   (build `npm run build`, serve `out/`).
4. **Environment variables** (Build-time, in Amplify console → Environment
   variables):
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://<your-amplify-domain>/api` |
   This is read at build time.
5. **Deploy**. Amplify builds and gives you a domain like
   `https://main.d12345.amplifyapp.com` (and a custom domain if you add one).

### B.1 Proxy `/api` and `/uploads` to Beanstalk
In Amplify → **Rewrites and redirects → Add rule** (Type = 200 Rewrite):
- Source: `/api/<*>`
  Target: `https://<your-eb-env>.elasticbeanstalk.com/api/<*>`
- Source: `/uploads/<*>`
  Target: `https://<your-eb-env>.elasticbeanstalk.com/uploads/<*>`

(Optional SPA fallback) Add a 200 rewrite: Source `/<*>`, Target `/index.html`.
This is only needed for deep links to routes that aren't pre-rendered.

Now the browser only ever talks to the Amplify domain:
`https://<amplify>/api/...` → Amplify proxies to Beanstalk. CORS isn't even
required (same origin).

---

## Part C — GitHub auto-deploy
- Push to `frontend/**` → Amplify rebuilds & deploys automatically.
- Push to `backend/**` → the EB workflow redeploys the API.
- The old `deploy-frontend.yml` (S3/CloudFront) is no longer needed — Amplify
  handles the frontend. You can delete it, or keep it as an alternative.

## Caveats
- **Uploads** still live on the Beanstalk instance (ephemeral, wiped per
  deploy). Use Cloudinary for permanent storage.
- **Single-instance** Beanstalk = no HA; use Load-balanced for production.
- The **DB is Atlas**, independent of AWS.
- Amplify free tier is generous; the backend (EB) is the main cost.
