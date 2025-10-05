# Carivoo - Luxury Car Rental Marketplace Design Guidelines

## Design Approach & Philosophy

**Reference-Based Approach:** Drawing inspiration from high-end automotive brands (Porsche Design, Mercedes-Benz digital experiences) and luxury marketplaces. The design emphasizes sophisticated minimalism, premium materials, and meticulous attention to detail.

**Core Principles:**
- Monochromatic elegance with metallic accents
- Generous negative space conveying exclusivity
- Refined typography hierarchy
- Subtle, purposeful micro-interactions
- Glass-morphism and depth for premium feel

---

## Color Palette

**Dark Mode Primary (Default Experience):**
- Background Deep: 0 0% 8% (rich charcoal)
- Background Elevated: 0 0% 12% (card surfaces)
- Background Subtle: 0 0% 16% (hover states)
- Silver Accent: 0 0% 75% (primary interactive elements)
- Silver Muted: 0 0% 55% (secondary text)
- Pure White: 0 0% 98% (headlines, CTAs)
- Border Subtle: 0 0% 20% (dividers, card edges)

**Metallic Accents:**
- Silver Shimmer: 0 0% 85% (premium highlights)
- Chrome Effect: Linear gradients from 0 0% 60% to 0 0% 90% for special elements

---

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - 400, 500, 600, 700
- Display: Montserrat (Google Fonts) - 300, 400, 600 for luxury headlines

**Hierarchy:**
- Hero Display: 64px/72px, Montserrat Light (tracking -0.02em)
- H1: 48px/56px, Montserrat Semibold
- H2: 32px/40px, Inter Semibold
- H3: 24px/32px, Inter Medium
- Body Large: 18px/28px, Inter Regular
- Body: 16px/24px, Inter Regular
- Caption: 14px/20px, Inter Regular (silver muted)
- Label: 12px/16px, Inter Medium, uppercase (tracking 0.05em)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 24, 32
- Micro-spacing: 2, 4 (tight elements)
- Standard: 6, 8 (component padding)
- Section: 12, 16, 24 (between groups)
- Hero: 32 (generous landing sections)

**Grid System:**
- Desktop: 12-column grid, max-w-7xl container
- Tablet: 8-column grid
- Mobile: 4-column grid, full-width cards

**Viewport Strategy:**
- Hero: 90vh with overlay content
- Content sections: Natural height with py-24 desktop, py-16 mobile
- Cards: Consistent aspect ratios (16:9 for vehicle images)

---

## Component Library

### Navigation
**Header:** Fixed, backdrop-blur-xl, bg-black/40, border-b border-subtle
- Left: Carivoo logotype (Montserrat)
- Center: "Browse Vehicles" "How it Works" "For Agencies" links
- Right: Search icon, Profile/Login (silver outline button with blur backdrop)
- Mobile: Hamburger → full-screen overlay menu

### Hero Section
**Full-viewport immersive experience:**
- Background: High-res luxury car imagery (see Images section)
- Overlay: Radial gradient from transparent to black/80 at bottom
- Content: Centered, max-w-4xl
  - Headline: "Drive Extraordinary" (Montserrat Light, 64px)
  - Subhead: "Curated luxury vehicles from exclusive agencies" (18px, silver muted)
  - Search Bar: Inline form (Location | Dates | Browse) with frosted glass bg-white/10, backdrop-blur-lg
  - CTA: Primary "Explore Collection" (silver bg, black text, bold)
- Scroll indicator: Animated chevron at bottom

### Vehicle Cards
**Premium grid layout:**
- Card: bg-elevated, rounded-xl, border-subtle, overflow-hidden
- Image: 16:9 aspect ratio, grayscale on hover → color transition
- Badge: Absolute top-right "Featured" (bg-silver/20, backdrop-blur)
- Content padding: p-6
  - Make/Model: H3 weight
  - Year/Category: Caption, uppercase
  - Price: H2, "/day" suffix
  - Quick specs: Icon + text row (4-col grid: seats, transmission, fuel, range)
- Hover: Transform scale-102, shadow-2xl, border-silver/40

### Search & Filters
**Sidebar Filter Panel (Desktop) / Drawer (Mobile):**
- Glass-morphic container: bg-elevated/80, backdrop-blur-xl
- Sections: Vehicle Type, Price Range, Brand, Features, Availability
- Controls: Custom styled checkboxes (silver accent), range sliders with gradient track
- Apply button: Full-width silver CTA

### Booking Flow
**Multi-step wizard:**
- Step indicator: Horizontal progress bar with numbered circles
- Steps: Select Dates → Choose Insurance → Review Details → Payment
- Form fields: Floating labels, border-subtle focus → border-silver
- Summary sidebar: Sticky, glass-effect, itemized breakdown
- Confirmation: Subtle confetti animation, booking reference in monospace font

### Agency Profiles
**Two-column layout:**
- Left (40%): Agency info card with logo, description, verification badge, stats grid
- Right (60%): Vehicle inventory masonry grid
- Trust indicators: Years in business, total bookings, response time

### Footer
**Three-column layout:**
- Column 1: Brand statement, social icons (subtle hover glow)
- Column 2: Quick links (Browse, Agencies, About, Support)
- Column 3: Newsletter signup (inline form with silver button)
- Bottom bar: Copyright, Terms, Privacy (centered, caption size)

---

## Images Section

**Hero Image:**
- **Type:** Full-viewport background image
- **Subject:** Dramatic close-up of luxury vehicle (e.g., Mercedes S-Class front quarter angle, or Porsche 911 profile) in motion or sophisticated studio setting
- **Treatment:** High contrast black/silver tones, professional automotive photography quality
- **Overlay:** Dark radial gradient vignette from edges

**Vehicle Listing Images:**
- **Format:** 16:9 landscape, minimum 1920x1080
- **Style:** Studio quality, consistent lighting, multiple angles (front 3/4, side profile, interior dashboard, detail shots)
- **Placement:** Card thumbnails, gallery lightbox on detail pages

**Category Headers:**
- **Sections:** Luxury Sedans, Sports Cars, SUVs, Exotic sections
- **Treatment:** Subtle parallax scroll, darkened overlay for text readability

**Agency Profile Headers:**
- **Type:** Wide banner (21:9), agency showroom or fleet montage
- **Effect:** Blur-to-focus on scroll entrance

---

## Animations & Interactions

**Page Transitions:**
- Fade-in content: opacity 0 → 1, duration-500
- Stagger children: delay-75 increments for card grids

**Micro-interactions:**
- Button hover: Scale 1.02, shadow expansion, duration-200
- Card hover: Lift effect (translateY -4px), shadow-xl
- Image hover: Grayscale → color, duration-300
- Input focus: Border glow pulse (subtle)

**Scroll Effects:**
- Navbar: Transparent → solid bg on scroll down (backdrop-blur increases)
- Parallax: Hero image moves at 0.5x scroll speed
- Fade-up: Sections reveal with translateY 20px → 0

**Loading States:**
- Skeleton screens: Animated shimmer gradient (silver tones)
- Vehicle cards: Pulse animation while fetching

**Premium Details:**
- Glass-morphism on overlays: bg-white/5, backdrop-blur-xl, border-white/10
- Subtle noise texture overlay on dark backgrounds
- Custom scrollbar: thin, silver track

---

**Delivery Note:** This design creates a cohesive luxury experience through restrained color use, generous spacing, and refined interactions. Every element reinforces the premium positioning—from the monochromatic palette to the precise typography hierarchy. The glass-morphic effects and metallic accents provide sophisticated depth without overwhelming the elegant, sober aesthetic required for high-end vehicle rentals.