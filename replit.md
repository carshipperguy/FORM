# Auto Transport Quote System

## Overview

This is a React-based auto transport quote system that allows customers to get instant pricing quotes for vehicle transportation. The application consists of a frontend quote form with real-time pricing calculations and a backend API that processes submissions, integrates with external services, and manages webhook notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend concerns:

**Frontend**: React with TypeScript, using Vite as the build tool and Tailwind CSS for styling
**Backend**: Express.js server with TypeScript, handling API routes and external integrations
**Database**: PostgreSQL with Drizzle ORM for data persistence
**Deployment**: Designed for Replit hosting with iframe embedding capabilities

## Key Components

### Frontend Architecture
- **React with TypeScript**: Main UI framework using functional components and hooks
- **Wouter**: Lightweight client-side routing solution
- **TanStack Query**: Data fetching and caching layer
- **Tailwind CSS + Radix UI**: Styling framework with accessible component primitives
- **Responsive Design**: Mobile-first approach with iframe-specific styling considerations

### Backend Architecture  
- **Express.js API**: RESTful endpoints for quotes, distance calculation, and webhook processing
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **MapQuest Integration**: Real-time distance and route calculation using MapQuest Directions API
- **Webhook System**: Processes form submissions and sends data to external CRM via Zapier

### Pricing Engine
- **Distance-based Calculations**: Uses MapQuest API for accurate mileage calculations
- **Vehicle Type Logic**: Different pricing rules for cars/trucks/SUVs vs RVs and specialty vehicles
- **Minimum Price Enforcement**: Implements floor pricing with uplift rules for different distance ranges
- **Transport Type Options**: Separate pricing for open vs enclosed transport

## Data Flow

1. **Quote Request**: User fills form with pickup/dropoff locations, vehicle details, and contact information
2. **Distance Calculation**: Backend calls MapQuest API to calculate route distance and travel time
3. **Price Calculation**: Pricing engine applies vehicle-specific rules and distance-based calculations
4. **Quote Display**: Frontend shows pricing options with transport type selection
5. **Form Submission**: Complete quote data sent to webhook system
6. **External Integration**: Data forwarded to Zapier webhook for CRM integration
7. **Attribution Tracking**: Parallel webhook sends UTM/attribution data to CRM system

## External Dependencies

### APIs and Services
- **MapQuest Directions API**: Route calculation and distance measurement
- **Zapier Webhooks**: Lead data integration with external CRM system
- **SendGrid**: Email notifications (optional)
- **RingCentral**: SMS notifications (optional)
- **Meta CAPI**: Facebook Conversion API for attribution tracking

### Database
- **PostgreSQL**: Primary data storage via Neon serverless
- **Drizzle Kit**: Database migrations and schema management

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

**Target Platform**: Replit hosting environment
**Build Process**: Vite builds frontend to dist/public, esbuild bundles backend
**Environment Variables**: Centralized configuration for API keys and service credentials
**Iframe Support**: Application designed to be embedded in external websites
**CORS Configuration**: Flexible cross-origin setup for development and production domains
**Health Monitoring**: Built-in webhook monitoring and diagnostic endpoints for troubleshooting integration issues

The application prioritizes reliability and performance with comprehensive error handling, request logging, and fallback mechanisms for external service failures.

## Recent Changes

### October 18, 2025 - RV/5th Wheel Price Discrepancy Fix

**Issue**: Customers saw different prices for RV/5th Wheel quotes on screen versus what was sent to Zapier webhook. Display showed ~$3,100 while webhook sent ~$3,876 for the same quote.

**Root Cause**: The booking page (`client/src/pages/booking.tsx`) contained a `useEffect` hook that recalculated pricing after quote submission. This recalculation used potentially stale or simplified location data, causing different distance calculations and therefore different prices.

**Fix**: Removed the automatic price recalculation in booking.tsx (lines 118-152). The booking page now uses the `finalPrice` that was calculated during initial quote submission, ensuring the displayed price matches exactly what was sent to the webhook.

**Impact**: 
- ✅ Eliminates price discrepancies between UI display and webhook payload
- ✅ Ensures customers see the exact same price that gets recorded in CRM
- ✅ Maintains data integrity across the entire quote-to-booking flow

**Files Modified**:
- `client/src/pages/booking.tsx`: Removed recalculation useEffect, added validation logging
- `client/src/components/SimpleQuoteForm.jsx`: Added diagnostic logging for distance/price values
- `client/src/lib/pricing.ts`: Added diagnostic logging for RV pricing calculations