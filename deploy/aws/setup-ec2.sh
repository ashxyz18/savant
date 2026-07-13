#!/usr/bin/env bash
# SAVANT easiest AWS setup: ONE EC2, Nginx serves the static frontend and
# proxies /api + /uploads to the Node backend. No S3/CloudFront.
# Run on the instance as the default user (ubuntu):  bash setup-ec2.sh
set -euo pipefail

echo "===== SAVANT EC2 setup (single-server) ====="

read -p "Git repo URL (HTTPS): " REPO_URL
read -p "Main domain (e.g. www.example.com, apex optional): " DOMAIN
read -p "Frontend URL (default https://$DOMAIN): " FRONTEND_URL
FRONTEND_URL="${FRONTEND_URL:-https://$DOMAIN}"
read -s -p "MongoDB Atlas URI: " MONGODB_URI; echo
read -p "SMTP host (e.g. smtp-relay.brevo.com): " SMTP_HOST
read -p "SMTP port [587]: " SMTP_PORT
SMTP_PORT="${SMTP_PORT:-587}"
read -p "SMTP user: " SMTP_USER
read -s -p "SMTP password: " SMTP_PASSWORD; echo

JWT_SECRET="$(openssl rand -hex 32)"

echo "== Updating system =="
sudo apt-get update
sudo apt-get -y upgrade

echo "== Installing Node.js 20 =="
if curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get -y install nodejs; then
  echo "Node installed via NodeSource."
else
  echo "NodeSource failed (very new Ubuntu?). Installing portable binary..."
  V=v20.18.0; A=x64
  curl -fsSL "https://nodejs.org/dist/$V/node-$V-linux-$A.tar.xz" -o /tmp/node.tar.xz
  sudo tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
fi
node -v; npm -v

echo "== Installing nginx, git, certbot, pm2 =="
sudo apt-get -y install nginx git
sudo npm install -g pm2

echo "== Cloning repo into /opt/savant =="
sudo rm -rf /opt/savant
sudo mkdir -p /opt/savant
sudo chown "$(whoami):$(whoami)" /opt/savant
git clone "$REPO_URL" /opt/savant
cd /opt/savant/backend
npm install --omit=dev

echo "== Writing /opt/savant/backend/.env =="
cat > /opt/savant/backend/.env <<EOF
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
NODE_ENV=production
PORT=5000
EOF
echo ".env written."

echo "== Enabling systemd service =="
sudo cp /opt/savant/deploy/aws/savant-api.service /etc/systemd/system/savant-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now savant-api
sleep 3
sudo systemctl status savant-api --no-pager || true

echo "== Configuring Nginx (static frontend + /api proxy) =="
sudo mkdir -p /var/www/savant
sudo cp /opt/savant/deploy/aws/nginx-full.conf /etc/nginx/sites-available/savant
sudo sed -i "s/www.example.com example.com/$DOMAIN/g" /etc/nginx/sites-available/savant
sudo ln -sfn /etc/nginx/sites-available/savant /etc/nginx/sites-enabled/savant
# Remove the default site so our config is the one served on :80
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "== Seeding database =="
cd /opt/savant/backend && npm run seed || echo "Seed failed (check MONGODB_URI / network). Re-run: cd /opt/savant/backend && npm run seed"

echo ""
echo "===== SERVER READY ====="
echo "Frontend files are uploaded separately (see deploy-frontend.ps1)."
echo "Next steps:"
echo " 1) Point DNS:  $DOMAIN  -> this instance's Elastic/Public IP (A record)."
echo " 2) On your local machine run:  pwsh deploy/aws/deploy-frontend.ps1"
echo " 3) Get the TLS cert:  sudo certbot --nginx -d $DOMAIN"
echo " 4) Verify:  curl http://$DOMAIN/api/health"
