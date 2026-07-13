# Builds the static frontend and uploads it to the EC2 /var/www/savant.
# Run locally from PowerShell:  pwsh deploy/aws/deploy-frontend.ps1
$ErrorActionPreference = 'Stop'

$Domain = Read-Host "Frontend domain (e.g. www.example.com)"
$IP     = Read-Host "EC2 public IP"
$Key    = Read-Host "Path to .pem file (e.g. C:\Users\you\savant.pem)"

# Resolve the frontend folder relative to this script (deploy/aws -> ../.. -> frontend)
$frontendDir = Resolve-Path (Join-Path $PSScriptRoot '..\..\frontend')
Set-Location $frontendDir

# NEXT_PUBLIC_API_URL is read at BUILD time. Point it at this server's /api.
$env:NEXT_PUBLIC_API_URL = "https://$Domain/api"

Write-Host "== Building static export =="
npm install
npm run build

Write-Host "== Uploading out/ to /var/www/savant on $IP =="
scp -i $Key -r out "ubuntu@${IP}:/tmp/savant-out"

Write-Host "== Installing into place on the server =="
ssh -i $Key "ubuntu@${IP}" "sudo rm -rf /var/www/savant && sudo mkdir -p /var/www/savant && sudo cp -r /tmp/savant-out/out/. /var/www/savant/ && sudo chown -R ubuntu:ubuntu /var/www/savant && sudo nginx -t && sudo systemctl reload nginx"

Write-Host ""
Write-Host "Frontend deployed to https://$Domain" -ForegroundColor Green
Write-Host "If scp -r failed, manually upload the local 'out' folder to /var/www/savant (e.g. with FileZilla)."
