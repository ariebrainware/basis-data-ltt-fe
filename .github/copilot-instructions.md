# Copilot Instructions for basis-data-ltt-fe

## Project Overview

This is a Next.js 15 frontend application for "Lee Tit Tar" - a healthcare/clinic management system. The application manages patients, therapists, treatments, and health conditions.

## Tech Stack

- **Framework**: Next.js 15.4.10 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.18
- **UI Components**: Material Tailwind, Heroicons, Iconoir React, Flowbite
- **Package Manager**: pnpm 10.4.1
- **Code Quality**: ESLint, Prettier
- **Deployment**: Vercel

## Development Setup

### Installation
```bash
pnpm install
```

### Running the Development Server
```bash
pnpm dev
```
The app will be available at http://localhost:3000

### Build Commands
```bash
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Code Style and Conventions

### TypeScript
- Use TypeScript for all new files
- Strict mode is enabled
- Define interfaces for all data types in `src/app/_types/`
- Use PascalCase for type names (e.g., `PatientType`, `TherapistType`)

### Code Formatting
- **No semicolons** (`semi: false`)
- **Single quotes** for strings (`singleQuote: true`)
- **Double quotes** for JSX attributes (`jsxSingleQuote: false`)
- **ES5 trailing commas** (`trailingComma: "es5"`)
- **Print width**: 80 characters
- **Tab width**: 2 spaces

### Component Guidelines
- Place reusable components in `src/app/_components/`
- Use functional components with TypeScript
- Follow Next.js App Router conventions
- Component names use PascalCase (e.g., `PatientForm`)
- Component files use camelCase with `.tsx` extension (e.g., `patientForm.tsx`)

### Tailwind CSS
- Use Tailwind CSS utility classes for styling
- Follow proper classnames order (enforced by ESLint)
- Custom classnames are allowed (`tailwindcss/no-custom-classname: off`)
- Tailwind class order warnings are enabled

### File Structure
```
src/app/
├── _components/     # Reusable components
├── _functions/      # Utility functions
├── _types/          # TypeScript type definitions
├── dashboard/       # Dashboard pages
├── login/           # Login pages
├── patient/         # Patient management pages
├── register/        # Registration pages
├── therapist/       # Therapist management pages
└── layout.tsx       # Root layout
```

## Module Path Aliases
- Use `@/*` for imports from the `src/` directory
- Example: `import { PatientType } from '@/app/_types/patient'`

## Naming Conventions
- **Component Names**: PascalCase (e.g., `PatientForm`, `TableTherapist`)
- **Component Files**: camelCase with `.tsx` extension (e.g., `patientForm.tsx`, `tablePatient.tsx`)
  - Note: The component name inside the file is PascalCase, but the file itself uses camelCase
  - Example: `PatientForm` component is in `patientForm.tsx` file
- **Types/Interfaces**: PascalCase with `Type` suffix (e.g., `PatientType`)
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants

## Testing
- No test infrastructure is currently set up
- When adding tests, follow Next.js testing best practices

## Important Notes
- This is a healthcare application - be mindful of data privacy and security
- The app uses file-based routing with the Next.js App Router
- Server-side rendering is available through Next.js
- Font optimization is handled via `next/font`
- Speed insights are enabled via Vercel

## Environment Variables
- Check `sample.env` for required environment variables
- Create `.env.local` for local development

## Common Tasks

### Adding a New Page
1. Create a new directory in `src/app/` with a `page.tsx` file
2. Follow the App Router conventions for routing

### Adding a New Component
1. Create the component in `src/app/_components/`
2. Use TypeScript and follow the existing component patterns
3. Apply Tailwind CSS classes for styling

### Adding a New Type
1. Create or update files in `src/app/_types/`
2. Export interfaces with PascalCase names ending in `Type`

## Git Workflow
- Use meaningful commit messages
- Keep commits focused and atomic
- Follow conventional commits if possible
