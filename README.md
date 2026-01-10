# Basis Data LTT Frontend

A Next.js 15-based healthcare management system for Lee Tit Tar One Solution—a therapy clinic. This application manages patients, therapists, and treatment records with session-based authentication and role-based access control.

## Project Overview

**Tech Stack:**

- Next.js 15.5.9 with App Router
- Tailwind CSS 3.4.19 + Material Tailwind components
- TypeScript with strict mode
- pnpm 10.27.0 package manager

**Key Features:**

- Patient and therapist management (CRUD operations)
- Treatment record tracking with date-based filtering
- Session-based authentication with role-based access control
- RESTful API integration with configurable backend host
- Responsive dashboard with pagination

## Project Structure

```
src/app/
├── _types/              # TypeScript interfaces (patient, therapist, treatment, etc.)
├── _components/         # Reusable components (rows, tables, modals)
├── _functions/          # Utility functions (auth, error handling)
├── dashboard/           # Dashboard page with treatment overview
├── login/               # Login page
├── patient/             # Patient management (CRUD)
├── therapist/           # Therapist management (CRUD)
├── treatment/           # Treatment record management
└── register/            # User registration page
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ariebrainware/basis-data-ltt-fe.git
cd basis-data-ltt-fe
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy `sample.env` to `.env.local` and set:

```bash
NEXT_PUBLIC_API_HOST=http://localhost:19091
```

The `NEXT_PUBLIC_API_HOST` variable configures your backend API endpoint.

### 4. Start the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
pnpm run dev            # Development with Turbopack (fast)
pnpm run build          # Production build
pnpm run start          # Start production server
pnpm run lint           # Run Prettier + Tailwind linting
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage
pnpm test:e2e           # Run E2E tests with Playwright
pnpm test:e2e:ui        # Run E2E tests in UI mode
```

## Testing

This project includes comprehensive automated testing to ensure code quality and prevent regressions:

- **Unit Tests**: Component tests using Jest and React Testing Library
- **E2E Tests**: End-to-end tests using Playwright
- **CI/CD**: Automated testing on every push via GitHub Actions

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run tests with coverage report
pnpm test:coverage
```

See [TESTING.md](./TESTING.md) for detailed testing documentation, including:

- Test structure and organization
- Writing new tests
- CI/CD integration
- Troubleshooting guide

## Authentication & Authorization

- **Login Flow**: Users authenticate via the `/login` page; session tokens are stored in localStorage
- **Token Management**: Each API request includes `session-token` header for authentication
- **Authorization**: User roles are stored in localStorage as `user-role` for client-side access control
- **Error Handling**: 401 responses trigger automatic re-authentication flow

## Key Patterns

### Component Architecture

**Row Components** (e.g., `patientRow.tsx`)

- Accept typed objects as props
- Manage modal/form state locally
- Handle data transformation and display

**Table Components** (e.g., `tablePatient.tsx`)

- Render data arrays as tables
- Map items to Row components
- Manage pagination and filtering

### Data Fetching

```typescript
// Pattern: Custom hooks for data fetching
const { data, total } = useFetchTreatment()
```

- Use `useEffect` for async operations
- Always check response.ok and handle 401 errors
- Store data in state and return typed objects

### Forms & Validation

- Use Material Tailwind `Input`, `Textarea`, `Select` components
- Map business logic IDs to display labels via helper functions
- Full prop forwarding for React 19 compatibility

## Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier enforced via ESLint
- **Imports**: Use path alias `@/app/...` instead of relative paths
- **Client Marking**: Add `'use client'` only where necessary (useState, localStorage, etc.)
- **Naming**: Follow camelCase for variables/functions, PascalCase for components

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Material Tailwind](https://www.material-tailwind.com/)

## Deployment

Deploy to Vercel or your preferred hosting platform. Ensure `NEXT_PUBLIC_API_HOST` is set correctly in production environment variables.
