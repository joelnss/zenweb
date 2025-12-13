# PCR Portal - Deployment Guide

## Platform Overview

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | Next.js 16.0.4 | 3000 (production) |
| Backend | Express.js + SQLite | 3001 |
| Process Manager | PM2 | - |
| Reverse Proxy | Nginx | 80/443 |

## Server Information

- **EC2 Instance**: `i-010b5267d932f733c`
- **Public IP**: `3.148.178.164`
- **Region**: us-east-2
- **Instance Type**: t2.micro
- **Domain**: https://zenweb.studio

## SSH Access

```bash
ssh -i ~/Documents/buypcr/sshrsa.pem ec2-user@3.148.178.164
```

## Local Development

### Prerequisites
- Node.js v20+ (use nvm)
- npm

### Start Local Servers

```bash
# Terminal 1 - Backend (port 3001)
cd ~/Documents/buypcr/pcr-backend
npm install
npm start

# Terminal 2 - Frontend (port 3000)
cd ~/Documents/buypcr/pcr-frontend
nvm use 20
npm install
npm run dev
```

### Local URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Portal: http://localhost:3000/portal
- Dashboard: http://localhost:3000/dashboard

### Test Credentials
- Admin: `admin@admin.com` / `admin`

## Deployment Process

### Quick Deploy (Files Only)

```bash
# 1. Build production bundle
cd ~/Documents/buypcr/pcr-frontend
nvm use 20
npm run build

# 2. Upload to server
scp -i ~/Documents/buypcr/sshrsa.pem -r \
  ~/Documents/buypcr/pcr-frontend/.next \
  ~/Documents/buypcr/pcr-frontend/components \
  ec2-user@3.148.178.164:~/zenith/

# 3. Restart service
ssh -i ~/Documents/buypcr/sshrsa.pem ec2-user@3.148.178.164 \
  "source ~/.nvm/nvm.sh && pm2 restart zenith"
```

### Full Deploy (All Files)

```bash
# 1. Build
cd ~/Documents/buypcr/pcr-frontend
nvm use 20
npm run build

# 2. Create tarball (excludes node_modules)
cd ~/Documents/buypcr
tar --exclude='node_modules' --exclude='.next/cache' --exclude='.git' \
  -czvf pcr-deploy.tar.gz pcr-frontend pcr-backend

# 3. Upload tarball
scp -i ~/Documents/buypcr/sshrsa.pem pcr-deploy.tar.gz \
  ec2-user@3.148.178.164:~/

# 4. Extract and install on server
ssh -i ~/Documents/buypcr/sshrsa.pem ec2-user@3.148.178.164 << 'EOF'
  source ~/.nvm/nvm.sh
  tar -xzvf pcr-deploy.tar.gz
  cd pcr-backend && npm install
  cd ../pcr-frontend && npm install
  # Copy to production directory
  rm -rf ~/zenith/.next ~/zenith/components ~/zenith/lib ~/zenith/app
  cp -r ~/pcr-frontend/.next ~/pcr-frontend/components ~/pcr-frontend/lib ~/pcr-frontend/app ~/zenith/
  pm2 restart zenith
  pm2 restart pcr-backend
EOF
```

## Server Management

### PM2 Commands

```bash
# SSH into server first
ssh -i ~/Documents/buypcr/sshrsa.pem ec2-user@3.148.178.164

# View running processes
pm2 list

# View logs
pm2 logs zenith --lines 50
pm2 logs pcr-backend --lines 50

# Restart services
pm2 restart zenith
pm2 restart pcr-backend

# Stop/Start
pm2 stop zenith
pm2 start zenith

# Save PM2 config (persists after reboot)
pm2 save
```

### Server Directory Structure

```
/home/ec2-user/
├── zenith/              # Production frontend (served via Nginx)
│   ├── .next/           # Next.js build output
│   ├── components/
│   ├── lib/
│   ├── app/
│   └── package.json
├── pcr-frontend/        # Staging/backup frontend
├── pcr-backend/         # Backend API
│   ├── server.js
│   ├── database.sqlite
│   └── package.json
└── sshrsa.pem           # SSH key (if needed)
```

### Nginx Configuration

Located at: `/etc/nginx/conf.d/default.conf`

```nginx
server {
    server_name zenweb.studio www.zenweb.studio;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/zenweb.studio/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zenweb.studio/privkey.pem;
}
```

## API Endpoints

### Backend (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/tickets | Get all tickets |
| GET | /api/tickets/:id | Get single ticket |
| POST | /api/tickets | Create ticket |
| PUT | /api/tickets/:id | Update ticket |
| DELETE | /api/tickets/:id | Delete ticket |
| GET | /api/users | Get all users |
| POST | /api/users/register | Register user |
| POST | /api/users/login | Login user |
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production
The frontend connects to the backend at `http://localhost:3001/api` (same server).

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

### PM2 Process Errors
```bash
pm2 logs zenith --err --lines 50
pm2 restart zenith --update-env
```

### Nginx Issues
```bash
sudo nginx -t          # Test config
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### Database Reset
```bash
# On server
cd ~/pcr-backend
rm database.sqlite
pm2 restart pcr-backend  # Will recreate empty DB
```

## Key Files

| File | Description |
|------|-------------|
| `pcr-frontend/components/portal/SupportTicketForm.tsx` | Main ticket form |
| `pcr-frontend/app/dashboard/page.tsx` | Admin/user dashboard |
| `pcr-frontend/lib/api/tickets.ts` | API service layer |
| `pcr-backend/server.js` | Express API server |
| `~/Documents/buypcr/sshrsa.pem` | SSH key for deployment |

## Notes

- Test data button only shows in development mode (`npm run dev`)
- Production build hides dev-only features
- Always run `npm run build` before deploying
- The "zenith" PM2 process serves the live site on port 3000
