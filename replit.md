# Project Phoenix - Urban Resilience Monitoring Platform

## Overview

Project Phoenix is an enterprise-grade urban resilience environmental scoring system for Delhi. The application monitors real-time air quality data, calculates Resilience Environmental Scores (RES) for different zones, generates proactive alerts, and provides interactive visualizations. It combines data-intensive analytics with sophisticated 3D visualizations to help monitor and respond to environmental challenges across Delhi's urban zones.

**Core Purpose:** Provide a comprehensive monitoring and alert system for urban environmental resilience, enabling data-driven decision-making and community engagement through real-time air quality tracking, zone-based resilience scoring, and actionable insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, built with Vite for optimal development experience and fast builds.

**UI Design System:** Carbon Design System principles with shadcn/ui components
- **Rationale:** Enterprise-grade data visualization requires exceptional clarity and professional polish. Carbon Design System provides the sophisticated, data-transparent aesthetic needed for a monitoring platform.
- **Typography:** IBM Plex Sans for UI, IBM Plex Mono for data/metrics
- **Component Library:** Radix UI primitives via shadcn/ui for accessible, composable components
- **Styling:** Tailwind CSS with custom theme extending Carbon design principles

**Routing:** Wouter for lightweight client-side routing
- Main routes: `/` (landing), `/map` (interactive map), `/analytics` (data analysis)

**State Management:**
- React Context (`AppContext`) for global state (selected zone, alerts, modal states)
- TanStack Query for server state management and caching
- **Rationale:** Context handles UI state, TanStack Query handles data fetching/caching with automatic refetching (30-second intervals for real-time data)

**3D Visualization:**
- React Three Fiber (@react-three/fiber) for WebGL/Three.js integration
- @react-three/drei for helper components
- **Components:** Globe visualization, holographic RES gauges, volumetric PM2.5 bars, alert particle systems
- **Alternative Considered:** Leaflet for 2D maps (currently used on map page)
- **Rationale:** R3F provides declarative 3D rendering while maintaining React's component model

**Map Integration:**
- Leaflet with React Leaflet for 2D interactive maps
- OpenStreetMap tiles for base map layer
- Custom markers colored by RES scores (green/amber/red)

### Backend Architecture

**Runtime:** Node.js with Express server
- TypeScript for type safety across the stack
- Development: tsx for hot reloading
- Production: esbuild for fast compilation

**API Structure:** RESTful API with organized route modules
- `/api/zones` - Zone management
- `/api/res/scores` - RES calculations and scores
- `/api/res/overview` - High-level statistics
- `/api/alerts` - Alert management
- `/api/action-reports` - Action tracking
- `/api/community-reports` - Community engagement

**Data Storage:** In-memory storage with interface for future database integration
- `IStorage` interface defines contract for data operations
- `MemStorage` implementation provides in-memory CRUD operations
- **Designed for migration:** Schema is Drizzle-ready with PostgreSQL configuration present
- **Rationale:** Rapid development with easy transition path to persistent database

**Core Business Logic Services:**

1. **RES Engine (`res.engine.ts`):**
   - Calculates Resilience Environmental Score: `RES = 100 - [0.4(AirRisk) + 0.3(WaterDeficit) + 0.2(PopDensity) + 0.1(IndustrialZone)]`
   - Weights: Air Quality (40%), Water Deficit (30%), Population Density (20%), Industrial Zone (10%)
   - Air Risk derived from PM2.5 using WHO thresholds (0-50: Good, 50-100: Moderate, 100-150: Unhealthy, 150+: Hazardous)

2. **Alert Manager (`alert.manager.ts`):**
   - Proactive alert generation based on thresholds
   - Critical: RES < 40 OR PM2.5 > 150
   - High: RES < 60 OR PM2.5 > 100
   - Medium: PM2.5 > 50
   - Alert deduplication and status management

3. **Data Harvester (`data.harvester.ts`):**
   - Integrates with OpenAQ API for real-time PM2.5 data
   - Maps external data to internal zone structure
   - Handles API timeouts and errors gracefully

**Scheduled Updates:**
- Node-cron runs RES calculations and alert updates every 5 minutes
- Client-side polling via TanStack Query every 30 seconds for UI updates
- **Rationale:** Balance between real-time responsiveness and API rate limits

### Data Schema Design

**Entities:**
- **Zone:** Delhi administrative zones with resilience factors (density, water deficit, industrial status, coordinates)
- **AirQualityLog:** Time-series PM2.5 measurements per zone
- **ResScore:** Calculated resilience scores with component breakdowns
- **Alert:** System-generated alerts with severity levels and active status
- **ActionReport:** Documented responses to alerts
- **CommunityReport:** User-submitted observations with verification status

**Validation:** Zod schemas provide runtime validation and type inference
- `insertZoneSchema`, `insertAlertSchema`, etc.
- Shared between client and server via `@shared/schema`

### Development Tooling

**Build System:**
- Vite for frontend with React plugin and HMR
- esbuild for backend bundling in production
- Path aliases: `@/` (client), `@shared/` (shared schemas), `@assets/` (assets)

**Type Safety:**
- Strict TypeScript across entire codebase
- Shared types via `@shared/schema.ts`
- ESM modules throughout

**Code Quality:**
- TypeScript strict mode enabled
- React Hook Form with Zod resolver for form validation
- Replit-specific plugins for development banner and error overlays

## External Dependencies

### Third-Party Services

**OpenAQ API:**
- **Purpose:** Real-time air quality data (PM2.5 measurements)
- **Endpoint:** `https://api.openaq.org/v2/latest`
- **Rate Limits:** Potential limitations; caching and fallback strategies recommended for production
- **Data Flow:** Harvester fetches → Maps to zones → Triggers RES calculation → Generates alerts

**OpenStreetMap (Leaflet):**
- **Purpose:** Base map tiles for 2D map visualization
- **CDN:** `unpkg.com/leaflet@1.9.4`
- **Integration:** React Leaflet wrapper components

**Google Fonts:**
- **Typography:** IBM Plex Sans and IBM Plex Mono
- **Loading:** CDN link in `client/index.html`

### Database Configuration

**Drizzle ORM:** Configured but not actively used
- Schema defined in `shared/schema.ts`
- PostgreSQL dialect configured via `drizzle.config.ts`
- Migration output directory: `./migrations`
- Connection: `@neondatabase/serverless` driver ready
- **Note:** Currently using in-memory storage; Postgres can be added when needed

### Key NPM Dependencies

**Frontend:**
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Headless UI primitives (30+ components)
- `react-hook-form` + `@hookform/resolvers` - Form management
- `@react-three/fiber` + `@react-three/drei` - 3D rendering
- `leaflet` + `react-leaflet` - 2D maps
- `wouter` - Routing
- `axios` - HTTP client
- `zod` - Schema validation

**Backend:**
- `express` - Web framework
- `node-cron` - Scheduled tasks
- `drizzle-orm` + `drizzle-kit` - ORM (configured, not active)

**Build/Dev:**
- `vite` - Frontend build tool
- `tsx` - TypeScript execution
- `esbuild` - Production bundling
- `tailwindcss` + `autoprefixer` - CSS processing