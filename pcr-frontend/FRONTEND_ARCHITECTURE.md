# P.C. Resource CoverIT Platform - Frontend Architecture

## Overview

Modern SaaS-style frontend for P.C. Resource IT Services built with Next.js 15, React Server Components, TypeScript, TailwindCSS, and Framer Motion.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **React:** React 19 with Server Components
- **TypeScript:** Full type safety
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Font:** Inter (Google Fonts)

## Project Structure

```
pcr-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Header/Footer
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles
│   ├── assethub/                # Asset & Warranty Tracking module
│   │   └── page.tsx
│   ├── servicehub/              # Tickets, RMAs & Maintenance module
│   │   └── page.tsx
│   ├── quotehub/                # Quotes, Configs & Pricing module
│   │   └── page.tsx
│   └── contracthub/             # Contracts & SLAs module
│       └── page.tsx
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx           # Navigation header
│   │   └── Footer.tsx           # Footer
│   ├── home/                    # Homepage components
│   │   ├── HeroSection.tsx      # Hero with gradient & dashboard preview
│   │   └── ProductCards.tsx     # Four module cards
│   └── ui/                      # Reusable UI components (future)
├── lib/                         # Utilities and helpers
│   ├── api/                     # API layer
│   │   ├── client.ts            # Base fetch wrapper with error handling
│   │   └── endpoints.ts         # All API endpoint functions
│   ├── animations/              # Framer Motion variants
│   │   └── variants.ts          # Reusable animation configs
│   └── types/                   # TypeScript type definitions
│       └── index.ts             # Domain types (Asset, Ticket, etc.)
├── public/                      # Static assets
│   └── images/                  # Images
└── BACKEND_API_SPEC.md          # Backend API documentation
```

## Key Features

### 1. Server Components First

All pages use React Server Components by default for optimal performance:

```tsx
// app/page.tsx - Server Component (default)
import HeroSection from '@/components/home/HeroSection';
import ProductCards from '@/components/home/ProductCards';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductCards />
    </>
  );
}
```

Client components are marked with `'use client'` directive only when needed (animations, interactivity).

### 2. Type-Safe API Layer

All API calls are fully typed with TypeScript:

```tsx
// Example: Fetching assets in a Server Component
import { getAssets } from '@/lib/api/endpoints';

export default async function AssetListPage() {
  const { data, pagination } = await getAssets({ page: 1, pageSize: 20 });

  return (
    <div>
      {data.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
```

### 3. Framer Motion Animations

Pre-configured animation variants for consistency:

```tsx
import { motion } from 'framer-motion';
import { slideInLeft, fadeIn } from '@/lib/animations/variants';

export default function Component() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideInLeft}
    >
      Content
    </motion.div>
  );
}
```

### 4. Responsive Design

Mobile-first responsive design with Tailwind breakpoints:

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>
```

## Component Architecture

### Layout Components

#### Header (`components/layout/Header.tsx`)
- Sticky navigation with backdrop blur
- Mobile-responsive hamburger menu
- Logo with gradient
- Navigation items (currently disabled)
- CTA buttons (Login, Get Started)

**Props:** None
**State:** Mobile menu open/closed
**Responsibilities:** Navigation, branding, responsive menu

#### Footer (`components/layout/Footer.tsx`)
- Company information
- Platform links
- Contact details (email, phone)
- Copyright notice

**Props:** None
**Responsibilities:** Site footer, contact info, legal links

### Home Components

#### HeroSection (`components/home/HeroSection.tsx`)
- Left: Headline, description, CTA buttons
- Right: Animated dashboard preview
- Gradient background
- Framer Motion slide animations

**Props:** None
**Animations:** slideInLeft, slideInRight
**Responsibilities:** Landing page hero with visual appeal

#### ProductCards (`components/home/ProductCards.tsx`)
- Four module cards (AssetHub, ServiceHub, QuoteHub, ContractHub)
- Feature lists
- Gradient hover effects
- Stagger animations

**Props:** None
**Animations:** staggerContainer, slideInUp
**Responsibilities:** Display platform modules with features

## Styling System

### Tailwind Configuration

Custom Tailwind setup with:
- Custom color palette (gradient blues, cyans, purples)
- Container max-width
- Custom animations
- Typography scale

### Color Palette

```
Primary: Blue-600 to Cyan-600 gradient
Secondary: Purple-600 to Pink-600 gradient
Success: Green-600 to Emerald-600 gradient
Warning: Orange-600 to Red-600 gradient
Neutrals: Gray scale (50-900)
```

### Typography

- Headings: Bold, large sizes with gradient text
- Body: Inter font, regular weight
- Code: Monospace (future use)

## Animation System

### Available Variants

**fadeIn**: Opacity 0 → 1
**slideInLeft**: Slide from left with opacity
**slideInRight**: Slide from right with opacity
**slideInUp**: Slide from bottom with opacity
**staggerContainer**: Container with stagger children
**scaleIn**: Scale up with opacity
**hoverScale**: Hover scale effect

### Usage Pattern

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeIn}
>
  Content
</motion.div>
```

## API Integration

### Data Fetching in Server Components

```tsx
// app/assethub/page.tsx
import { getAssets } from '@/lib/api/endpoints';

export default async function AssetHubPage() {
  try {
    const { data, pagination } = await getAssets({
      page: 1,
      pageSize: 20,
      status: 'available'
    });

    return <AssetList assets={data} pagination={pagination} />;
  } catch (error) {
    return <ErrorState error={error} />;
  }
}
```

### Error Handling

The API client (`lib/api/client.ts`) includes:
- Custom `ApiError` class
- Automatic JSON parsing
- Status code handling
- Type-safe responses

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Routes & Navigation

### Current Routes

- `/` - Homepage (Hero + Product Cards)
- `/assethub` - Asset & Warranty Tracking (placeholder)
- `/servicehub` - Tickets, RMAs & Maintenance (placeholder)
- `/quotehub` - Quotes, Configs & Pricing (placeholder)
- `/contracthub` - Contracts & SLAs (placeholder)

### Adding New Routes

1. Create folder in `app/` directory
2. Add `page.tsx` file
3. Export default component
4. Optionally add `loading.tsx`, `error.tsx`

## Development Workflow

### Running Locally

```bash
npm run dev
# or
npm run dev:turbo  # With Turbopack
```

Open http://localhost:3000

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Performance Optimizations

1. **React Server Components** - Default for all pages
2. **Image Optimization** - Next.js Image component (when needed)
3. **Font Optimization** - Google Fonts with next/font
4. **Code Splitting** - Automatic by Next.js
5. **Lazy Loading** - Dynamic imports for heavy components

## Future Enhancements

### Planned Features

1. **Authentication**
   - Login/logout flow
   - Protected routes
   - Role-based access control

2. **Dashboard Components**
   - Data tables with sorting/filtering
   - Charts and graphs (Chart.js or Recharts)
   - Real-time updates (WebSockets)

3. **Forms**
   - Asset creation/editing
   - Ticket submission
   - Quote generation
   - React Hook Form + Zod validation

4. **UI Component Library**
   - Button variants
   - Input components
   - Modal/Dialog
   - Toast notifications
   - Loading states

5. **Search & Filters**
   - Global search
   - Advanced filtering
   - Saved filters

6. **Export/Print**
   - PDF generation
   - CSV export
   - Print-friendly views

## Testing Strategy (Future)

```
Unit Tests: Vitest
Component Tests: React Testing Library
E2E Tests: Playwright
```

## Deployment

### Recommended Platforms

- **Vercel** (optimal for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (self-hosted)

### Environment Variables for Production

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Best Practices

1. **Keep Server Components by default** - Only use 'use client' when necessary
2. **Collocate related files** - Keep components close to where they're used
3. **Use TypeScript strictly** - No implicit any
4. **Follow Tailwind utility-first** - Avoid custom CSS when possible
5. **Optimize images** - Use next/image
6. **Error boundaries** - Add error.tsx for error handling
7. **Loading states** - Add loading.tsx for suspense boundaries
8. **Accessibility** - Follow ARIA guidelines, semantic HTML

## Troubleshooting

### Common Issues

**API calls failing:**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check CORS configuration

**Animations not working:**
- Ensure 'use client' directive is present
- Check Framer Motion is installed

**Styling issues:**
- Run `npm run dev` to regenerate Tailwind classes
- Check for conflicting class names

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
