# Deploying SAVANT — Full Stack on AWS

## Easiest path (recommended): Elastic Beanstalk
Use **Elastic Beanstalk** for the backend (upload code, AWS runs Node like Render)
and **CloudFront** to serve the static frontend while proxying `/api` to Beanstalk.
Only one TLS cert to manage. → See **[deploy/aws-eb.md](aws-eb.md)**.

## Alternative: single EC2 (more manual)
If you'd rather manage your own server, use the EC2 you launched: Nginx serves
the static frontend **and** proxies `/api` + `/uploads` to the Node backend.

1. On the instance: `bash deploy/aws/setup-ec2.sh`.
2. Point DNS (`www.yourdomain.com` + apex) → EC2 Elastic/Public IP.
3. Locally: `pwsh deploy/aws/deploy-frontend.ps1`.
4. On the instance: `sudo certbot --nginx -d www.yourdomain.com -d yourdomain.com`.

Config files: `deploy/aws/savant-api.service`, `deploy/aws/nginx-full.conf`,
`deploy/aws/setup-ec2.sh`, `deploy/aws/deploy-frontend.ps1`.

---

Architecture in this setup:

| Piece | AWS service | Notes |
|-------|-------------|-------|
| Frontend (static Next.js export) | **S3 + CloudFront** | Pre-built `out/` uploaded to S3, served via CloudFront CDN. No server needed. |
| Backend (Express API) | **EC2** (Ubuntu, Node + systemd/PM2, Nginx reverse proxy) | You manage the instance via SSH. |
| Database | **MongoDB Atlas** | Already wired via `MONGODB_URI` (Mongoose). Persists independently of EC2. |
| Uploads | EC2 local disk (`/opt/savant/backend/uploads`) | Persists on the EBS volume (survives reboots). Back it up if you ever terminate the instance. |

> This replaces the earlier Hostinger-frontend / Render-backend plan. Your Hostinger "Web Hosting" plan is no longer needed for this app (you can keep the domain there or move DNS to Route 53).

Prerequisites:
- An AWS account.
- A domain (Route 53 optional; any registrar works).
- A **MongoDB Atlas** cluster + connection string (already set up in `backend/.env.example` as `MONGODB_URI`).

---

## Part A — Backend on EC2

### A.1 Launch the instance
1. EC2 → **Launch instance**: Ubuntu 22.04 LTS, `t3.small` (or `t3.micro` to start), 20 GB gp3 EBS.
2. **Security Group** (create new): inbound rules
   - `22` (SSH) — your IP (or `0.0.0.0/0` if you must, less safe)
   - `80` (HTTP)
   - `443` (HTTPS)
3. Create/use a key pair (`.pem`) and download it. `chmod 400 savant.pem`.
4. After launch, allocate an **Elastic IP** and associate it so the IP stays fixed.

### A.2 SSH in and install the stack
```bash
ssh -i savant.pem ubuntu@<EC2-PUBLIC-IP>

sudo apt update && sudo apt -y upgrade
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs nginx git
sudo npm install -g pm2
```

### A.3 Get the backend code
Easiest: clone your repo directly into `/opt/savant` (so `backend/` lives at `/opt/savant/backend`):
```bash
sudo mkdir -p /opt/savant
sudo chown ubuntu:ubuntu /opt/savant
git clone https://github.com/<you>/savant.git /opt/savant
cd /opt/savant/backend
npm install --omit=dev
```

### A.4 Create the production `.env`
```bash
cp .env.example .env
nano .env
```
Set at least:
```
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/savant
JWT_SECRET=<long random: openssl rand -hex 32>
FRONTEND_URL=https://<your-cloudfront-domain>,https://<your-apex-domain>
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
NODE_ENV=production
PORT=5000
```
(The app reads `.env` via dotenv, so no systemd `EnvironmentFile` is required.)

### A.5 Run it as a service (systemd)
Copy the unit file `deploy/aws/savant-api.service` to the instance:
```bash
sudo cp /opt/savant/deploy/aws/savant-api.service /etc/systemd/system/savant-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now savant-api
sudo systemctl status savant-api   # should show active (running)
```
(Alternative: `pm2 start src/index.js --name savant-api && pm2 startup && pm2 save`.)

### A.6 Put Nginx in front (HTTPS + domain)
1. Point a subdomain, e.g. `api.yourdomain.com`, at the EC2 Elastic IP (A record).
2. Install the Nginx config `deploy/aws/nginx-api.conf`, replacing `api.yourdomain.com`:
   ```bash
   sudo cp /opt/savant/deploy/aws/nginx-api.conf /etc/nginx/sites-available/savant-api
   sudo ln -s /etc/nginx/sites-available/savant-api /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. Get a free TLS cert:
   ```bash
   sudo apt -y install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```
   Certbot edits the Nginx config to add 443 + redirect. Renewals are automatic.

### A.7 Seed & verify
```bash
cd /opt/savant/backend
npm run seed          # creates admin@roseo.com / admin123 — change it after login
curl https://api.yourdomain.com/api/health
# -> {"status":"ok",...}
```

---

## Part B — Frontend on S3 + CloudFront

### B.1 Build the static export (local machine)
```powershell
$env:NEXT_PUBLIC_API_URL = "https://api.yourdomain.com/api"
cd frontend
npm install
npm run build        # outputs ./out
```

### B.2 Create the S3 bucket
1. S3 → **Create bucket** `savant-frontend` (region of your choice, e.g. `us-east-1`).
2. **Properties → Static website hosting**: enable, index = `index.html`, error = `index.html`.
3. **Permissions**: uncheck "Block all public access", and add a bucket policy allowing `s3:GetObject` for `*`. (CloudFront will be the primary access path; locking it down with OAC is more advanced — fine to keep public for a static site.)
4. Upload `out/*` into the bucket (keep the folder structure). Use the AWS CLI:
   ```powershell
   aws s3 sync frontend\out s3://savant-frontend --delete
   ```

### B.3 CloudFront distribution
1. CloudFront → **Create distribution**.
   - **Origin**: the S3 *website endpoint* (`savant-frontend.s3-website-<region>.amazonaws.com`), not the REST endpoint, so directory `index.html` works.
   - **Viewer protocol policy**: Redirect HTTP → HTTPS.
   - **Default root object**: `index.html`.
   - **Alternate domain name (CNAME)**: `www.yourdomain.com` (and apex if desired).
   - **SSL certificate**: request a free ACM cert in **us-east-1** (CloudFront requires us-east-1 for certs), then select it.
   - **Custom error responses**: for `403` and `404`, respond with `/index.html` and HTTP `200` (so deep links / refreshes never 404).
2. Create the distribution and note its **Domain name** (`dxxxx.cloudfront.net`).
3. DNS: point `www.yourdomain.com` (and apex) at the CloudFront domain (CNAME / Route 53 alias).

> Wait for CloudFront deployment (~5–15 min), then open `https://www.yourdomain.com`.

---

## Part C — Environment variables recap

| Where | Variable | Value |
|-------|----------|-------|
| EC2 `.env` | `MONGODB_URI` | Atlas connection string |
| EC2 `.env` | `FRONTEND_URL` | `https://<cloudfront-domain>` (CORS allow-list) |
| EC2 `.env` | `JWT_SECRET`, `SMTP_*` | as before |
| Frontend build | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api` |

---

## Caveats
- **Uploads persist on the EC2 EBS volume** (survive reboots) — unlike Render. Back up `/opt/savant/backend/uploads` if you ever terminate the instance. For multi-instance setups, switch to Cloudinary (dep already installed).
- **Single instance**: this guide runs one EC2 box. For HA, use an Auto Scaling Group behind an ALB + EFS for uploads, or move to ECS Fargate.
- **Database is Atlas**, independent of AWS — no Mongo to manage.
- After code changes, redeploy: `git pull` on EC2 + `npm install --omit=dev` + `sudo systemctl restart savant-api`; rebuild `out/` and `aws s3 sync` for the frontend.
