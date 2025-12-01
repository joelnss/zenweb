# P.C. Resource CoverIT Platform - Frontend

Modern SaaS-style IT lifecycle management platform for P.C. Resource IT Services.

## Tech Stack

- **Next.js 15** with App Router and React Server Components
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React 19** with latest features

## Quick Start

### Prerequisites

- Node.js 20+ (required for Next.js 15)
- npm 10+

### Installation & Running

```bash
# Switch to Node 20
nvm use 20

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

**📖 See [DEV_SERVER_COMMANDS.md](./DEV_SERVER_COMMANDS.md) for complete server start/stop commands and troubleshooting.**

## Project Structure

```
pcr-frontend/
├── app/                    # Next.js App Router pages
│   ├── assethub/          # Asset & Warranty Tracking
│   ├── servicehub/        # Tickets, RMAs & Maintenance
│   ├── quotehub/          # Quotes, Configs & Pricing
│   └── contracthub/       # Contracts & SLAs
├── components/            # React components
│   ├── layout/           # Header, Footer
│   └── home/             # HeroSection, ProductCards
├── lib/                  # Utilities
│   ├── api/             # API client & endpoints
│   ├── animations/      # Framer Motion variants
│   └── types/           # TypeScript types
└── public/              # Static assets
```

## Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Platform Modules

1. **AssetHub** - Asset and warranty tracking with lifecycle management
2. **ServiceHub** - Support tickets, RMAs, and maintenance scheduling
3. **QuoteHub** - Quote generation with product configurator
4. **ContractHub** - Contract management with SLA monitoring

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Documentation

- [Frontend Architecture](./FRONTEND_ARCHITECTURE.md) - Complete frontend documentation
- [Backend API Specification](./BACKEND_API_SPEC.md) - API endpoints and database schema

## Key Features

- Modern gradient-based design matching CloudCover style
- Responsive mobile-first layout
- Smooth Framer Motion animations
- Type-safe API layer with full TypeScript support
- React Server Components for optimal performance
- Modular architecture for easy expansion

## Backend Integration

The frontend is ready to connect to a backend API. See `BACKEND_API_SPEC.md` for:
- Complete API endpoint documentation
- Database schema suggestions
- Implementation guidelines for Node.js or Python
- Authentication flow
- Error handling standards

## Current Status

**Completed:**
- ✅ Project structure and dependencies
- ✅ Homepage with hero section and product cards
- ✅ Header and Footer components
- ✅ Four module placeholder pages
- ✅ API layer architecture
- ✅ Animation system
- ✅ TypeScript type definitions
- ✅ Responsive design

**Next Steps:**
- Implement backend API
- Build out module dashboards
- Add authentication
- Create data tables and forms
- Add charts and visualizations

## Development

The app uses Next.js App Router with React Server Components by default. Client components (with interactivity/animations) are marked with `'use client'` directive.

### Adding New Pages

1. Create folder in `app/` directory
2. Add `page.tsx` file
3. Export default component

### Using the API Layer

```tsx
import { getAssets } from '@/lib/api/endpoints';

export default async function Page() {
  const { data } = await getAssets({ page: 1 });
  return <div>...</div>;
}
```

## License

Copyright © 2025 P.C. Resource IT Services. All rights reserved.

## Contact

- **Phone:** 810-874-2069
- **Email:** sales@buypcr.com
- **Support:** support@buypcr.com
