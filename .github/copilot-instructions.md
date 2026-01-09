# Copilot Instructions for basis-data-ltt-fe

## Project Overview

**Basis Data LTT** is a Next.js 15-based healthcare management system for "Lee Tit Tar One Solution" - a therapy clinic. The app manages patients, therapists, and treatment records with a session-based authentication system and role-based access control.

### Key Architecture

- **Framework**: Next.js 15.5.9 with App Router
- **Styling**: Tailwind CSS 3.4.19 + Material Tailwind components
- **Auth**: Session tokens stored in localStorage, validated on each API call
- **Backend API**: RESTful endpoints (host configurable via `NEXT_PUBLIC_API_HOST`)
- **Package Manager**: pnpm 10.4.1

---

## Directory Structure & Component Patterns

### Type Definitions (`src/app/_types/`)

Core data models are defined here as interfaces:

- `patient.tsx` - PatientType with ID, full_name, phone_number, etc.
- `therapist.tsx` - TherapistType with role, is_approved status
- `treatment.tsx` - TreatmentType with treatment_date, patient_name, issues
- `healthcondition.tsx` - HealthConditionOptions (predefined select options)

**Pattern**: Always import types from `_types/` when building components. Keep types immutable and reflect backend schema exactly.

### Components (`src/app/_components/`)

Two main component patterns:

**1. Row Components** (e.g., `patientRow.tsx`, `therapistRow.tsx`)

- Accept typed object as props (destructured from interface)
- Manage modal/dialog state locally with `useState`
- Implement form rendering via Material Tailwind `Dialog` + `DialogBody`
- Handle data transformation (e.g., `handleHealthConditionLabelDisplay()` maps IDs to labels)
- Example: PatientRow maps health condition IDs to display labels for better UX

**2. Table Components** (e.g., `tablePatient.tsx`, `tableTherapist.tsx`)

- Receive array of typed data via props interface (e.g., `TablePatientProps`)
- Render table headers via helper functions (`renderHeaderCell()`)
- Map array items to Row components for each item
- Keep table logic separate from row logic

### Custom Hooks & Data Fetching

- **Dashboard pattern**: `useFetchTreatment()` hook in `dashboard/page.tsx` shows the pattern
  - Exports interface for response shape (`ListTreatmentResponse`)
  - Uses `useEffect` with async IIFE for fetching
  - Stores data in state and returns `{ data, total }`
  - Always check response.ok and handle 401 errors via `UnauthorizedAccess()`

### Pages (`src/app/*/page.tsx`)

- **Login** (`login/page.tsx`): Manual form handling with DOM refs, stores token + role in localStorage
- **Dashboard** (`dashboard/page.tsx`): Marked with `'use client'`, fetches today's treatments, displays table with pagination
- **Patient/Therapist/Treatment**: CRUD pages with tables and inline dialogs
- **Register**: Public signup page

---

## Critical Patterns & Conventions

### Authentication & Authorization

1. **Token Management**: User session tokens are stored in localStorage as `session-token` after successful login
2. **Unauthorized Check**: On 401 response, call `UnauthorizedAccess()` from `_functions/unauthorized.tsx` to clear token and redirect to login
3. **Header Setup**: The current implementation sends two tokens with authenticated API calls:
   ```typescript
   headers: {
     'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
     'session-token': localStorage.getItem('session-token') ?? '',
   }
   ```
   
   **⚠️ Security Warning**: This implementation has a security concern:
   - The `session-token` header carries the user-specific authentication token (secure, obtained at login)
   - The `Authorization` header uses `NEXT_PUBLIC_API_TOKEN` which is publicly exposed in the browser bundle
   - `NEXT_PUBLIC_*` variables should NEVER be used for authentication/authorization as they are embedded in client-side JavaScript
   - Backend should rely solely on `session-token` for authentication, not on the Authorization header with the public token
   
4. **Role Storage**: User role stored in localStorage as `user-role`

### API Integration

- **Host**: Configurable via `process.env.NEXT_PUBLIC_API_HOST` (defaults to `http://localhost:19091`)
- **Date Handling**: Format dates as `YYYY-MM-DD` (see dashboard treatment filtering)
- **Response Shape**: Backend returns `{ data: { [resourceName]: [...] }, total: number }`
- **Error Handling**: Check response.ok; 401 errors trigger re-login flow

### Material Tailwind Components

Components require verbose prop forwarding for React 19 compatibility:

```tsx
<Card
  color="transparent"
  shadow={false}
  placeholder={undefined}
  onPointerEnterCapture={undefined}
  onPointerLeaveCapture={undefined}
  // ... etc
>
```

This is verbose but necessary for Material Tailwind stability.

### Tailwind CSS

- **Config**: Custom theme in `tailwind.config.ts`
- **Linting**: ESLint enforces `tailwindcss/classnames-order` as warn
- **Custom Classes**: Disabled via `tailwindcss/no-custom-classname: off`
- **Naming**: Use standard Tailwind utilities; avoid hardcoded values

### Data Transformation

- Maps from backend IDs to human-readable labels (e.g., health condition IDs → labels)
- Helper functions like `handleHealthConditionLabelDisplay()` parse comma-separated IDs
- Input validation functions transform user input back to IDs for API submission

---

## Development Commands

```bash
# Setup
pnpm install

# Development with Turbopack (fast local dev)
pnpm run dev

# Production build & start
pnpm run build
pnpm run start

# Linting (enforces Prettier + Tailwind order)
pnpm run lint
```

**Environment Setup**: Copy `sample.env` to `.env.local` and set:

- `NEXT_PUBLIC_API_HOST`: Backend URL (e.g., `http://localhost:19091`)

**⚠️ Security Note**: 
- Any environment variables prefixed with `NEXT_PUBLIC_*` are exposed to the browser and embedded in the client-side JavaScript bundle
- **Never store secrets, API keys, or authentication tokens in `NEXT_PUBLIC_*` variables**
- The actual authentication in this application is handled via user-specific `session-token` obtained after login, which is stored in localStorage and sent with each authenticated request

---

## Common Development Tasks

### Adding a New CRUD Table

1. Define type in `src/app/_types/[resource].tsx`
2. Create `[resource]Row.tsx` with modal form in `_components/`
3. Create `table[Resource].tsx` to render table + row items
4. Create `[resource]/page.tsx` as `'use client'` with `useFetch[Resource]()` hook
5. Implement data fetching with error handling (check 401)

### Modifying Forms

- Use Material Tailwind `Input`, `Textarea`, `Select` components
- Apply full prop forwarding for compatibility
- Store form values in component state or extract via DOM refs (DOM refs pattern in login page)
- Map business logic IDs ↔ display labels via transform functions

### Adding Authentication-Required Pages

- Check localStorage for `session-token` in useEffect
- Redirect to `/login` if missing
- Call `UnauthorizedAccess()` on 401 errors from API
- Always pass session token in request headers

---

## Code Quality Standards

- **TypeScript**: Strict mode enabled (`"strict": true` in tsconfig.json)
- **Formatting**: Prettier enforced via ESLint (`prettier/prettier: error`)
- **Imports**: Path alias `@/*` maps to `src/*` (use `@/app/...` not `./../../`)
- **Component Exports**: Use named exports for components (reusable)
- **Client Marking**: Add `'use client'` only to pages/components needing browser APIs (useState, localStorage, etc.)

---

## Troubleshooting

| Issue                                          | Solution                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 401 Unauthorized on API calls                  | Check `session-token` in localStorage; verify `NEXT_PUBLIC_API_TOKEN` env var set                       |
| Component render errors with Material Tailwind | Ensure all pointer/capture props forwarded with `undefined` fallbacks                                   |
| Tailwind classes not applying                  | Check `tailwind.config.ts` and ensure CSS imported in layout; run `pnpm lint` to verify class names     |
| TypeScript errors on component imports         | Use path alias `@/app/...` instead of relative paths; check type exports in `_types/`                   |
| 404 on API endpoints                           | Verify `NEXT_PUBLIC_API_HOST` matches backend server; check route parameters match backend expectations |
