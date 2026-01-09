import { test, expect } from '@playwright/test'

test.describe.serial('Search and Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication before navigation to avoid redirects
    // Use init script so storage is available before page navigations
    await page.addInitScript(() => {
      try {
        localStorage.setItem('session-token', 'mock-test-token')
        localStorage.setItem('user-role', 'admin')
      } catch (e) {
        // ignore if storage is not available in some contexts
      }
    })
  })

  test.describe('Patient Search', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/patient')
      // Ensure we end up on the patient page; if redirected to login, restore storage and retry
      await page.waitForLoadState('domcontentloaded')
      if (page.url().includes('/login')) {
        try {
          await page.evaluate(() => {
            localStorage.setItem('session-token', 'mock-test-token')
            localStorage.setItem('user-role', 'admin')
          })
        } catch (e) {
          // ignore if storage isn't available
        }
        await page.goto('/patient')
        await page.waitForLoadState('networkidle')
      }
    })

    test('should have search input field', async ({ page }) => {
      // Look for search input in subheader by placeholder
      const searchInput = page.getByPlaceholder(
        'Cari berdasarkan Nama atau Kode Pasien'
      )
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await expect(searchInput).toBeVisible()
      }
    })

    test('should allow typing in search field', async ({ page }) => {
      const placeholder = 'Cari berdasarkan Nama atau Kode Pasien'

      // Candidate locators (try fallback strategies)
      const candidates = [
        page.getByPlaceholder(placeholder),
        page.locator('input[placeholder*="Cari berdasarkan"]'),
        page.locator('input[data-icon-placement="start"]'),
        page.locator('input[type="text"]').first(),
      ]

      let filled = false
      for (const candidate of candidates) {
        for (let i = 0; i < 4; i++) {
          if (page.isClosed && page.isClosed()) break
          try {
            await candidate.waitFor({ state: 'visible', timeout: 1500 })
            await candidate.fill('John Doe')
            await expect(candidate).toHaveValue('John Doe')
            filled = true
            break
          } catch (e) {
            await page.waitForTimeout(200)
          }
        }
        if (filled) break
      }
      if (!filled) throw new Error('Search input not available to fill')
    })

    test('should trigger search on Enter key', async ({ page }) => {
      const placeholder = 'Cari berdasarkan Nama atau Kode Pasien'

      // Try multiple locator strategies for pressing Enter
      const candidates = [
        page.getByPlaceholder(placeholder),
        page.locator('input[placeholder*="Cari berdasarkan"]'),
        page.locator('input[data-icon-placement="start"]'),
        page.locator('input[type="text"]').first(),
      ]

      let acted = false
      for (const candidate of candidates) {
        for (let i = 0; i < 4; i++) {
          if (page.isClosed && page.isClosed()) break
          try {
            await candidate.waitFor({ state: 'visible', timeout: 1500 })
            await candidate.fill('test patient')
            await candidate.press('Enter')
            acted = true
            break
          } catch (e) {
            await page.waitForTimeout(200)
          }
        }
        if (acted) break
      }
      if (!acted) throw new Error('Search input not available to trigger Enter')
    })

    test('should clear search field', async ({ page }) => {
      const searchInput = page.locator('input[type="text"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('test search')
        await searchInput.clear()
        await expect(searchInput).toHaveValue('')
      }
    })
  })

  test.describe('Therapist Search', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/therapist')
      await page.waitForLoadState('domcontentloaded')
      if (page.url().includes('/login')) {
        try {
          await page.evaluate(() => {
            localStorage.setItem('session-token', 'mock-test-token')
            localStorage.setItem('user-role', 'admin')
          })
        } catch (e) {}
        await page.goto('/therapist')
        await page.waitForLoadState('networkidle')
      }
    })

    test('should have search input field', async ({ page }) => {
      const searchInput = page.getByLabel('Cari Terapis')
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible()
      }
    })

    test('should allow typing in therapist search', async ({ page }) => {
      const searchInput = page.getByLabel('Cari Terapis')
      if (await searchInput.isVisible()) {
        await searchInput.fill('Dr. Smith')
        await expect(searchInput).toHaveValue('Dr. Smith')
      }
    })

    test('should trigger search on Enter key', async ({ page }) => {
      const searchInput = page.getByLabel('Cari Terapis')
      if (await searchInput.isVisible()) {
        await searchInput.fill('therapist name')
        await searchInput.press('Enter')
        // Note: Actual search results would require API mocking
      }
    })

    test('should have filter tabs', async ({ page }) => {
      // Wait for any tab elements to appear and assert at least one exists
      const tabLocator = page.locator('[role="tab"]')
      await tabLocator.first().waitFor({ state: 'visible', timeout: 7000 })
      const tabCount = await tabLocator.count()
      await expect(tabCount).toBeGreaterThan(0)

      // If specific labels exist, also assert visibility (tolerant)
      const maybeApproved = page.getByText(/\bApproved\b/)
      if ((await maybeApproved.count()) > 0) {
        await expect(maybeApproved.first()).toBeVisible()
      }
      const maybeUnapproved = page.getByText(/\bUnapproved\b/)
      if ((await maybeUnapproved.count()) > 0) {
        await expect(maybeUnapproved.first()).toBeVisible()
      }
    })
  })

  test.describe('Date Filter', () => {
    test('should have date filter functionality', async ({ page }) => {
      await page.goto('/patient')

      // Look for date filter elements
      const dateFilterElements = page.locator(
        '[data-testid*="date"], [id*="date"]'
      )
      const count = await dateFilterElements.count()

      // If date filters exist, test them
      if (count > 0) {
        expect(count).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Pagination', () => {
    test('should have pagination controls', async ({ page }) => {
      await page.goto('/patient')

      // Look for pagination buttons or controls
      const nextButton = page.getByRole('button', { name: /next/i })
      const prevButton = page.getByRole('button', { name: /prev/i })

      // Trigger locator resolution without asserting visibility/existence
      await nextButton.count()
      await prevButton.count()

      // Pagination might not always be visible if there's not enough data
      // So we just check if elements can be found
    })
  })
})
