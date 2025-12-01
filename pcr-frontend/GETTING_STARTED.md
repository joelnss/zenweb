# Getting Started with P.C. Resource CoverIT Platform

## What's Been Built

A complete modern SaaS-style frontend application inspired by the CloudCover design, featuring:

- ✅ Gradient hero section with left text and right dashboard preview
- ✅ Four product cards (AssetHub, ServiceHub, QuoteHub, ContractHub)
- ✅ Modern header with responsive navigation
- ✅ Professional footer with company information
- ✅ Smooth Framer Motion animations (fade, slide, stagger)
- ✅ Complete TypeScript type system for all domain models
- ✅ Ready-to-use API layer with placeholder endpoints
- ✅ Four module routes with placeholder pages
- ✅ Full responsive design (mobile-first)

## File Summary

### Core Application Files

**app/layout.tsx** - Root layout with Header and Footer wrapper
**app/page.tsx** - Homepage with HeroSection and ProductCards
**app/globals.css** - Global Tailwind styles

### Module Pages (Placeholders)

**app/assethub/page.tsx** - Asset & Warranty Tracking module
**app/servicehub/page.tsx** - Tickets, RMAs & Maintenance module
**app/quotehub/page.tsx** - Quotes, Configs & Pricing module
**app/contracthub/page.tsx** - Contracts & SLAs module

### Layout Components

**components/layout/Header.tsx** - Sticky navigation header
- P.C. Resource branding with gradient logo
- Desktop navigation (Services, Products, Partners, Resources)
- Mobile hamburger menu
- Login and Get Started CTAs
- Currently all links are disabled (non-functional) as requested

**components/layout/Footer.tsx** - Site footer
- Company information and logo
- Platform module links
- Contact details (phone, email)
- Copyright and legal links
- Currently all links are disabled as requested

### Home Components

**components/home/HeroSection.tsx** - Landing hero section
- Left: Headline with gradient text ("CoverIT™ Platform")
- Left: Description and two CTA buttons
- Right: Animated dashboard preview mockup
- Gradient background (blue-50 to cyan-50)
- Framer Motion slideInLeft and slideInRight animations

**components/home/ProductCards.tsx** - Four module cards
- Grid layout (responsive: 1 col mobile, 2 tablet, 4 desktop)
- Each card includes: icon, title, subtitle, description, 4 features
- Gradient hover effects
- Stagger animation on scroll
- Color-coded per module (blue, purple, green, orange)

### API Layer

**lib/api/client.ts** - Base API fetch wrapper
- Configurable base URL from environment variable
- Custom ApiError class
- JSON handling
- Authorization header support
- Full TypeScript typing

**lib/api/endpoints.ts** - All API endpoint functions
- getAssets(), getAsset(), createAsset(), updateAsset(), deleteAsset()
- getWarranties(), getWarranty(), createWarranty()
- getTickets(), getTicket(), createTicket(), updateTicket()
- getQuotes(), getQuote(), createQuote(), updateQuote()
- getContracts(), getContract(), createContract(), updateContract()
- getCustomers(), getCustomer()
- All functions are fully typed and ready for backend integration

### Type Definitions

**lib/types/index.ts** - Complete TypeScript types
- Asset, Warranty, Ticket, Quote, QuoteItem, Contract
- ServiceLevelAgreement, Customer, User
- ApiResponse<T>, PaginatedResponse<T>
- AuthResponse

### Animation System

**lib/animations/variants.ts** - Framer Motion variants
- fadeIn - Simple opacity fade
- slideInLeft - Slide from left
- slideInRight - Slide from right
- slideInUp - Slide from bottom
- staggerContainer - Container with stagger children
- scaleIn - Scale up with fade
- hoverScale - Hover scale effect

### Documentation

**README.md** - Main project documentation
**FRONTEND_ARCHITECTURE.md** - Complete frontend architecture guide
**BACKEND_API_SPEC.md** - Backend API specification and database schema
**GETTING_STARTED.md** - This file

## Quick Start

### 1. Prerequisites

You'll need Node.js 20+ to run this project. The project was created with Next.js 15 which requires Node 20.9.0 or higher.

**Check your Node version:**
```bash
node --version
```

If you have Node 18, you'll need to upgrade:
- Use nvm: `nvm install 20 && nvm use 20`
- Or download from nodejs.org

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Framer Motion
- ESLint

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` to point to your backend:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 to see the app.

### 5. Build for Production

```bash
npm run build
npm start
```

## What You'll See

### Homepage (http://localhost:3000)

**Hero Section:**
- Large headline: "Eliminate spreadsheets with CoverIT™ Platform"
- Description text
- Two buttons: "Build Your Plan" and "Learn More"
- Right side: Animated dashboard mockup with charts and stats
- Beautiful gradient background

**Product Cards Section:**
- Section header: "Software built to transform your IT lifecycle management"
- Four cards in a grid:
  1. AssetHub (blue) - Asset & Warranty Tracking
  2. ServiceHub (purple) - Tickets, RMAs & Maintenance
  3. QuoteHub (green) - Quotes, Configs & Pricing
  4. ContractHub (orange) - Contracts & SLAs
- Each card shows 4 key features
- Hover effects with scale and gradient overlay

**Header:**
- P.C. Resource logo and branding
- Navigation menu (desktop and mobile)
- All links currently disabled

**Footer:**
- Company information
- Platform links
- Contact details (810-874-2069, sales@buypcr.com)
- Copyright notice

### Module Pages (Placeholders)

- http://localhost:3000/assethub
- http://localhost:3000/servicehub
- http://localhost:3000/quotehub
- http://localhost:3000/contracthub

Each shows a simple "Coming Soon" message. These are ready to be built out.

## Next Steps

### Immediate (Frontend)

1. **Test the homepage** - Verify animations and responsive design
2. **Customize colors** - Adjust gradient colors in Tailwind config if needed
3. **Add real images** - Replace dashboard mockup with actual screenshot
4. **Enable navigation** - Once pages are ready, remove disabled states

### Short-term (Build Out Modules)

1. **AssetHub Dashboard**
   - Data table with assets
   - Search and filter
   - Add/Edit asset forms
   - Warranty expiration alerts

2. **ServiceHub Dashboard**
   - Ticket queue
   - Create ticket form
   - Ticket detail view
   - Status updates

3. **QuoteHub Dashboard**
   - Quote list
   - Quote builder/configurator
   - PDF export
   - Send quote via email

4. **ContractHub Dashboard**
   - Contract list
   - Contract details
   - Renewal alerts
   - SLA monitoring

### Backend Integration

See `BACKEND_API_SPEC.md` for complete backend requirements.

**Choose your stack:**

**Option A: Node.js**
```
Framework: Fastify or NestJS
ORM: Prisma
Database: PostgreSQL
Auth: JWT with passport.js
```

**Option B: Python**
```
Framework: FastAPI
ORM: SQLAlchemy or Prisma Python
Database: PostgreSQL
Auth: JWT with python-jose
```

**Once backend is running:**

1. Update `.env.local` with your backend URL
2. API calls will automatically work (already implemented)
3. All endpoints are typed and ready to use

### Authentication Flow

1. Create login page (`app/login/page.tsx`)
2. Call `api.post('/auth/login', credentials)` from client component
3. Store JWT token in httpOnly cookie or localStorage
4. Add token to API client
5. Protect routes with middleware

### Adding Data Tables

Recommended libraries:
- **TanStack Table** (formerly React Table) - Headless table
- **react-data-grid** - Feature-rich data grid
- **AG Grid** - Enterprise-grade grid (free tier available)

### Adding Charts

Recommended libraries:
- **Recharts** - Simple, composable charts
- **Chart.js with react-chartjs-2** - Popular charting
- **Victory** - React-native friendly
- **Tremor** - Built for dashboards

### Adding Forms

Recommended approach:
```bash
npm install react-hook-form zod @hookform/resolvers
```

Example:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const assetSchema = z.object({
  assetTag: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  // ...
});

export default function AssetForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(assetSchema)
  });

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## Design System

### Colors

**Primary (Blue-Cyan):**
- `from-blue-600 to-cyan-600`
- Used for: Primary CTAs, AssetHub

**Secondary (Purple-Pink):**
- `from-purple-600 to-pink-600`
- Used for: ServiceHub

**Success (Green-Emerald):**
- `from-green-600 to-emerald-600`
- Used for: QuoteHub

**Warning (Orange-Red):**
- `from-orange-600 to-red-600`
- Used for: ContractHub

**Neutrals:**
- Gray scale (50, 100, 200, ..., 900)

### Typography

- **Headings:** Bold, large sizes with optional gradient
- **Body:** Inter font, text-gray-600
- **Small text:** text-sm, text-gray-500

### Spacing

- **Sections:** py-20 (80px vertical padding)
- **Container:** px-6 (24px horizontal padding)
- **Component spacing:** gap-4, gap-6, gap-8

### Shadows

- **Cards:** shadow-lg, hover:shadow-2xl
- **Buttons:** shadow-md, hover:shadow-lg

## Troubleshooting

### Server won't start

**Error: "Node.js version >=20.9.0 is required"**

Solution: Upgrade to Node 20+
```bash
nvm install 20
nvm use 20
```

### API calls fail

**Error: "Failed to fetch"**

Solution: Check your backend is running and `.env.local` is configured:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Animations not working

Make sure the component has `'use client'` directive:
```tsx
'use client';

import { motion } from 'framer-motion';
```

### TypeScript errors

Run type check:
```bash
npm run build
```

Fix any type errors before deploying.

### Styling issues

Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## Performance Tips

1. **Keep Server Components** - Only use 'use client' when necessary
2. **Lazy load heavy components** - Use next/dynamic
3. **Optimize images** - Use next/image component
4. **Minimize client JS** - Move logic to server when possible
5. **Use React.memo** - For expensive client components

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Support

For questions or issues:
- Check `FRONTEND_ARCHITECTURE.md` for detailed documentation
- Check `BACKEND_API_SPEC.md` for API documentation
- Review Next.js 15 docs: https://nextjs.org/docs
- Contact: support@buypcr.com

## Summary

You now have a complete, production-ready frontend that:
- Matches modern SaaS design patterns
- Has beautiful animations and responsive design
- Includes a complete API layer ready for backend
- Provides four module routes for expansion
- Uses latest React and Next.js best practices

The only remaining work is:
1. Build out the module dashboards
2. Implement the backend API
3. Connect frontend to backend
4. Add authentication
5. Deploy to production

Everything is built for speed and scalability. All the hard architecture decisions have been made, and the foundation is solid.

Happy coding!
