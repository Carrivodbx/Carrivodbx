# Carivoo - Luxury Car Rental Platform

## Overview

Carivoo is a web-based marketplace connecting luxury car rental agencies with clients. The platform features a sophisticated, sober and elegant design aesthetic with black and silver colors for a premium, luxurious look. It supports two user roles: agencies that list vehicles and clients who browse and book rentals. The application includes integrated payment processing via Stripe and a premium subscription model for agencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state with optimistic updates and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme variables for the luxury aesthetic (neon borders, glass morphism effects, gradient text)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Design System**: Custom color palette with primary (silver/grey), secondary (black/dark grey), and accent (light silver) colors for a sober, elegant, and luxurious aesthetic

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple)
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with role-based access control
- **Build System**: esbuild for production builds, tsx for development

### Data Storage
- **Primary Database**: PostgreSQL (via Neon serverless)
- **Database Schema**:
  - `users`: Authentication and profile data with role field (client/agency)
  - `agencies`: Agency-specific information linked to user accounts
  - `vehicles`: Car listings with pricing, availability, location, geolocation, and optimized images (photo, thumbnail, photos[])
  - `reservations`: Booking records with date ranges and payment status
  - `subscriptions`: Premium agency subscriptions for enhanced visibility
  - `reviews`: Client reviews and ratings for agencies (1-5 stars with optional comments)
  - `favorites`: Client favorite vehicles list
  - `notifications`: User notifications system (reservation, payment, review, general types)
  - `sessions`: Session table managed by connect-pg-simple (included in schema to prevent accidental deletion)
- **Session Store**: PostgreSQL-backed sessions for authentication persistence
- **Image Storage**: Base64 images stored in database with automatic compression and thumbnail generation

### Authentication & Authorization
- **Strategy**: Session-based authentication with secure password hashing (scrypt with salt)
- **User Roles**: Two-tier system (client and agency) with route-level protection
- **Protected Routes**: ProtectedRoute component wrapper checks authentication before rendering
- **Session Security**: HTTP-only cookies, configurable session secrets, trust proxy settings for production
- **Email Verification**: Token-based email verification with hashed tokens (emailVerified, verificationTokenHash, verificationTokenExpires fields)
- **Password Reset**: Dual-channel reset (email and SMS) with dedicated token fields (resetTokenHash, resetTokenExpires, resetChannel, resetTarget)

### Payment Integration
- **Provider**: Stripe with support for card payments and Apple Pay
- **Payment Flow**: 
  - One-time payments for reservations with 90/10 split (agency/platform)
  - Recurring subscriptions for agency premium membership (€29.99/month)
  - Client-side: @stripe/stripe-js and @stripe/react-stripe-js for payment UI
  - Server-side: Stripe API integration with webhook support for payment confirmation
- **Revenue Model**: 10% platform commission on bookings, premium subscription upsell for agencies
- **Premium Subscription Access**: 
  - Visible card in agency dashboard (if not subscribed) with clear CTA button
  - Direct access to `/premium` page for subscription purchase
  - Shows active subscription status with badge when subscribed
  - Requires STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY environment variables

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Stripe**: Payment processing for bookings and subscriptions
- **Replit Services**: Development tooling (cartographer, dev banner, runtime error overlay)
- **Email Service**: NOT CONFIGURED - Resend integration was dismissed. Need credentials for email verification and password reset
- **SMS Service**: NOT CONFIGURED - Need Twilio or Vonage credentials for SMS password reset (user mentioned VONAGE_API_KEY/SECRET)

### Key NPM Packages
- **UI/UX**: @radix-ui/* components, class-variance-authority for component variants, cmdk for command palette
- **Data Fetching**: @tanstack/react-query for server state management
- **Forms**: react-hook-form with @hookform/resolvers for validation
- **Database**: drizzle-orm with @neondatabase/serverless driver, drizzle-zod for schema validation
- **Authentication**: passport, passport-local, express-session, connect-pg-simple
- **Payments**: stripe, @stripe/stripe-js, @stripe/react-stripe-js
- **Utilities**: date-fns for date manipulation, nanoid for ID generation

### Development Tools
- **TypeScript**: Full type safety across client and server
- **Vite**: Fast development server with HMR
- **PostCSS**: CSS processing with Tailwind and autoprefixer
- **Path Aliases**: Configured for @/, @shared/, and @assets/ imports
- **Sharp**: High-performance image processing for compression and optimization

## Performance Optimizations

### Image Optimization (October 2025)
- **Automatic Compression**: All uploaded images are compressed using Sharp library
  - Main photos: Resized to max 1200x1200px, JPEG quality 70%
  - Thumbnails: 400x400px, fit: cover, JPEG quality 60%
  - EXIF orientation auto-correction with `.rotate()` to fix rotated images
- **Thumbnail System**: Separate thumbnail field for vehicle list views
  - List view loads only lightweight thumbnails (~20-36KB vs 200-260KB)
  - Detail view loads full photos separately via `/api/vehicles/:id/photos` endpoint
  - Performance gain: Vehicle list loads in ~300ms (down from 30+ seconds)
- **Split Loading Strategy**:
  - `/api/vehicles/:id/info` - Vehicle info without photos (fast, ~150ms)
  - `/api/vehicles/:id/photos` - Photos loaded separately (deferred, ~500ms)
- **Compression Results**: 44-88% size reduction on existing images
  - Example: BMW x6m main photo reduced from 260KB to 36KB thumbnail (86% reduction)