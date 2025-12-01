# Backend API Specification for P.C. Resource CoverIT Platform

## Overview

This document describes the backend API architecture and endpoints required to power the P.C. Resource CoverIT Platform frontend. The backend can be implemented in either:

- **Node.js** with Fastify or NestJS
- **Python** with FastAPI

## Technology Stack Options

### Option 1: Node.js Backend

```
- Runtime: Node.js 20+
- Framework: Fastify or NestJS
- ORM: Prisma or TypeORM
- Database: PostgreSQL 15+
- Auth: JWT with passport.js or jose
- Validation: Zod or class-validator
```

### Option 2: Python Backend

```
- Runtime: Python 3.11+
- Framework: FastAPI
- ORM: SQLAlchemy 2.0 or Prisma Python
- Database: PostgreSQL 15+
- Auth: JWT with python-jose
- Validation: Pydantic
```

## Base Configuration

```
Base URL: http://localhost:3001/api
Default Port: 3001
API Version: v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Auth Endpoints

#### POST /auth/login
Login user and receive JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "permissions": ["read:assets", "write:assets"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-11-25T19:53:00Z"
}
```

#### POST /auth/register
Register new user (admin only)

#### POST /auth/refresh
Refresh expired JWT token

#### POST /auth/logout
Invalidate JWT token

---

## Asset Endpoints

### GET /assets
Get paginated list of assets

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20, max: 100)
- `status` (string: available | in-use | maintenance | retired)
- `category` (string: desktop | laptop | server | peripheral | other)
- `search` (string: search by assetTag, model, serialNumber)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "assetTag": "AST-001",
      "manufacturer": "Dell",
      "model": "OptiPlex 7090",
      "serialNumber": "SN123456",
      "category": "desktop",
      "status": "available",
      "location": "Warehouse A",
      "purchaseDate": "2024-01-15",
      "warrantyId": "uuid",
      "assignedTo": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-11-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalCount": 95
  }
}
```

### GET /assets/:id
Get single asset by ID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "assetTag": "AST-001",
    "manufacturer": "Dell",
    "model": "OptiPlex 7090",
    "serialNumber": "SN123456",
    "category": "desktop",
    "status": "available",
    "location": "Warehouse A",
    "purchaseDate": "2024-01-15",
    "warrantyId": "uuid",
    "assignedTo": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-11-24T10:00:00Z"
  },
  "message": "Asset retrieved successfully",
  "timestamp": "2025-11-24T19:53:00Z"
}
```

### POST /assets
Create new asset

**Request:**
```json
{
  "assetTag": "AST-002",
  "manufacturer": "HP",
  "model": "EliteBook 840 G8",
  "serialNumber": "SN789012",
  "category": "laptop",
  "status": "available",
  "location": "Warehouse B",
  "purchaseDate": "2024-11-24"
}
```

### PUT /assets/:id
Update asset

### DELETE /assets/:id
Delete asset (soft delete recommended)

---

## Warranty Endpoints

### GET /warranties
Get paginated list of warranties

**Query Parameters:**
- `assetId` (uuid: filter by asset)
- `status` (string: active | expired | pending)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "assetId": "uuid",
      "provider": "Dell ProSupport",
      "startDate": "2024-01-15",
      "endDate": "2027-01-15",
      "coverageType": "full",
      "status": "active",
      "termsUrl": "https://example.com/warranty/terms",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-11-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "totalCount": 52
  }
}
```

### GET /warranties/:id
Get single warranty

### POST /warranties
Create warranty

### PUT /warranties/:id
Update warranty

---

## Ticket Endpoints

### GET /tickets
Get paginated list of tickets

**Query Parameters:**
- `page` (number)
- `pageSize` (number)
- `status` (string: open | in-progress | pending | resolved | closed)
- `priority` (string: low | medium | high | critical)
- `type` (string: repair | rma | maintenance | support)
- `assignedTo` (uuid: filter by assigned user)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "ticketNumber": "TKT-2024-001",
      "assetId": "uuid",
      "customerId": "uuid",
      "title": "Laptop screen flickering",
      "description": "Screen flickers intermittently",
      "priority": "medium",
      "status": "open",
      "type": "repair",
      "assignedTo": "uuid",
      "createdAt": "2024-11-24T10:00:00Z",
      "updatedAt": "2024-11-24T12:00:00Z",
      "resolvedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "totalCount": 152
  }
}
```

### GET /tickets/:id
Get single ticket

### POST /tickets
Create new ticket

**Request:**
```json
{
  "assetId": "uuid",
  "customerId": "uuid",
  "title": "Laptop won't boot",
  "description": "System shows black screen on startup",
  "priority": "high",
  "type": "repair"
}
```

### PUT /tickets/:id
Update ticket (status, assignment, etc.)

---

## Quote Endpoints

### GET /quotes
Get paginated list of quotes

**Query Parameters:**
- `page` (number)
- `pageSize` (number)
- `status` (string: draft | sent | accepted | rejected | expired)
- `customerId` (uuid)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "quoteNumber": "QT-2024-001",
      "customerId": "uuid",
      "customerName": "Acme Corporation",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "productName": "Dell OptiPlex 7090",
          "description": "Desktop PC - Intel i7, 16GB RAM, 512GB SSD",
          "quantity": 10,
          "unitPrice": 899.99,
          "discount": 50.00,
          "total": 8499.90
        }
      ],
      "subtotal": 8499.90,
      "tax": 679.99,
      "total": 9179.89,
      "status": "sent",
      "validUntil": "2024-12-24",
      "notes": "Bulk order discount applied",
      "createdAt": "2024-11-24T10:00:00Z",
      "updatedAt": "2024-11-24T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 4,
    "totalCount": 73
  }
}
```

### GET /quotes/:id
Get single quote

### POST /quotes
Create new quote

### PUT /quotes/:id
Update quote

---

## Contract Endpoints

### GET /contracts
Get paginated list of contracts

**Query Parameters:**
- `page` (number)
- `pageSize` (number)
- `status` (string: active | expired | pending | cancelled)
- `type` (string: lease | service | support | maintenance)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "contractNumber": "CTR-2024-001",
      "customerId": "uuid",
      "customerName": "Acme Corporation",
      "type": "service",
      "startDate": "2024-01-01",
      "endDate": "2025-01-01",
      "status": "active",
      "value": 25000.00,
      "renewalDate": "2024-12-01",
      "sla": {
        "responseTime": "4 hours",
        "resolutionTime": "24 hours",
        "availability": "99.9%",
        "supportHours": "Business hours (8am-6pm EST)"
      },
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-11-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 2,
    "totalCount": 34
  }
}
```

### GET /contracts/:id
Get single contract

### POST /contracts
Create new contract

### PUT /contracts/:id
Update contract

---

## Customer Endpoints

### GET /customers
Get paginated list of customers

**Query Parameters:**
- `page` (number)
- `pageSize` (number)
- `type` (string: individual | business | government | education | nonprofit)
- `status` (string: active | inactive)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "810-555-0123",
      "company": null,
      "type": "individual",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-11-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 12,
    "totalCount": 234
  }
}
```

### GET /customers/:id
Get single customer

### POST /customers
Create customer

### PUT /customers/:id
Update customer

---

## Database Schema Suggestions

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag VARCHAR(100) UNIQUE NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  purchase_date DATE,
  warranty_id UUID,
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Warranties table
CREATE TABLE warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  coverage_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  terms_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  asset_id UUID REFERENCES assets(id),
  customer_id UUID REFERENCES customers(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  valid_until DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quote Items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  renewal_date DATE,
  sla_response_time VARCHAR(100),
  sla_resolution_time VARCHAR(100),
  sla_availability VARCHAR(50),
  sla_support_hours VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-11-24T19:53:00Z"
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity` - Validation failed
- `500 Internal Server Error` - Server error

---

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pcr_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

---

## Implementation Recommendations

### For Node.js (Fastify/NestJS)

1. Use Prisma for type-safe database access
2. Implement middleware for JWT validation
3. Use Zod for request validation
4. Implement rate limiting (fastify-rate-limit)
5. Add request logging (pino)
6. Use Swagger/OpenAPI for API docs

### For Python (FastAPI)

1. Use SQLAlchemy 2.0 with async support
2. Implement dependency injection for auth
3. Use Pydantic for request/response validation
4. Implement rate limiting (slowapi)
5. Add request logging (python-json-logger)
6. Auto-generated OpenAPI docs from FastAPI

---

## Next Steps

1. Choose backend stack (Node.js or Python)
2. Set up database with schema
3. Implement authentication & authorization
4. Create API endpoints following this spec
5. Add automated tests
6. Deploy backend service
7. Update frontend `NEXT_PUBLIC_API_URL` env variable
