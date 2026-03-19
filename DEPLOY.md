# Deploying to a Hetzner VPS

This guide deploys **peak-backend** (API + MySQL) on a single Hetzner VPS using Docker. The **peak** (Next.js) frontend can run on the same server or on Vercel pointing at your API URL.

---

## 1. Create the VPS on Hetzner

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud).
2. Create a project → **Add Server**.
3. Choose:
   - **Location**: Falkenstein or Nuremberg (or nearest).
   - **Image**: **Ubuntu 24.04**.
   - **Type**: CX22 or CPX11 (2 GB RAM is enough to start).
   - **SSH key**: Add your public key so you can log in without a password.
4. Create the server and note the **IP address** (e.g. `95.216.x.x`).

---

## 2. First login and basic setup

```bash
ssh root@YOUR_SERVER_IP
```

Optional: create a non-root user and use it for deployment (recommended).

```bash
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy   # after Docker is installed
```

Set a firewall (allow SSH and HTTP/HTTPS; restrict DB/API as needed):

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 3. Install Docker and Docker Compose

```bash
apt update && apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Check:

```bash
docker --version
docker compose version
```

---

## 4. Deploy backend + database

On your **local machine**, from the repo root:

```bash
# Copy backend (and optionally frontend) to the server
rsync -avz --exclude node_modules --exclude .git peak-backend/ root@YOUR_SERVER_IP:/opt/peak/peak-backend/
```

On the **server**:

Create **`.env`** in the repo root (`peaks/.env`). Copy from `.env.example`.

```bash
cd /opt/peak
nano .env
```

Then build and start:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend   # optional: watch logs
```

The API will listen on **port 3001**. To avoid exposing it directly on the internet, keep the firewall as above (no 3001) and put **Nginx** in front (next section).

---

## 5. Nginx reverse proxy (recommended)

Install Nginx and use it as a reverse proxy so the API is served over HTTPS on port 443.

```bash
apt install -y nginx
```

Create a config (replace `YOUR_DOMAIN` and `YOUR_SERVER_IP`):

```bash
nano /etc/nginx/sites-available/peak-api
```

Paste (HTTP only for now; we add SSL in step 6):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;   # e.g. api.yourdomain.com or yourdomain.com

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
ln -s /etc/nginx/sites-available/peak-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 6. SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN
```

Follow the prompts. Certbot will add HTTPS to your Nginx config and set up auto-renewal.

After this, your API is available at `https://YOUR_DOMAIN` (e.g. `https://api.yourdomain.com`).

---

## 7. Frontend (peak) – two options

### Option A: Same VPS (Node)

On the server, build and run the Next.js app so it talks to the API on the same host:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude .git peak/ root@YOUR_SERVER_IP:/opt/peak/peak/
```

On the server:

```bash
cd /opt/peak/peak
npm ci
echo "NEXT_PUBLIC_PEAK_BACKEND_URL=https://YOUR_DOMAIN" > .env.production
npm run build
npx next start -p 3000
```

Run under systemd or PM2 so it restarts on reboot. Point Nginx at `127.0.0.1:3000` for the frontend (e.g. `yourdomain.com`) and keep the API on a subdomain (e.g. `api.yourdomain.com`) as above.

### Option B: Vercel (or similar)

1. Deploy the **peak** app to Vercel.
2. Set the env var **`NEXT_PUBLIC_PEAK_BACKEND_URL`** to your API URL, e.g. `https://api.yourdomain.com`.
3. Redeploy. The frontend will call your Hetzner API.

---

## 8. CORS (if frontend is on another domain)

If the frontend runs on a different domain (e.g. Vercel), the backend must allow that origin. Your `peak-backend` already uses `cors()` in `src/app.ts`. For a specific origin:

```js
cors({ origin: "https://your-frontend.vercel.app", credentials: true, ... })
```

Adjust the origin to match your frontend URL.

---

## 9. Useful commands on the server

```bash
cd /opt/peak/peak-backend
docker compose ps
docker compose logs -f backend
docker compose down
docker compose up -d --build
```

---

## 10. Automated deployment (CI/CD)

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that deploys automatically on every push to `main`. It SSHs into the VPS, pulls the latest code, and rebuilds the Docker containers.

### One-time server setup

The project must be cloned on the server so `git pull` works:

```bash
ssh root@YOUR_SERVER_IP
cd /opt
git clone https://github.com/jorjegxg/peaks_frontend_backend_db.git peak
cd peak
cp .env.example .env
nano .env   # fill in real values
docker compose up -d --build
```

### GitHub repository secrets

Go to **GitHub → repo → Settings → Secrets and variables → Actions** and add these secrets:

| Secret name        | Value                                                    |
| ------------------ | -------------------------------------------------------- |
| `SERVER_HOST`      | VPS IP address (e.g. `95.216.x.x`)                      |
| `SERVER_USER`      | SSH user (e.g. `root` or `deploy`)                       |
| `SERVER_SSH_KEY`   | Private SSH key (see below)                              |
| `SERVER_PORT`      | SSH port (optional, default `22`)                        |

### Generate a deploy SSH key

On your **local machine** (or anywhere), generate a key pair dedicated to deployment:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/deploy_peak -N ""
```

Add the **public** key to the server:

```bash
ssh-copy-id -i ~/.ssh/deploy_peak.pub root@YOUR_SERVER_IP
```

Copy the **private** key content and paste it as the `SERVER_SSH_KEY` secret in GitHub:

```bash
cat ~/.ssh/deploy_peak.pub   # → server authorized_keys (done above)
cat ~/.ssh/deploy_peak        # → GitHub secret SERVER_SSH_KEY
```

### How it works

1. You push to `main` (or manually trigger the workflow).
2. GitHub Actions SSHs into the VPS.
3. Runs `git pull origin main` to fetch the latest code.
4. Runs `docker compose up -d --build` to rebuild and restart containers.
5. Cleans up old Docker images.

You can also trigger it manually from **GitHub → Actions → Deploy to VPS → Run workflow**.

---

## Checklist

- [ ] VPS created, SSH key added, firewall allows 22, 80, 443.
- [ ] Docker and Docker Compose installed.
- [ ] Repo cloned at `/opt/peak` on the server, `.env` configured.
- [ ] `docker compose up -d --build` runs db + backend + frontend.
- [ ] Nginx reverse proxy for the API (and optionally frontend).
- [ ] SSL with Certbot for your domain.
- [ ] Frontend: either on same VPS with `NEXT_PUBLIC_PEAK_BACKEND_URL=https://YOUR_DOMAIN`, or on Vercel with that env var.
- [ ] CORS origin set if frontend and API are on different domains.
- [ ] GitHub secrets set (`SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`).
- [ ] Push to `main` triggers automatic deployment.


test commit
test commit2