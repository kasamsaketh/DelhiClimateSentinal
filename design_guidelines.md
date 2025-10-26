# Project Phoenix - Design Guidelines

## Design Approach: Carbon Design System

**Rationale:** Project Phoenix is a data-intensive, enterprise-grade urban resilience monitoring platform requiring exceptional clarity, scalability, and professional polish. Carbon Design System (IBM's design language) is specifically architected for complex data environments, offering robust patterns for dashboards, real-time monitoring, and sophisticated data visualization interfaces.

**Core Design Principles:**
- Data transparency and hierarchy
- Efficiency in information consumption
- Professional, trustworthy aesthetic
- Support for complex 3D visualizations alongside traditional UI
- Scalable component system for future expansion

---

## Typography System

**Font Family:**
- Primary: IBM Plex Sans (via Google Fonts CDN)
- Monospace: IBM Plex Mono (for data, metrics, timestamps)

**Type Scale:**
- Hero/Dashboard Title: text-4xl font-light (36px) - used sparingly for main view titles
- Section Headers: text-2xl font-medium (24px) - zone names, panel titles
- Subsection Headers: text-lg font-semibold (18px) - metric categories, alert types
- Body Text: text-base font-normal (16px) - descriptions, community reports
- Data/Metrics: text-sm font-mono (14px) - numerical values, timestamps, coordinates
- Labels/Captions: text-xs font-medium uppercase tracking-wide (12px) - field labels, legend items

**Hierarchy Rules:**
- Dashboard title uses light weight for sophistication
- Metric values are displayed larger than their labels
- Alert text uses semibold weight for urgency
- All caps reserved exclusively for micro-labels and status badges

---

## Layout & Spacing System

**Spacing Primitives (Tailwind units):**
Core spacing set: **2, 4, 6, 8, 12, 16**

**Application:**
- Component padding: p-4 to p-6 (standard), p-8 (larger panels)
- Section margins: my-6 to my-8
- Element gaps: gap-4 (grids), gap-2 (tight lists), gap-6 (card grids)
- Icon-to-text spacing: gap-2
- Panel spacing: space-y-6 for vertical stacks

**Grid System:**
- Primary layout: CSS Grid with explicit template areas
- 3D Canvas: Takes 60-70% width on desktop (left side)
- Data Sidebar: 30-40% width (right side, fixed positioning)
- Responsive: Stacks vertically on mobile with canvas taking full width first

**Container Strategy:**
- Full-screen application (no max-width containers)
- Sidebar panels: Fixed width 400px (desktop), full-width (mobile)
- Content within panels: px-6 py-4 for consistent edge spacing
- Alert ticker: Full-width with contained inner content (max-w-screen-xl mx-auto)

---

## Component Library

### Navigation & Layout

**Header Bar:**
- Height: h-16
- Structure: Flex layout with logo/title left, system status indicators right
- Content: App title "Project Phoenix", connection status badge, current timestamp
- Styling: Subtle bottom border, semi-transparent backdrop blur

**Sidebar Panel (Zone Details):**
- Structure: Fixed-width column with scrollable content sections
- Sections: Zone overview card, RES gauge visualization, PM2.5 metrics, water deficit, alert list, action buttons
- Card pattern: Contained sections with subtle borders, p-6 spacing
- Dividers: 1px border between major sections

**Alert Ticker:**
- Position: Fixed bottom of viewport
- Structure: Horizontal scroll/marquee for active alerts
- Height: h-12
- Display: Icon + alert text + timestamp + severity indicator

### Data Display Components

**RES Hologram Gauge:**
- 3D visualization (React Three Fiber) displaying score 0-100
- Accompanying 2D overlay: Large score number (text-5xl font-bold) + contextual label
- Status ring: Visual color coding based on threshold (handled without color specification - purely structural)

**Metric Cards:**
- Structure: Grid layout (grid-cols-2 on mobile, grid-cols-3 on desktop)
- Each card: Label (text-xs uppercase), Value (text-2xl font-mono), Unit (text-sm), Trend indicator
- Spacing: p-4 with gap-4 between cards

**Zone Details Card:**
- Structure: Vertical stack with label-value pairs
- Fields: Zone name (text-xl), Population density, Water deficit %, Industrial zone flag
- Spacing: space-y-3 for field groups

**Data Table (Action Logs):**
- Headers: text-xs uppercase font-semibold
- Row height: h-12 with py-2
- Cell padding: px-4
- Striped rows for readability (structural pattern, not color)
- Hover state: Subtle background change

### Interactive Components

**Action Buttons:**
- Primary CTA: "Log Action" - px-6 py-3, text-base font-semibold, rounded-md
- Secondary: "Submit Community Report" - px-4 py-2, text-sm, outlined variant
- Icon buttons (refresh data): w-10 h-10, rounded-full, centered icon
- Consistent: All use Heroicons (solid for filled actions, outline for secondary)

**Form Modals:**
- Overlay: Fixed positioning with backdrop blur
- Modal container: max-w-md w-full, rounded-lg, p-8
- Form spacing: space-y-6 for field groups, space-y-2 within groups
- Input fields: h-11, px-4, rounded-md, text-base
- Labels: text-sm font-medium, mb-2
- Submit button: Full-width (w-full) primary button

**Zone Selection (3D Map):**
- Interactive 3D mesh objects with hover states (scale transform)
- Selection indicator: Outline glow effect on selected zone
- Tooltip on hover: Zone name + current RES score (positioned absolute near cursor)

### Visualization Components

**3D Canvas Setup:**
- React Three Fiber canvas with OrbitControls
- Camera: Perspective, positioned for optimal Delhi map view
- Lighting: Ambient + directional for depth without harsh shadows
- Post-processing: Optional subtle bloom for holographic elements

**Volumetric PM2.5 Bars:**
- 3D bar chart rising from zone centers
- Height represents PM2.5 concentration
- Spacing: Consistent gap-4 equivalent in 3D units between bars

**Alert Particle System:**
- Particle count: 100-200 particles per critical zone
- Animation: Pulsing scale (0.8 to 1.2) with radial dispersion
- Performance: Use instanced mesh for optimization

### Feedback & Status

**Loading States:**
- Skeleton screens for data panels (h-24 rounded-md animate-pulse)
- Spinner for 3D scene loading (centered, w-8 h-8)
- Progress indicators for data fetching (h-1 width transition)

**Status Badges:**
- Structure: Inline-flex items-center gap-2, px-3 py-1, rounded-full, text-xs font-semibold
- Types: Active alert, Verified report, Data synced, Connection status
- Icon + text pattern throughout

**Toast Notifications:**
- Position: Fixed top-right, z-50
- Structure: Flex with icon + message + close button
- Size: max-w-sm, p-4, rounded-lg
- Dismiss: Auto-dismiss after 5s or manual close

---

## Animation Guidelines

**Use Sparingly - Only for:**
1. RES gauge transitions (smooth number counting with easing)
2. Alert particles (continuous pulsing for urgency)
3. Modal enter/exit (scale from 0.95 to 1, fade opacity)
4. 3D camera transitions when switching zones (smooth orbital movement)
5. Data loading states (skeleton pulse)

**Avoid:**
- Scroll-triggered animations
- Decorative hover effects on data elements
- Excessive 3D rotations or movements
- Page transition effects

**Performance:**
- All animations use CSS transforms (translate, scale, opacity)
- 3D animations leverage Three.js built-in lerp functions
- Frame budget: Maintain 60fps on desktop, 30fps acceptable on mobile

---

## Icons

**Library:** Heroicons (via CDN)
- Use: Solid variant for primary actions, outline for secondary/navigation
- Size: w-5 h-5 (standard), w-6 h-6 (prominent), w-4 h-4 (inline with text)

**Key Icons:**
- Alert: exclamation-triangle
- Action Log: clipboard-document-list
- Community Report: chat-bubble-left-right
- Refresh Data: arrow-path
- Zone info: information-circle
- Weather: cloud
- Water: beaker
- Industrial: building-office-2

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px - Stack all panels vertically, canvas first (h-96), then scrollable data
- Tablet: 768px - 1024px - Reduce 3D canvas to 50% width, adjust sidebar
- Desktop: > 1024px - Full split layout with 3D canvas dominant

**Mobile Optimizations:**
- Reduce 3D particle count by 50%
- Simplify 3D geometry (lower poly count)
- Collapse metric cards to single column
- Convert data table to card list view
- Sticky header with hamburger menu for navigation