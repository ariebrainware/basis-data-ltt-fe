import { chromium, FullConfig } from '@playwright/test'

export default async function globalSetup(config: FullConfig) {
  // Launch a browser, set localStorage flag, and save storage state for tests
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const baseURL =
    (config.projects &&
      config.projects[0] &&
      (config.projects[0] as any).use &&
      (config.projects[0] as any).use.baseURL) ||
    process.env.BASE_URL ||
    'http://localhost:3000'

  // Navigate to the app origin so localStorage is writable
  await page.goto(baseURL)

  // Mark tests as E2E to prevent client-side unauthorized redirects
  await page.evaluate(() => {
    try {
      localStorage.setItem('__E2E_TEST__', '1')
    } catch (err) {
      // ignore
    }
  })

  // Persist storage state for use in tests
  await context.storageState({ path: 'e2e/storageState.json' })
  await browser.close()
}
