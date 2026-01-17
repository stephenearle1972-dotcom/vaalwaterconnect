# MenlynConnect / VaalwaterConnect - Technical Specification

> Multi-tenant local business directory platform for South African communities

**Version:** 1.0.0
**Last Updated:** January 2026
**Repository:** github.com/stephenearle1972-dotcom/vaalwaterconnect

---

## Table of Contents

1. [Site Structure](#1-site-structure)
2. [Features by Page](#2-features-by-page)
3. [Data Models](#3-data-models)
4. [Technical Architecture](#4-technical-architecture)
5. [Branding & Design](#5-branding--design)
6. [Integrations](#6-integrations)
7. [Pricing Tiers](#7-pricing-tiers)
8. [Deployment](#8-deployment)

---

## 1. Site Structure

### Navigation Hierarchy

```
Root (/)
├── Home (#home)
├── Directory (#directory)
│   └── Category (#category?sector=<sectorId>)
│       └── Business Detail (#business?id=<businessId>)
├── Specials (#specials)
├── Map (#map)
├── Jobs (#jobs)
│   └── Job Detail (#job-detail?id=<jobId>)
├── Events (#events)
│   └── Event Detail (#event-detail?id=<eventId>)
├── Classifieds (#classifieds)
│   └── Classified Detail (#classified-detail?id=<classifiedId>)
├── Property (#property)
│   └── Property Detail (#property-detail?id=<propertyId>)
├── Notices/Announcements (#announcements)
│   └── Announcement Detail (#announcement-detail?id=<announcementId>)
├── Pricing (#pricing)
├── Contact (#contact)
├── Add Business (#add-business)
├── Recommend Business (#recommend)
├── About (#about)
├── Terms (#terms)
├── Privacy (#privacy)
└── Disclaimer (#disclaimer)
```

### Route System

The application uses hash-based routing (`#page?params`) for single-page application navigation without server configuration.

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `#home` | HomeView | Landing page with hero, search, and sector grid |
| `#directory` | DirectoryView | Browse all business sectors |
| `#category?sector=<id>` | CategoryView | List businesses in a sector |
| `#business?id=<id>` | BusinessDetailView | Individual business profile |
| `#specials` | SpecialsView | Current deals and promotions |
| `#map` | MapView | Interactive map with business pins |
| `#jobs` | JobsView | Job listings board |
| `#job-detail?id=<id>` | JobDetailView | Individual job posting |
| `#events` | EventsView | Community events calendar |
| `#event-detail?id=<id>` | EventDetailView | Individual event details |
| `#classifieds` | ClassifiedsView | Buy/sell marketplace |
| `#classified-detail?id=<id>` | ClassifiedDetailView | Individual classified ad |
| `#property` | PropertyView | Real estate listings |
| `#property-detail?id=<id>` | PropertyDetailView | Individual property listing |
| `#announcements` | AnnouncementsView | Community notices |
| `#announcement-detail?id=<id>` | AnnouncementDetailView | Individual announcement |
| `#pricing` | PricingView | Business listing tiers |
| `#contact` | ContactView | Contact information |
| `#add-business` | AddBusinessView | Business application form |
| `#recommend` | RecommendView | Recommend a business form |
| `#about` | AboutView | About the platform |
| `#terms` | LegalView | Terms of use |
| `#privacy` | LegalView | Privacy policy |
| `#disclaimer` | LegalView | Disclaimer |
| `#search?q=<query>` | SearchView | Search results |

---

## 2. Features by Page

### Home Page (`#home`)
- **Hero Section:** Full-screen background image with town tagline, search bar
- **Smart Search:** Natural language search ("where can I find... in Menlyn?")
- **Popular Searches:** Quick links to common queries (Lodges, Medical, Dining)
- **Sector Grid:** Visual grid of 14 business categories with icons
- **Partnership CTA:** Call-to-action for business listings

### Directory (`#directory`)
- **Sector Grid:** All 14 business sectors displayed as clickable cards
- **Category Navigation:** Click to view businesses by sector

### Category View (`#category`)
- **Sector Header:** Sector name and description
- **Business Cards:** Grid of businesses in the sector
- **Featured Badges:** Premium listings highlighted
- **Quick Actions:** Phone, WhatsApp, Website links

### Business Detail (`#business`)
- **Business Profile:** Name, description, sector, images
- **Contact Actions:** Phone, WhatsApp, Email, Website buttons
- **Social Links:** Facebook, Instagram if available
- **Location:** Address with map integration potential
- **Reviews:** Customer reviews (if available)

### Specials (`#specials`)
- **Deal Cards:** Current promotions from local businesses
- **Validity Dates:** Expiry information for each special
- **Business Attribution:** Links back to business profiles

### Map View (`#map`)
- **Interactive Map:** Leaflet-powered map centered on town
- **Business Markers:** Pins for all businesses with coordinates
- **Popup Info:** Business name and quick contact on click
- **Zoom Controls:** Configurable per town

### Jobs Board (`#jobs`)
- **Job Listings:** All active job postings
- **Filters:** By job type (Full-time, Part-time, Contract, Casual)
- **Sector Badges:** Industry categorization
- **Salary Info:** Range if provided
- **Apply CTA:** Direct application via email/phone/WhatsApp

### Events Calendar (`#events`)
- **Upcoming Events:** Filtered to future dates only
- **Event Types:** Market, Festival, Workshop, Community, Other
- **Featured Events:** Highlighted events
- **Ticket Info:** Pricing and booking links

### Classifieds (`#classifieds`)
- **Category Filters:** For Sale, Wanted, Services, Other
- **Condition Tags:** New, Used
- **Price Display:** Listed prices
- **Seller Contact:** WhatsApp integration

### Property (`#property`)
- **Listing Types:** Sale, Rent
- **Property Types:** House, Apartment, Land, Commercial, Farm
- **Property Details:** Bedrooms, bathrooms, size, features
- **Featured Listings:** Premium property highlights
- **Agent Contact:** Direct WhatsApp/phone

### Announcements (`#announcements`)
- **Categories:** Lost & Found, Community Notice, Alert, Other
- **Expiry Filtering:** Only shows non-expired announcements
- **Urgency Indicators:** Alert styling for important notices

### Pricing (`#pricing`)
- **Tier Comparison:** 4 tiers (Micro, Standard, Premium, Enterprise)
- **Monthly/Annual Toggle:** Pricing switcher
- **Feature Lists:** What's included per tier
- **WhatsApp CTA:** Direct signup via WhatsApp

### Contact (`#contact`)
- **Contact Cards:** Phone, Email, WhatsApp, Location
- **Town-specific Info:** Dynamic based on config

### Add Business (`#add-business`)
- **Multi-step Form:** Business application
- **Image Upload:** Cloudinary integration (up to 3 photos)
- **Tier Selection:** Choose listing tier
- **POPIA Consent:** Required checkbox
- **Netlify Form:** Submission handling

---

## 3. Data Models

### Business
```typescript
type Business = {
  id: string;
  name: string;
  sectorId: SectorId;
  subcategory?: string;
  description: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  address?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  tier?: 'micro' | 'standard' | 'premium' | 'hospitality';
  isFeatured?: boolean;
  imageUrl?: string;
  reviews?: Review[];
}
```

### Sector
```typescript
type SectorId =
  | 'home-services'
  | 'automotive'
  | 'health-wellness'
  | 'food-drinks'
  | 'shopping-retail'
  | 'professional-services'
  | 'construction-industrial'
  | 'education-community'
  | 'tourism-hospitality'
  | 'pets-animals'
  | 'wildlife-agriculture'
  | 'daily-activities'
  | 'emergency-services'
  | 'informal-services';

type Sector = {
  id: SectorId;
  name: string;
  description?: string;
  icon?: string;
}
```

### Job
```typescript
type JobType = 'full-time' | 'part-time' | 'contract' | 'casual';
type ApplicationMethod = 'email' | 'phone' | 'whatsapp' | 'website';

type Job = {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  jobType: JobType;
  sectorId: SectorId;
  description: string;
  requirements: string[];
  salaryRange?: string;
  location: string;
  postedDate: string;
  applicationMethod: ApplicationMethod;
  applicationContact: string;
  isActive: boolean;
}
```

### Event
```typescript
type EventType = 'market' | 'festival' | 'workshop' | 'community' | 'other';

type Event = {
  id: string;
  title: string;
  organizerId: string | null;
  organizerName: string;
  eventType: EventType;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  ticketPrice?: string;
  bookingLink?: string;
  imageUrl: string;
  isFeatured: boolean;
}
```

### Classified
```typescript
type ClassifiedCategory = 'for-sale' | 'wanted' | 'services' | 'other';
type ClassifiedCondition = 'new' | 'used' | 'other';

type Classified = {
  id: string;
  title: string;
  category: ClassifiedCategory;
  subcategory: string;
  description: string;
  price?: string;
  condition: ClassifiedCondition;
  sellerName: string;
  sellerContact: string;
  location: string;
  postedDate: string;
  imageUrl?: string;
  isActive: boolean;
}
```

### Property
```typescript
type ListingType = 'sale' | 'rent';
type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'farm';

type Property = {
  id: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  price: string;
  description: string;
  address: string;
  lat?: number;
  lng?: number;
  features: string[];
  agentName: string;
  agentContact: string;
  postedDate: string;
  imageUrls: string[];
  isFeatured: boolean;
}
```

### Announcement
```typescript
type AnnouncementCategory = 'lost-found' | 'community-notice' | 'alert' | 'other';

type Announcement = {
  id: string;
  title: string;
  category: AnnouncementCategory;
  description: string;
  contactName: string;
  contactMethod: string;
  location: string;
  postedDate: string;
  expiryDate: string;
  imageUrl?: string;
  isActive: boolean;
}
```

### Special
```typescript
type Special = {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  offer: string;
  validUntil: string;
  description: string;
  icon: string;
  imageUrl: string;
}
```

### Data Counts

| Data Type | Vaalwater | Menlyn |
|-----------|-----------|--------|
| Sectors | 14 | 14 |
| Businesses | ~25 | 18 |
| Jobs | ~5 | 10 |
| Events | ~5 | 12 |
| Classifieds | ~10 | 15 |
| Properties | ~5 | 10 |
| Announcements | ~5 | 8 |
| Specials | 3 | 3 |

---

## 4. Technical Architecture

### Multi-Tenant Config System

```
src/configs/
├── index.ts          # Town detection & config export
├── types.ts          # TownConfig interface & DEFAULT_PRICING
└── towns/
    ├── vaalwater.ts  # Vaalwater configuration
    └── menlyn.ts     # Menlyn configuration
```

### TownConfig Interface

```typescript
interface TownConfig {
  // Identification
  id: string;
  slug: string;

  // Town info
  town: {
    name: string;
    tagline: string;
    region: string;
  };

  // About page content
  about: {
    headline: string;
    subheadline: string;
    paragraphs: string[];
    images: string[];
  };

  // Branding
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo?: string;
    heroImage: string;
    faviconEmoji: string;
  };

  // Contact
  contact: {
    whatsapp: string;
    email: string;
    phone: string;
  };

  // Map settings
  location: {
    center: { lat: number; lng: number };
    zoom: number;
  };

  // Pricing
  pricing: {
    micro: { monthly: string; annual: string };
    standard: { monthly: string; annual: string };
    premium: { monthly: string; annual: string };
    enterprise: { monthly: string; annual: string };
  };

  // Data arrays
  data: {
    sectors: Sector[];
    businesses: Business[];
    jobs: Job[];
    events: Event[];
    classifieds: Classified[];
    properties: Property[];
    announcements: Announcement[];
    specials: Special[];
  };
}
```

### Town Detection Priority

1. **Environment Variable** (highest): `VITE_TOWN=menlyn`
2. **Domain Mapping**: `menlynconnect.co.za` → menlyn
3. **Subdomain Pattern**: `menlyn.townconnect.co.za` → menlyn
4. **Default Fallback**: vaalwater

### Domain Mapping

```typescript
const domainMap = {
  'vaalwaterconnect.co.za': 'vaalwater',
  'www.vaalwaterconnect.co.za': 'vaalwater',
  'menlynconnect.co.za': 'menlyn',
  'www.menlynconnect.co.za': 'menlyn',
  'vaalwaterconnect.netlify.app': 'vaalwater',
  'menlynconnect.netlify.app': 'menlyn',
};
```

### File Structure

```
vaalwaterconnect/
├── index.html              # Entry HTML with Netlify forms
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── .env.example            # Environment variables template
├── netlify.toml            # Netlify deployment config
├── SITEMAP.md              # This document
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main application (~2400 lines)
    ├── types.ts            # Shared TypeScript types
    ├── data.ts             # Vaalwater data arrays
    ├── index.css           # Global styles & CSS variables
    ├── vite-env.d.ts       # Vite type definitions
    └── configs/
        ├── index.ts        # Config detection & exports
        ├── types.ts        # TownConfig interface
        └── towns/
            ├── vaalwater.ts
            └── menlyn.ts
```

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |
| leaflet | ^1.9.4 | Interactive maps |
| vite | ^5.4.10 | Build tool |
| tailwindcss | ^3.4.14 | CSS framework |
| typescript | ~5.6.2 | Type checking |

### Dynamic CSS Variables

Colors are injected at runtime based on config:

```typescript
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty('--color-forest', config.branding.colors.primary);
  root.style.setProperty('--color-clay', config.branding.colors.secondary);
  root.style.setProperty('--color-sand', config.branding.colors.accent);
  document.title = `${siteName} | Local Business Directory`;
}, []);
```

---

## 5. Branding & Design

### Color Schemes

#### Vaalwater (Bushveld Theme)
| Variable | Color | Hex | Usage |
|----------|-------|-----|-------|
| Primary (Forest) | Deep green | `#2d4a3e` | Headers, buttons, nav |
| Secondary (Clay) | Terracotta | `#b87352` | Accents, highlights |
| Accent (Sand) | Cream | `#e8e2d6` | Backgrounds, borders |

#### Menlyn (Urban Theme)
| Variable | Color | Hex | Usage |
|----------|-------|-----|-------|
| Primary (Forest) | Navy blue | `#1e3a8a` | Headers, buttons, nav |
| Secondary (Clay) | Amber gold | `#f59e0b` | Accents, highlights |
| Accent (Sand) | Light blue | `#dbeafe` | Backgrounds, borders |

### Typography

| Font | Usage | Weight |
|------|-------|--------|
| Inter | Body text, UI | 300, 400, 500, 600, 700, 900 |
| Lora | Headings, serif accents | 400, 700 (regular & italic) |

### Design Tokens

```css
:root {
  --color-bg: #fdfbf7;        /* Page background */
  --color-forest: <dynamic>;   /* Primary from config */
  --color-clay: <dynamic>;     /* Secondary from config */
  --color-sand: <dynamic>;     /* Accent from config */
  --color-text: #1a1c1a;      /* Body text */
}
```

### UI Components

| Component | Styling |
|-----------|---------|
| Cards | `rounded-[3rem]` with subtle shadow |
| Buttons | `rounded-full` pill shape |
| Inputs | `rounded-full` with backdrop blur |
| Hero | Full-viewport with gradient overlay |
| Navigation | Sticky top with backdrop blur |

### Hero Images

- **Vaalwater:** Bushveld/safari landscape (`photo-1547471080-7cc2caa01a7e`)
- **Menlyn:** South African cityscape (`photo-1577948000111-9c970dfe3743`)

### Logo System

- Square logo badge with town initial (V/M)
- Font: Lora serif italic
- Dynamic color based on config

---

## 6. Integrations

### WhatsApp Integration

**Floating Button:**
```typescript
const FloatingWhatsApp = () => (
  <a href={`https://wa.me/${config.contact.whatsapp}`}>
    {/* WhatsApp icon */}
  </a>
);
```

**Business Contacts:**
- Direct WhatsApp links for each business
- Pre-filled messages for inquiries
- Format: `https://wa.me/27XXXXXXXXX?text=...`

**Contact Number:** `27688986081` (both towns currently)

### Netlify Forms

**Forms Configured:**
1. `business-application` - New business submissions
2. `recommend-business` - Business recommendations

**Implementation:**
- Hidden HTML forms in `index.html` for build-time detection
- React forms POST to `/?form-name=<name>`
- POPIA consent required

### Cloudinary Integration

**Widget Configuration:**
```typescript
{
  cloudName: 'dkn6tnxao',
  uploadPreset: 'vaalwater_unsigned',
  sources: ['local', 'camera'],
  maxFiles: 3,
  maxFileSize: 5000000, // 5MB
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  styles: {
    palette: {
      // Dynamic colors from config
    }
  }
}
```

**Usage:** Business application photo uploads

### Leaflet Maps

**Configuration:**
```typescript
const map = L.map(mapRef.current).setView(
  [config.location.center.lat, config.location.center.lng],
  config.location.zoom
);
```

**Map Centers:**
- Vaalwater: `-24.296, 28.113` (zoom: 12)
- Menlyn: `-25.7823, 28.2768` (zoom: 13)

**Tile Provider:** OpenStreetMap

---

## 7. Pricing Tiers

### Vaalwater Pricing

| Tier | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Micro | R50 | R500 | 2 months free |
| Standard | R199 | R2,189 | 2 months free |
| Premium | R349 | R3,839 | 2 months free |
| Enterprise | R599 | R6,589 | 2 months free |

### Menlyn Pricing (Urban Premium)

| Tier | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Micro | R75 | R750 | 2 months free |
| Standard | R249 | R2,739 | 2 months free |
| Premium | R449 | R4,939 | 2 months free |
| Enterprise | R799 | R8,789 | 2 months free |

### Tier Features

| Feature | Micro | Standard | Premium | Enterprise |
|---------|-------|----------|---------|------------|
| Directory listing | Yes | Yes | Yes | Yes |
| Contact info | Phone only | All | All | All |
| Photos | 1 | 3 | 5 | Unlimited |
| Featured placement | No | No | Yes | Yes |
| Specials/Deals | No | No | Yes | Yes |
| Social links | No | Yes | Yes | Yes |
| Website link | No | Yes | Yes | Yes |
| Priority support | No | No | No | Yes |

---

## 8. Deployment

### GitHub Repository

**URL:** `github.com/stephenearle1972-dotcom/vaalwaterconnect`

**Branch Strategy:**
- `main` - Production branch
- Feature branches for development

### Netlify Configuration

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_TOWN` | Override town detection | `menlyn` |

### Multi-Site Deployment

**Vaalwater Site:**
- Domain: `vaalwaterconnect.netlify.app` / `vaalwaterconnect.co.za`
- Build: Default (no `VITE_TOWN`)

**Menlyn Site:**
- Domain: `menlynconnect.netlify.app` / `menlynconnect.co.za`
- Build: `VITE_TOWN=menlyn`

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Build for specific town
VITE_TOWN=menlyn npm run build
```

### Deployment Checklist

- [ ] Update data in town config files
- [ ] Test locally with correct `VITE_TOWN`
- [ ] Commit and push to `main`
- [ ] Verify Netlify build succeeds
- [ ] Test deployed site functionality
- [ ] Verify WhatsApp links work
- [ ] Check form submissions in Netlify dashboard

---

## Appendix

### Adding a New Town

1. Create `src/configs/towns/<townname>.ts`
2. Define all data arrays (sectors, businesses, etc.)
3. Export `<townname>Config: TownConfig`
4. Register in `src/configs/index.ts`:
   ```typescript
   import { <townname>Config } from './towns/<townname>';

   const townConfigs = {
     // ...existing
     <townname>: <townname>Config,
   };
   ```
5. Add domain mapping if needed
6. Deploy with `VITE_TOWN=<townname>`

### Contact

- **WhatsApp:** +27 68 898 6081
- **Email:** hello@vaalwaterconnect.co.za / hello@menlynconnect.co.za

---

*Document generated January 2026*
