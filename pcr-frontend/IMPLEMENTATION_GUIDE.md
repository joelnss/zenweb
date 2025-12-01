# Implementation Guide - P.C. Resource Customer Portal

## Quick Overview

You now have a **complete customer IT support portal** with:
1. ✅ Modern Next.js 15 frontend (running on http://localhost:3000)
2. ✅ Complete backend requirements document
3. ✅ Ready to build backend and connect

---

## What's Built (Frontend)

### Homepage Sections:
1. **Hero** - "Reliable Tech Support, Right at Your Door"
2. **Service Cards** - 4 main offerings
3. **Detailed Services** - On-Site & Remote services explained
4. **Why Choose Us** - 6 benefits
5. **CTA** - Contact section

### Components Created:
```
components/
├── layout/
│   ├── Header.tsx       # Navigation
│   └── Footer.tsx       # Contact info
└── home/
    ├── HeroSection.tsx      # Main banner
    ├── ProductCards.tsx     # 4 service cards
    ├── ServicesDetail.tsx   # Detailed service lists
    └── WhyChooseUs.tsx      # Benefits + CTA
```

---

## Backend Architecture Ready

### Core Entities:
```
Customer → Users
         → Locations → Assets
         → Service Plans
         → Tickets → Appointments → Technicians
```

### Key Object: **IT Asset** (Intuitive Design)
```typescript
{
  friendlyName: "Joel's Work Laptop"    // Easy to understand
  category: "LAPTOP"                     // Simple category
  brand: "Dell"
  model: "Latitude 7420"
  primaryUser: "Joel"                    // Who uses it
  coverageStatus: "IN_PLAN"              // Is it covered?
  openTicketCount: 0                     // Any active issues?
}
```

---

## API Endpoints Summary

| Category | Endpoints |
|----------|-----------|
| **Auth** | login, refresh, me |
| **Assets** | list, get, create, update, delete (5) |
| **Locations** | list, create, update (3) |
| **Service Plans** | list, get (2) |
| **Tickets** | list, get, create, update, reply (7) |
| **Appointments** | list, get, create, update, status (5) |
| **Activities** | list, create note (2) |

**Total:** ~30 endpoints

---

## Recommended Tech Stacks

### Option A: Node.js (Recommended for JS developers)

```bash
# Stack
- Fastify (faster) or NestJS (more structure)
- Prisma (type-safe ORM)
- PostgreSQL 15+
- JWT auth (jose or passport.js)
- Zod validation

# Quick Start
cd backend
npm init -y
npm install fastify @fastify/cors @fastify/jwt @prisma/client
npm install -D prisma typescript @types/node tsx

# Setup Prisma
npx prisma init
# Edit prisma/schema.prisma with models
npx prisma migrate dev --name init
```

### Option B: Python (Recommended for Python developers)

```bash
# Stack
- FastAPI (modern, fast)
- SQLAlchemy 2.0 (ORM)
- PostgreSQL 15+
- python-jose (JWT)
- Pydantic (validation)

# Quick Start
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose python-multipart

# Create structure
mkdir -p app/models app/routes app/schemas
```

---

## Database Schema (PostgreSQL)

### Tables to Create:
```
1. customers
2. users
3. locations
4. service_plans
5. assets
6. tickets
7. appointments
8. activities
```

### Sample Prisma Schema:
```prisma
model Customer {
  id           String   @id @default(uuid())
  type         String   // INDIVIDUAL, BUSINESS, etc.
  name         String
  contactEmail String
  contactPhone String
  status       String   @default("ACTIVE")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  users        User[]
  locations    Location[]
  assets       Asset[]
  tickets      Ticket[]
  servicePlans ServicePlan[]
}

model Asset {
  id             String   @id @default(uuid())
  customerId     String
  locationId     String
  friendlyName   String
  category       String
  brand          String
  model          String
  serialNumber   String   @unique
  primaryUser    String
  status         String   @default("ACTIVE")
  os             String?
  coverageStatus String   @default("OUT_OF_PLAN")
  servicePlanId  String?
  tags           String[]
  notes          String?
  purchaseDate   DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  customer     Customer    @relation(fields: [customerId], references: [id])
  location     Location    @relation(fields: [locationId], references: [id])
  servicePlan  ServicePlan? @relation(fields: [servicePlanId], references: [id])
  tickets      Ticket[]
}

// ... other models
```

---

## Frontend-Backend Connection

### 1. Update Environment Variable

```bash
# In pcr-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 2. Backend Already Configured

The frontend API client (`lib/api/client.ts`) is ready to use this URL.

### 3. Test Connection

```typescript
// In any server component
import { getAssets } from '@/lib/api/endpoints';

export default async function Page() {
  const { data } = await getAssets({ page: 1 });
  return <div>Found {data.length} assets</div>;
}
```

---

## Key Workflows Implemented

### Workflow 1: Customer Registers Device
```
1. Customer logs in
2. Goes to "Register Device" page
3. Fills form (friendlyName, category, brand, model, etc.)
4. Frontend: POST /assets
5. Backend: Creates asset linked to customer & location
6. Customer sees device in "My Devices"
```

### Workflow 2: Customer Opens Support Ticket
```
1. Customer clicks "Get Help" on a device
2. Fills support form (title, description, priority)
3. Frontend: POST /tickets with assetId
4. Backend: Creates ticket linked to asset & customer
5. Agent receives notification
6. Agent assigns technician
```

### Workflow 3: Schedule Appointment
```
1. Customer or agent schedules visit
2. Frontend: POST /tickets/:id/appointments
3. Backend: Creates appointment with technician
4. Customer sees upcoming appointment
5. Technician updates status (IN_TRANSIT, IN_PROGRESS, COMPLETED)
6. Customer sees real-time updates
```

---

## File Structure (Recommended Backend)

### Node.js (Fastify)
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── assets.ts
│   │   ├── tickets.ts
│   │   └── appointments.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── asset.service.ts
│   │   └── ticket.service.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

### Python (FastAPI)
```
backend/
├── app/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── assets.py
│   │   ├── tickets.py
│   │   └── appointments.py
│   ├── models/
│   │   ├── customer.py
│   │   ├── asset.py
│   │   └── ticket.py
│   ├── schemas/
│   │   └── asset.py
│   ├── services/
│   │   └── auth.py
│   └── main.py
├── requirements.txt
└── alembic.ini
```

---

## Next Steps (Your Action Items)

### Step 1: Choose Stack
- [ ] Node.js with Fastify/NestJS
- [ ] Python with FastAPI

### Step 2: Set Up Database
- [ ] Install PostgreSQL
- [ ] Create database `pcr_support_db`
- [ ] Set up connection string

### Step 3: Create Backend Project
- [ ] Initialize project
- [ ] Install dependencies
- [ ] Set up ORM (Prisma or SQLAlchemy)
- [ ] Create database schema

### Step 4: Implement Auth
- [ ] User registration
- [ ] Login with JWT
- [ ] Password hashing
- [ ] Token refresh

### Step 5: Build Core Endpoints
- [ ] Assets CRUD
- [ ] Tickets CRUD
- [ ] Appointments CRUD
- [ ] Locations CRUD

### Step 6: Add Business Logic
- [ ] Auto-assign ticket numbers
- [ ] Calculate coverage status
- [ ] Track open ticket counts
- [ ] SLA due date calculations

### Step 7: Test & Deploy
- [ ] Unit tests
- [ ] Integration tests with frontend
- [ ] Deploy backend (Railway, Heroku, DigitalOcean, AWS)
- [ ] Update frontend .env.local with production URL

---

## Quick Backend Start (Node.js Example)

```bash
# 1. Create backend directory
mkdir backend && cd backend

# 2. Initialize project
npm init -y

# 3. Install dependencies
npm install fastify @fastify/cors @fastify/jwt @prisma/client bcrypt
npm install -D prisma typescript @types/node tsx

# 4. Initialize Prisma
npx prisma init

# 5. Edit prisma/schema.prisma (use models from BACKEND_REQUIREMENTS.md)

# 6. Create and run migration
npx prisma migrate dev --name init

# 7. Create basic server
# Create src/app.ts with Fastify setup

# 8. Run server
npm run dev
```

---

## Resources

### Frontend Docs:
- README.md - Project overview
- FRONTEND_ARCHITECTURE.md - Complete architecture
- BACKEND_API_SPEC.md - Original API spec
- BACKEND_REQUIREMENTS.md - New detailed requirements
- DEV_SERVER_COMMANDS.md - Server commands

### External Resources:
- [Fastify Docs](https://www.fastify.io/)
- [Prisma Docs](https://www.prisma.io/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## Support

For questions:
- Check documentation files above
- Review BACKEND_REQUIREMENTS.md for API details
- Check frontend API client: `lib/api/endpoints.ts`

---

## Summary Checklist

- ✅ Frontend built and running (localhost:3000)
- ✅ Homepage content tailored to P.C. Resource
- ✅ API layer ready in frontend
- ✅ Complete backend requirements documented
- ✅ Data models designed
- ✅ API endpoints specified
- ✅ Workflows documented
- ⏳ Backend implementation (your next step)
- ⏳ Database setup (your next step)
- ⏳ Deploy and connect (final step)

**You're ready to start building the backend!** 🚀
