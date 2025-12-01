# Backend Requirements – Customer IT Support & Asset Portal

## 1. Purpose & Goals

Build a backend for a **customer service portal** where end users can:
- ✅ Register and manage their IT devices (assets)
- ✅ See which devices are covered by support plans
- ✅ Open and track support tickets
- ✅ Schedule remote or on-site appointments
- ✅ See dispatch status (technician on the way, completed, etc.)
- ✅ View support history for each device

**This is a service portal, not a store.** Customers use it to get help with their gear.

### Backend Must:
- Power the Next.js 15 frontend via clean JSON REST API
- Have intuitive objects, especially the **IT Asset**
- Keep all objects interconnected (customer ↔ assets ↔ tickets ↔ appointments)
- Be ready for future multi-tenant / enterprise use

---

## 2. Core Concepts & Relationships

### Key Entities

| Entity | Description |
|--------|-------------|
| **Customer** | Individual or company who owns devices and uses the portal |
| **User** | Login identity under a customer (account holder, family member, IT contact) |
| **Location** | Home or office where devices live (e.g., "Main Office", "Home Office") |
| **Asset** | A device: laptop, desktop, server, router, monitor, etc. |
| **ServicePlan** | Support plan / warranty that covers one or more assets |
| **Ticket** | Support request created by customer or agent |
| **Appointment** | Scheduled time for technician (remote or on-site) |
| **Technician** | Internal user that handles tickets and dispatch jobs |
| **Note/Activity** | Timeline events on tickets/assets (updates, comments, status changes) |

### Relationships

```
Customer
  ├─ has many Users
  ├─ has many Locations
  │    └─ has many Assets
  ├─ has many Assets (through Locations)
  ├─ has many ServicePlans
  └─ has many Tickets

Asset
  ├─ belongs to Customer
  ├─ belongs to Location
  ├─ may belong to ServicePlan
  └─ has many Tickets

Ticket
  ├─ belongs to Customer
  ├─ optionally belongs to Asset
  ├─ optionally belongs to Location
  ├─ has many Notes/Activities
  └─ may have one Appointment

Appointment
  ├─ belongs to Ticket
  └─ assigned to Technician

Technician
  └─ is a User with role TECH/AGENT
```

---

## 3. Intuitive IT Asset Object

The **Asset** should be simple for non-technical people but rich enough for support.

### Asset Fields

#### Required Fields
```typescript
{
  id: string; // UUID
  customerId: string;
  locationId: string;
  friendlyName: string; // e.g., "Joel's Work Laptop"
  category: 'LAPTOP' | 'DESKTOP' | 'SERVER' | 'NETWORK' | 'MONITOR' | 'PRINTER' | 'OTHER';
  brand: string; // e.g., "Dell", "HP", "Lenovo", "Apple"
  model: string; // e.g., "Precision 5820"
  serialNumber: string;
  primaryUser: string; // Free text, e.g., "Joel"
  status: 'ACTIVE' | 'IN_REPAIR' | 'RETIRED';
  os: string; // e.g., "Windows 11 Pro", "macOS Sequoia"
  coverageStatus: 'IN_PLAN' | 'OUT_OF_PLAN' | 'EXPIRED';
}
```

#### Optional Fields
```typescript
{
  purchaseDate?: string; // ISO date
  servicePlanId?: string;
  tags?: string[]; // e.g., ["office", "critical"]
  notes?: string;
  warrantyEndDate?: string;
}
```

#### Computed/Helper Fields
```typescript
{
  openTicketCount: number;
  lastTicketAt?: string;
  lastServiceAt?: string;
  daysUntilWarrantyExpires?: number;
}
```

**Key Principle:** A customer can look at one screen and know what the device is, where it is, who uses it, and whether it's covered.

---

## 4. Complete Data Models

### Customer
```typescript
{
  id: string;
  type: 'INDIVIDUAL' | 'BUSINESS' | 'EDUCATION' | 'GOVERNMENT' | 'NONPROFIT';
  name: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}
```

### User
```typescript
{
  id: string;
  customerId: string;
  email: string; // Login
  passwordHash: string; // Bcrypt/Argon2
  name: string;
  phone?: string;
  role: 'CUSTOMER_USER' | 'CUSTOMER_ADMIN' | 'AGENT' | 'TECH' | 'ADMIN';
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Location
```typescript
{
  id: string;
  customerId: string;
  name: string; // e.g., "Home", "HQ", "Branch Office"
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isPrimary: boolean;
  accessInstructions?: string; // e.g., "Gate code: 1234"
  createdAt: string;
  updatedAt: string;
}
```

### ServicePlan
```typescript
{
  id: string;
  customerId: string;
  name: string; // e.g., "Premium Support"
  planType: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  coverageLevel: 'REMOTE_ONLY' | 'REMOTE_PLUS_ONSITE' | 'FULL_SERVICE';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  monthlyPrice?: number;
  termsSummary: string;
  sla?: {
    responseTime: string; // e.g., "4 hours"
    resolutionTime: string; // e.g., "24 hours"
    supportHours: string; // e.g., "24/7" or "Business hours"
  };
  createdAt: string;
  updatedAt: string;
}
```

### Ticket
```typescript
{
  id: string;
  ticketNumber: string; // e.g., "TKT-2024-001"
  customerId: string;
  assetId?: string; // Optional - ticket might not be about specific asset
  locationId?: string;
  createdByUserId: string;
  assignedToUserId?: string; // Agent/Tech
  title: string;
  description: string;
  category: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCOUNT' | 'QUESTION' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  source: 'PORTAL' | 'PHONE' | 'EMAIL' | 'INTERNAL';
  slaDueAt?: string;
  resolution?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}
```

### Appointment (DispatchJob)
```typescript
{
  id: string;
  ticketId: string;
  technicianId?: string; // Assigned technician
  type: 'REMOTE_SESSION' | 'ONSITE_VISIT';
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartAt?: string;
  actualEndAt?: string;
  locationId?: string; // For onsite visits
  remoteSessionUrl?: string; // For remote sessions
  customerNotes?: string; // Visible to customer
  technicianNotes?: string; // Internal only
  completionSummary?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Technician (Extended User)
```typescript
// No separate table - use User with role 'TECH' or 'AGENT'
// Add these optional fields to User:
{
  skills?: string[]; // e.g., ["HARDWARE", "NETWORK", "SOFTWARE"]
  defaultRegion?: string; // e.g., "Michigan"
  certifications?: string[];
  availability?: {
    monday: { start: string; end: string; };
    tuesday: { start: string; end: string; };
    // ... other days
  };
}
```

### Note / Activity
```typescript
{
  id: string;
  ticketId: string;
  authorUserId: string;
  isInternal: boolean; // True = only visible to agents/techs
  body: string;
  type: 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'APPOINTMENT_SCHEDULED' | 'RESOLUTION';
  metadata?: Record<string, any>; // e.g., { oldStatus: 'OPEN', newStatus: 'IN_PROGRESS' }
  createdAt: string;
}
```

---

## 5. API Design (Customer Portal Focus)

**Base URL:** `/api/v1`

### Auth & Current User

#### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "data": {
    "user": { ... },
    "customer": { ... },
    "token": "eyJhbGc...",
    "expiresAt": "2025-11-25T..."
  }
}
```

#### POST /auth/refresh
Refresh JWT token

#### GET /auth/me
```json
Response:
{
  "data": {
    "user": { id, email, name, role },
    "customer": { id, name, type },
    "permissions": ["read:assets", "write:tickets", ...]
  }
}
```

---

### Assets

#### GET /assets
List assets for logged-in customer

**Query Params:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `status` (ACTIVE | IN_REPAIR | RETIRED)
- `locationId` (filter by location)
- `servicePlanId` (filter by plan)
- `search` (search friendlyName, brand, model, serialNumber)

```json
Response:
{
  "data": [
    {
      "id": "uuid",
      "friendlyName": "Joel's Work Laptop",
      "category": "LAPTOP",
      "brand": "Dell",
      "model": "Latitude 7420",
      "serialNumber": "ABC123",
      "status": "ACTIVE",
      "coverageStatus": "IN_PLAN",
      "openTicketCount": 0,
      "lastServiceAt": "2024-10-15T..."
    }
  ],
  "pagination": { page: 1, pageSize: 20, totalPages: 3, totalCount: 52 }
}
```

#### GET /assets/:id
Asset details + linked tickets summary

```json
Response:
{
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "locationId": "uuid",
    "location": { name: "Main Office", ... },
    "friendlyName": "Joel's Work Laptop",
    "category": "LAPTOP",
    "brand": "Dell",
    "model": "Latitude 7420",
    "serialNumber": "ABC123",
    "primaryUser": "Joel",
    "status": "ACTIVE",
    "os": "Windows 11 Pro",
    "coverageStatus": "IN_PLAN",
    "servicePlan": { ... },
    "recentTickets": [ ... ],
    "openTicketCount": 0,
    "totalTicketCount": 3,
    "lastServiceAt": "2024-10-15T...",
    "purchaseDate": "2024-01-15",
    "warrantyEndDate": "2027-01-15",
    "tags": ["office", "critical"],
    "notes": "Main workstation",
    "createdAt": "2024-01-15T...",
    "updatedAt": "2024-11-24T..."
  }
}
```

#### POST /assets
Customer can register a new device

```json
Request:
{
  "friendlyName": "Joel's Laptop",
  "category": "LAPTOP",
  "brand": "Dell",
  "model": "Latitude 7420",
  "serialNumber": "ABC123",
  "locationId": "uuid",
  "primaryUser": "Joel",
  "os": "Windows 11 Pro",
  "purchaseDate": "2024-01-15",
  "tags": ["office"]
}

Response:
{
  "data": { ... created asset ... }
}
```

#### PUT /assets/:id
Update asset (friendlyName, location, tags, notes, etc.)

#### DELETE /assets/:id
Soft delete / retire asset

---

### Locations

#### GET /locations
```json
Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Main Office",
      "addressLine1": "123 Main St",
      "city": "Flint",
      "state": "MI",
      "postalCode": "48382",
      "isPrimary": true
    }
  ]
}
```

#### POST /locations
Create new location

#### PUT /locations/:id
Update location

---

### Service Plans

#### GET /service-plans
Plans for this customer

```json
Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium Support",
      "planType": "PREMIUM",
      "coverageLevel": "REMOTE_PLUS_ONSITE",
      "status": "ACTIVE",
      "startDate": "2024-01-01",
      "endDate": "2025-01-01",
      "coveredAssetCount": 5,
      "sla": {
        "responseTime": "4 hours",
        "resolutionTime": "24 hours",
        "supportHours": "Business hours"
      }
    }
  ]
}
```

#### GET /service-plans/:id
Plan details + covered assets

---

### Tickets

#### GET /tickets
List tickets for this customer

**Query Params:**
- `page`, `pageSize`
- `status` (OPEN | IN_PROGRESS | RESOLVED | CLOSED)
- `assetId` (filter by asset)
- `locationId` (filter by location)
- `priority` (LOW | MEDIUM | HIGH | CRITICAL)

```json
Response:
{
  "data": [
    {
      "id": "uuid",
      "ticketNumber": "TKT-2024-001",
      "title": "Laptop won't boot",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "category": "HARDWARE",
      "asset": { friendlyName: "Joel's Laptop", ... },
      "assignedTo": { name: "Tech Support", ... },
      "createdAt": "2024-11-24T...",
      "updatedAt": "2024-11-24T..."
    }
  ],
  "pagination": { ... }
}
```

#### GET /tickets/:id
Full ticket details + activity timeline

```json
Response:
{
  "data": {
    "id": "uuid",
    "ticketNumber": "TKT-2024-001",
    "title": "Laptop won't boot",
    "description": "Screen shows black on startup",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "category": "HARDWARE",
    "asset": { ... },
    "location": { ... },
    "assignedTo": { ... },
    "appointment": { ... },
    "activities": [
      {
        "id": "uuid",
        "type": "COMMENT",
        "body": "Technician is on the way",
        "author": { ... },
        "createdAt": "2024-11-24T..."
      }
    ],
    "createdAt": "2024-11-24T...",
    "updatedAt": "2024-11-24T..."
  }
}
```

#### POST /tickets
Create new support request

```json
Request:
{
  "title": "Laptop won't boot",
  "description": "Screen shows black on startup",
  "category": "HARDWARE",
  "priority": "HIGH",
  "assetId": "uuid", // Optional
  "locationId": "uuid" // Optional
}

Response:
{
  "data": { ... created ticket ... }
}
```

#### PUT /tickets/:id
Update title/description/category/priority

#### PATCH /tickets/:id/status
Change ticket status

```json
Request:
{
  "status": "RESOLVED",
  "resolution": "Replaced hard drive"
}
```

#### POST /tickets/:id/reply
Customer adds a comment

```json
Request:
{
  "body": "Still having the same issue"
}
```

#### POST /tickets/:id/attach-asset
Link asset to ticket

---

### Appointments / Dispatch

#### GET /appointments
List upcoming + recent appointments for logged-in customer

```json
Response:
{
  "data": [
    {
      "id": "uuid",
      "ticket": { ticketNumber: "TKT-2024-001", ... },
      "type": "ONSITE_VISIT",
      "status": "SCHEDULED",
      "scheduledStartAt": "2024-11-25T10:00:00Z",
      "scheduledEndAt": "2024-11-25T12:00:00Z",
      "technician": { name: "John Doe", ... },
      "location": { ... }
    }
  ]
}
```

#### GET /appointments/:id
Appointment details

#### POST /tickets/:id/appointments
Request an appointment

```json
Request:
{
  "type": "ONSITE_VISIT",
  "scheduledStartAt": "2024-11-25T10:00:00Z",
  "scheduledEndAt": "2024-11-25T12:00:00Z",
  "locationId": "uuid",
  "customerNotes": "Please call when arriving"
}
```

#### PATCH /appointments/:id
Reschedule or cancel

```json
Request:
{
  "scheduledStartAt": "2024-11-26T14:00:00Z",
  "scheduledEndAt": "2024-11-26T16:00:00Z"
}
```

#### POST /appointments/:id/status (Internal)
Technician updates status

```json
Request:
{
  "status": "IN_PROGRESS",
  "actualStartAt": "2024-11-25T10:05:00Z"
}
```

---

### Customers (Internal - Agent/Admin only)

#### GET /customers
List all customers (paginated, searchable)

#### GET /customers/:id
Customer details

---

### Technicians (Internal)

#### GET /technicians
List available technicians

```json
Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@pcresource.com",
      "skills": ["HARDWARE", "NETWORK"],
      "defaultRegion": "Michigan",
      "availability": { ... }
    }
  ]
}
```

---

### Activities

#### GET /tickets/:id/activities
Get activity timeline for ticket

#### POST /tickets/:id/notes (Internal)
Add internal note (agent/tech only)

```json
Request:
{
  "body": "Ordered replacement part",
  "isInternal": true
}
```

---

## 6. Key Workflows

### A. New Customer Onboarding

1. Customer account + primary User created
2. Customer sets up one or more Locations
3. Customer registers devices as Assets at those Locations
4. Assets auto-linked to ServicePlans or manually attached

### B. Customer Opens a Ticket

1. Customer clicks "Get Help" on a device or from dashboard
2. Frontend calls `POST /tickets` with: `assetId` (optional), `description`, `category`, `priority`
3. Ticket created with `status = OPEN`, `source = PORTAL`
4. Agents see it in queue and assign a Technician (internal UI)

### C. Dispatch / Appointment Scheduling

1. Agent or customer selects onsite or remote
2. Frontend calls `POST /tickets/:id/appointments` with time window and location
3. Backend creates Appointment linked to Ticket + Technician
4. Customer sees upcoming visit in `/appointments` and on Ticket detail
5. Technician updates status; customer sees live updates

### D. Closing the Loop

1. Technician resolves issue, updates ticket: `status = RESOLVED` or `CLOSED`
2. Ticket and Appointment show in history for Asset and Customer
3. Asset's `lastServiceAt` and `openTicketCount` updated

---

## 7. Roles & Permissions

| Role | Permissions |
|------|-------------|
| **CUSTOMER_USER** | View their customer's assets, tickets, appointments. Create tickets. Edit assets. |
| **CUSTOMER_ADMIN** | Everything CUSTOMER_USER can do + manage other users and locations. |
| **AGENT** | Manage all customers, tickets, appointments. Assign technicians. |
| **TECH** | View assigned tickets and appointments. Add notes. Update statuses. |
| **ADMIN** | Full system access, configuration. |

---

## 8. Implementation Notes

### Response Format
All responses match frontend types:

```typescript
// Single resource
ApiResponse<T> = {
  data: T;
  message?: string;
  timestamp: string;
}

// List of resources
PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}
```

### Standards
- All IDs use **UUIDs**
- Timestamps in **ISO 8601** format
- Field names are **simple and human-logical**
- Passwords hashed with **bcrypt** or **Argon2**
- JWT tokens expire in **24 hours** (configurable)
- Support **soft deletes** for critical entities

### Tech Stack Recommendations

**Option 1: Node.js**
```
Runtime: Node.js 20+
Framework: Fastify or NestJS
ORM: Prisma
Database: PostgreSQL 15+
Auth: JWT with jose or passport.js
Validation: Zod or class-validator
```

**Option 2: Python**
```
Runtime: Python 3.11+
Framework: FastAPI
ORM: SQLAlchemy 2.0
Database: PostgreSQL 15+
Auth: JWT with python-jose
Validation: Pydantic
```

---

## 9. Database Indexes (Performance)

```sql
-- Customers
CREATE INDEX idx_customers_status ON customers(status);

-- Users
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Assets
CREATE INDEX idx_assets_customer_id ON assets(customer_id);
CREATE INDEX idx_assets_location_id ON assets(location_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_coverage_status ON assets(coverage_status);

-- Tickets
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_asset_id ON tickets(asset_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to_user_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- Appointments
CREATE INDEX idx_appointments_ticket_id ON appointments(ticket_id);
CREATE INDEX idx_appointments_technician_id ON appointments(technician_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_scheduled_start ON appointments(scheduled_start_at);
```

---

## 10. Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pcr_support_db

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://yourfrontend.com

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@pcresource.com
SMTP_PASSWORD=your-password

# Twilio (for SMS notifications - optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## 11. Next Steps

1. **Choose stack** (Node.js or Python)
2. **Set up database** with schema
3. **Implement auth** (JWT-based)
4. **Create API endpoints** following this spec
5. **Add validation** on all inputs
6. **Write tests** (unit + integration)
7. **Deploy backend**
8. **Update frontend** `.env.local` with API URL
9. **Test integration** with frontend

---

## Summary

This backend powers a **customer service portal** where people can:
- Register their devices
- See what's covered
- Get help when things break
- Track appointments and technician status
- View their entire support history

The data model centers around the **intuitive IT Asset** object and connects everything: customers → locations → assets → tickets → appointments → technicians.

All endpoints are customer-scoped, role-based, and ready for the Next.js frontend.
