# Testing Documentation

This document provides comprehensive information about the automated testing infrastructure for the Basis Data LTT Frontend application.

## Overview

The project implements a comprehensive testing strategy covering:
- **Unit Tests**: Component-level tests using Jest and React Testing Library
- **E2E Tests**: End-to-end tests using Playwright
- **CI/CD Integration**: Automated testing on every push via GitHub Actions

## Test Structure

```
basis-data-ltt-fe/
├── e2e/                              # E2E tests with Playwright
│   ├── login.spec.ts                 # Login form tests
│   ├── patient-registration.spec.ts  # Patient registration tests
│   ├── therapist-registration.spec.ts# Therapist registration tests
│   ├── treatment-registration.spec.ts# Treatment registration tests
│   └── search-filter.spec.ts         # Search and filter tests
├── src/app/_components/__tests__/    # Component unit tests
│   ├── patientForm.test.tsx          # Patient form component tests
│   ├── therapistForm.test.tsx        # Therapist form component tests
│   └── treatmentForm.test.tsx        # Treatment form component tests
├── jest.config.js                    # Jest configuration
├── jest.setup.js                     # Jest test setup
└── playwright.config.ts              # Playwright configuration
```

## Running Tests

### Unit Tests

Run all unit tests:
```bash
pnpm test
```

Run tests in watch mode (auto-rerun on changes):
```bash
pnpm test:watch
```

Run tests with coverage report:
```bash
pnpm test:coverage
```

### E2E Tests

Run all E2E tests:
```bash
pnpm test:e2e
```

Run E2E tests with UI mode (interactive):
```bash
pnpm test:e2e:ui
```

Run E2E tests in debug mode:
```bash
pnpm test:e2e:debug
```

### Linting

```bash
pnpm lint
```

### Build Check

```bash
pnpm build
```

## Test Coverage

### User Input Features Tested

#### 1. Login Form
- Email input validation
- Password input validation and masking
- Form submission
- Error handling for invalid credentials
- Input clearing

#### 2. Patient Registration
- Full name input
- Gender selection (radio buttons)
- Age input (numeric)
- Job input
- Address textarea
- Health condition checkboxes (multiple selections)
- Surgery history textarea
- Phone number inputs (with dynamic addition)
- Optional patient code field
- Terms and conditions checkbox
- Complete form submission flow

#### 3. Therapist Registration
- Full name input
- Email input with validation
- Password fields (with masking)
- Address input
- Date of birth picker
- Phone number input
- NIK (ID card) input
- Weight and height inputs
- Role selection
- Complete form submission flow

#### 4. Treatment Registration
- Treatment date picker
- Treatment time picker
- Patient code input
- Therapist selection dropdown
- Treatment condition checkboxes
- Issues textarea
- Remarks textarea
- Next visit field
- Complete form submission flow

#### 5. Search and Filter
- Patient search functionality
- Therapist search functionality
- Filter tabs (All, Approved, Unapproved)
- Date filtering
- Pagination controls
- Enter key to trigger search

## Component Tests

### PatientForm Component
- Renders all fields correctly
- Displays patient data accurately
- Disables appropriate fields (ID, patient_code)
- Handles empty data

### TherapistForm Component
- Renders all fields correctly
- Displays therapist data accurately
- Shows approval status correctly
- Disables appropriate fields (ID, approval status)
- Triggers role change callback
- Handles empty role

### TreatmentForm Component
- Renders all fields correctly
- Displays treatment data accurately
- Disables ID field
- Applies role-based field disabling for therapists
- Always allows editing treatment and remarks fields
- Handles empty data

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/test.yml`) runs automatically on:
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop` branches

### Workflow Jobs

1. **Unit Tests Job**
   - Installs dependencies
   - Runs Jest unit tests
   - Uploads coverage report

2. **E2E Tests Job**
   - Installs dependencies
   - Installs Playwright browsers
   - Runs E2E tests
   - Uploads Playwright report

3. **Lint Job**
   - Runs ESLint checks

4. **Build Job**
   - Verifies production build succeeds

## Environment Variables for Testing

The following environment variables are used during testing:

```env
NEXT_PUBLIC_API_HOST=https://localhost:19091
NEXT_PUBLIC_API_TOKEN=test-token
BASE_URL=http://localhost:3000
```

## Writing New Tests

### Adding Unit Tests

1. Create a test file in `src/app/_components/__tests__/`
2. Name it `[component].test.tsx`
3. Import necessary testing utilities:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react'
   ```
4. Mock Material Tailwind components as needed
5. Write descriptive test cases

Example:
```typescript
describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Adding E2E Tests

1. Create a test file in `e2e/`
2. Name it `[feature].spec.ts`
3. Import Playwright utilities:
   ```typescript
   import { test, expect } from '@playwright/test'
   ```
4. Use `test.describe` for test grouping
5. Use `test.beforeEach` for setup
6. Write descriptive test cases

Example:
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path')
  })

  test('should perform action', async ({ page }) => {
    await page.locator('#element').click()
    await expect(page.locator('#result')).toBeVisible()
  })
})
```

## Best Practices

1. **Write Descriptive Test Names**: Use clear, action-oriented names
2. **Test User Interactions**: Focus on how users interact with the UI
3. **Mock External Dependencies**: Mock API calls and external services
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Use Data Test IDs**: Prefer `data-testid` over class names or IDs when possible
6. **Test Edge Cases**: Include tests for empty states, error states, etc.
7. **Maintain Test Performance**: Keep tests fast by avoiding unnecessary waits

## Troubleshooting

### Unit Tests Failing

- Check if all dependencies are installed: `pnpm install`
- Clear Jest cache: `pnpm test --clearCache`
- Check for missing mocks in `jest.setup.js`

### E2E Tests Failing

- Ensure Playwright browsers are installed: `pnpm exec playwright install`
- Check if the dev server is running (Playwright starts it automatically)
- Verify base URL in `playwright.config.ts`
- Run tests in UI mode for debugging: `pnpm test:e2e:ui`

### CI/CD Pipeline Failing

- Check workflow logs in GitHub Actions
- Verify environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Test locally before pushing: `pnpm test && pnpm test:e2e`

## Future Improvements

- [ ] Add visual regression testing
- [ ] Increase test coverage to 80%+
- [ ] Add API mocking for E2E tests
- [ ] Add accessibility (a11y) tests
- [ ] Add performance testing
- [ ] Implement mutation testing

## Contributing

When adding new features:
1. Write tests before implementation (TDD approach)
2. Ensure all tests pass: `pnpm test && pnpm test:e2e`
3. Check test coverage: `pnpm test:coverage`
4. Update this documentation if adding new test patterns

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
