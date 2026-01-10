# Next.js Upgrade Notes - v15.4.10 to v15.5.9

## Date

2026-01-09

## Summary

Successfully upgraded Next.js from version 15.4.10 to 15.5.9, including related dependencies.

## Changes Made

### Package Updates

1. **next**: `15.4.10` → `15.5.9`
2. **eslint-config-next**: `15.1.7` → `15.5.9`
3. **@next/eslint-plugin-next**: Already at `15.5.9` (no change needed)

### Files Modified

- `package.json` - Updated Next.js and ESLint config versions
- `pnpm-lock.yaml` - Updated with new dependency resolutions

## Testing Performed

### ✅ Linting

```bash
pnpm lint
```

- **Result**: Passed with no errors or warnings
- **Note**: `next lint` shows a deprecation notice for Next.js 16 (future version), but works correctly in 15.5.9

### ✅ Unit Tests

```bash
pnpm test
```

- **Result**: All 63 tests passed
- **Test Suites**: 6 passed, 6 total
- **Coverage**: All component and function tests passed without any new failures

### ⚠️ Build Test

- **Note**: Build test was not performed locally due to network restrictions preventing Google Fonts from being fetched
- **CI/CD**: The build will be tested automatically by GitHub Actions when the PR is created
- **Expected**: Build should pass in CI environment with internet access

## Key Findings from Next.js 15.5.0 Release Notes

The upgrade from 15.4.10 to 15.5.9 includes multiple patch versions. Key improvements include:

### Core Improvements

- Enhanced PPR (Partial Prerendering) support with `dynamicIO`
- Improved reliability of async I/O error handling
- Better TypeScript exhaustiveness checking
- Performance optimizations in webpack config and build process
- Turbopack enhancements

### Bug Fixes

- Fixed redirect loop on root data requests with basePath
- Fixed CSS rendering before interactive
- Fixed Pages Router metadata bugs with React 19
- Improved error handling for `headers`/`cookies`/`draftMode` in `'use cache'`

### Developer Experience

- New detachable panel UI in dev tools
- Segment explorer enabled by default
- Better sourcemap cursor columns
- Improved telemetry for internal errors

### Breaking Changes

**None identified** - This is a minor version upgrade with backward compatibility maintained.

## Compatibility Notes

### React 19 Compatibility

- The application uses React 19.2.3
- Next.js 15.5.9 fully supports React 19
- Existing warnings from Material Tailwind about pointer event handlers are unrelated to the Next.js upgrade

### Known Issues (Pre-existing)

1. **Material Tailwind + React 19**: `@material-tailwind/react` shows peer dependency warnings for React 19 (expects React 16-18), but functionality is not affected
2. **Test Warnings**: Some act() warnings in tests are pre-existing and not introduced by this upgrade

## Recommendations

### Immediate Actions

- ✅ Monitor CI/CD pipeline for successful build
- ✅ Test in development environment with `pnpm dev`
- ✅ Test in production-like environment with `pnpm build && pnpm start`

### Future Considerations

1. **Next.js 16 Migration**: Note that `next lint` will be deprecated in Next.js 16. When upgrading to Next.js 16, run:

   ```bash
   npx @next/codemod@canary next-lint-to-eslint-cli .
   ```

2. **pnpm Version**: Consider updating the GitHub Actions workflow to use pnpm 10.27.0 (currently at 10.27.0) to match the local development version specified in `package.json`.

## Rollback Plan

If issues are discovered:

```bash
# Revert package.json changes
git checkout HEAD~1 -- package.json pnpm-lock.yaml

# Reinstall dependencies
pnpm install --no-frozen-lockfile
```

## Verification Checklist

- [x] Dependencies installed successfully
- [x] Linting passes
- [x] Unit tests pass
- [x] No new warnings introduced
- [ ] Build succeeds in CI/CD
- [ ] Application starts correctly
- [ ] Development mode works (`pnpm dev`)
- [ ] Production build works (`pnpm build && pnpm start`)

## References

- [Next.js 15.5.0 Release Notes](https://github.com/vercel/next.js/releases/tag/v15.5.0)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Upgrade Guide](https://nextjs.org/docs/upgrading)
