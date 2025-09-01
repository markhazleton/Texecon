# Texas Economic Analysis Website

## Overview

This is a full-stack web application for providing economic analysis and commentary on the Texas economy. The application features a modern React frontend with a Node.js/Express backend, designed to serve educational content about Texas economic trends and insights. The site includes sections for team information, economic insights, data dashboards, and newsletter subscription functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the main application framework
- **Vite** as the build tool and development server for fast compilation and hot module replacement
- **Wouter** for client-side routing, providing a lightweight alternative to React Router
- **TanStack Query** for server state management and API data fetching
- **Tailwind CSS** with custom design tokens for styling
- **shadcn/ui** component library built on Radix UI primitives for consistent, accessible UI components
- **React Hook Form** with Zod validation for form handling

### Component Structure
- Modular component architecture with reusable UI components
- Custom hooks for functionality like scrolling, counters, and mobile detection
- Responsive design with mobile-first approach
- Dark/light theme support through CSS variables

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **Drizzle ORM** with PostgreSQL dialect for database operations
- Memory-based storage implementation (`MemStorage`) for development with interface for easy database migration
- RESTful API structure with `/api` prefix for all endpoints
- Session management setup with `connect-pg-simple`
- Error handling middleware for consistent error responses

### Database Design
- **PostgreSQL** as the production database (configured via Drizzle)
- User schema with UUID primary keys, username, and password fields
- Database migrations managed through Drizzle Kit
- Zod schemas for type-safe data validation

### Build and Development
- **ESBuild** for production server bundling
- Development and production environment separation
- Vite development server with middleware integration
- TypeScript configuration supporting both client and server code
- Path aliases for clean imports (`@/`, `@shared/`)

### Styling System
- Custom color palette with primary (blue), secondary (gold), and accent (green) colors
- CSS custom properties for theme customization
- Responsive typography using Inter font family
- Component variants using `class-variance-authority`
- Tailwind CSS utility classes with custom configuration

### State Management
- TanStack Query for server state and caching
- React Context for UI state (toast notifications, theme)
- Custom hooks for business logic and reusable functionality

## External Dependencies

### UI and Styling
- **@radix-ui/***: Accessible UI primitive components for modals, dropdowns, navigation
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

### Data and API
- **@tanstack/react-query**: Server state management and data fetching
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **zod**: Schema validation for runtime type checking

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error handling for Replit environment
- **@replit/vite-plugin-cartographer**: Development tooling for Replit
- **tsx**: TypeScript execution for development server

### Form Handling
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx** & **tailwind-merge**: Utility for combining CSS classes
- **nanoid**: Unique ID generation
- **wouter**: Lightweight client-side routing

The application is designed to be deployed on Replit with PostgreSQL database support, featuring a clean separation between frontend and backend concerns, type safety throughout the stack, and a modern developer experience.