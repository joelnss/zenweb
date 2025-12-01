# Development Server Commands

## What's Running

You're running the **Next.js Development Server** locally on your machine.

- **Server Type:** Next.js 16.0.4 with Turbopack
- **Runtime:** Node.js 20.19.5
- **Port:** http://localhost:3000
- **Purpose:** Development only (hot-reload, fast refresh, detailed errors)

## Starting the Server

### Method 1: Simple (requires Node 20 already active)

```bash
cd /Users/joelsamonie/Documents/buypcr/pcr-frontend
npm run dev
```

### Method 2: With NVM (recommended - ensures Node 20)

```bash
cd /Users/joelsamonie/Documents/buypcr/pcr-frontend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm run dev
```

### What You'll See

```
▲ Next.js 16.0.4 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.0.0.34:3000

✓ Ready in 876ms
```

**Open:** http://localhost:3000

---

## Stopping the Server

### If running in foreground (terminal):
Press `Ctrl + C` in the terminal window

### If running in background:
```bash
# Find the process
lsof -i :3000

# Kill by PID (replace XXXXX with actual PID)
kill -9 XXXXX

# Or kill all node processes (use with caution)
pkill -9 node
```

### Quick kill port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Checking Server Status

### Check if server is running:
```bash
lsof -i :3000
```

If running, you'll see output like:
```
COMMAND   PID        USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    12345 joelsamonie   23u  IPv4 0x123456789      0t0  TCP *:3000 (LISTEN)
```

### Check what's on port 3000:
```bash
curl http://localhost:3000
```

If working, you'll get HTML output.

---

## Common Issues & Solutions

### Issue 1: Port Already in Use
```
⚠ Port 3000 is in use by process XXXXX
```

**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Issue 2: Node Version Error
```
You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.
```

**Solution:**
```bash
nvm use 20
npm run dev
```

### Issue 3: Module Not Found
```
Error: Cannot find module 'framer-motion'
```

**Solution:**
```bash
npm install
npm run dev
```

---

## Production Server (Future)

When ready for production, you'll build and run differently:

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

Production server runs on port 3000 by default (no hot-reload, optimized builds).

---

## Server Modes Comparison

| Feature | Development (`npm run dev`) | Production (`npm start`) |
|---------|---------------------------|--------------------------|
| **Speed** | Slower (hot reload) | Faster (optimized) |
| **Errors** | Detailed stack traces | Generic errors |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Build Time** | None (on-demand) | Required (`npm run build`) |
| **Use Case** | Local development | Deployed app |
| **Port** | 3000 (default) | 3000 (default) |

---

## Quick Reference Card

### Daily Workflow

**Morning - Start development:**
```bash
cd /Users/joelsamonie/Documents/buypcr/pcr-frontend
nvm use 20
npm run dev
```

**While working:**
- Make code changes
- Browser auto-refreshes
- Check http://localhost:3000

**Evening - Stop development:**
- Press `Ctrl + C` in terminal
- Or close terminal window

---

## Environment Variables

Create `.env.local` for local overrides:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Restart server after changing environment variables.

---

## Useful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Clean cache (if issues)
rm -rf .next
npm run dev
```

---

## Monitoring Server Output

Watch for:
- ✅ `✓ Ready in XXXms` - Server started successfully
- ⚠️ Warnings - Usually safe to ignore
- ❌ Errors - Need to fix before server works
- 🔄 Compiling pages - Automatic as you navigate

---

## Network Access

**Local only:**
- http://localhost:3000 (you only)

**Network (other devices on same WiFi):**
- http://10.0.0.34:3000 (shown in terminal)
- View on phone/tablet on same network

---

## Logs Location

Development logs appear in terminal where you ran `npm run dev`.

Production logs (future):
```bash
# PM2 (if using)
pm2 logs

# Docker (if using)
docker logs <container-id>
```

---

## Need Help?

- **Server won't start:** Check Node version (`node -v`) should be 20+
- **Changes not showing:** Hard refresh browser (`Cmd+Shift+R` on Mac)
- **Port in use:** Kill process on port 3000 (see above)
- **Module errors:** Run `npm install` again

---

## Summary

**Start:** `npm run dev` (with Node 20)
**Stop:** `Ctrl + C`
**View:** http://localhost:3000
**Edit:** Save files → auto-refresh

That's it! 🚀
