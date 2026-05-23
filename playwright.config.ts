import { defineConfig, devices } from '@playwright/test'

// Detect whether the webServer will run over HTTPS by checking for cert env
const isWebServerHttps = !!(
  process.env.NEXT_SSL_CERT ||
  process.env.NEXT_SSL_KEY ||
  process.env.FORCE_HTTPS === 'true'
)
const defaultWebServerUrl = isWebServerHttps
  ? 'https://localhost:3000'
  : 'http://127.0.0.1:3000'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || defaultWebServerUrl,
    /* Allow self-signed/local HTTPS during tests. Set to false in CI when using trusted certs. */
    ignoreHTTPSErrors: process.env.PLAYWRIGHT_IGNORE_HTTPS === 'true',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Use a pre-saved storage state that marks E2E tests to avoid automatic redirects */
    storageState: 'e2e/storageState.json',
  },

  /* Playwright expect options */
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        launchOptions: {
          args: ['--no-sandbox'],
        },
      },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Use a production start (build + start) for stable E2E runs instead of
    // the Turbopack-powered dev server which can cause HMR reload loops.
    command: isWebServerHttps
      ? 'pnpm run build && pnpm run start:https'
      : 'pnpm run build && pnpm run start',
    url: process.env.WEBSERVER_URL || defaultWebServerUrl,
    reuseExistingServer: !process.env.CI,
    env: {
      // API host to use when the app calls the backend. Defaults to HTTPS for
      // production-like local runs; can be overridden via NEXT_PUBLIC_API_HOST.
      NEXT_PUBLIC_API_HOST:
        process.env.NEXT_PUBLIC_API_HOST || 'https://localhost:19091',
      // Provide paths to cert/key when running HTTPS server in CI
      NEXT_SSL_CERT: process.env.NEXT_SSL_CERT || '',
      NEXT_SSL_KEY: process.env.NEXT_SSL_KEY || '',
    },
    // Building can take longer locally; increase timeout to 3 minutes.
    timeout: 180000,
  },
  // Create storage state before tests run to set localStorage flags
  globalSetup: require.resolve('./e2e/global-setup'),
})
