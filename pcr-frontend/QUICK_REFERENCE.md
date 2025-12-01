# Quick Reference Card

## Server Commands

### Start Server
```bash
cd /Users/joelsamonie/Documents/buypcr/pcr-frontend
nvm use 20
npm run dev
```
**Then open:** http://localhost:3000

### Stop Server
Press `Ctrl + C` in terminal

**OR kill port 3000:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## File Locations

```
/Users/joelsamonie/Documents/buypcr/pcr-frontend/
```

**Components:**
- Header: `components/layout/Header.tsx`
- Footer: `components/layout/Footer.tsx`
- Hero: `components/home/HeroSection.tsx`
- Product Cards: `components/home/ProductCards.tsx`

**Pages:**
- Homepage: `app/page.tsx`
- AssetHub: `app/assethub/page.tsx`
- ServiceHub: `app/servicehub/page.tsx`
- QuoteHub: `app/quotehub/page.tsx`
- ContractHub: `app/contracthub/page.tsx`

**Styles:**
- Global CSS: `app/globals.css`
- Tailwind Config: `tailwind.config.ts`

**API Layer:**
- Client: `lib/api/client.ts`
- Endpoints: `lib/api/endpoints.ts`
- Types: `lib/types/index.ts`

---

## Common Tasks

### Make Code Changes
1. Edit any `.tsx` file
2. Save (Cmd+S)
3. Browser auto-refreshes

### Add New Page
```bash
mkdir app/newpage
touch app/newpage/page.tsx
```

### Install Package
```bash
npm install package-name
```

### Check for Errors
```bash
npm run lint
```

---

## Documentation Files

- **README.md** - Project overview
- **DEV_SERVER_COMMANDS.md** - Server start/stop/troubleshooting
- **GETTING_STARTED.md** - Detailed walkthrough
- **FRONTEND_ARCHITECTURE.md** - Complete architecture guide
- **BACKEND_API_SPEC.md** - Backend API specification

---

## URLs

- **Local:** http://localhost:3000
- **Network:** http://10.0.0.34:3000

---

## Troubleshooting

**Server won't start:**
```bash
nvm use 20
npm install
npm run dev
```

**Port in use:**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Changes not showing:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## Contact Info (in Footer)

- Phone: 810-874-2069
- Email: sales@buypcr.com
- Support: support@buypcr.com
