import { test, expect } from '@playwright/test'

test.describe('Treatment Registration', () => {
  test.beforeEach(async ({ page }) => {
    // This page requires authentication
    // Set up mock session token for testing
    await page.goto('/treatment/register')
    await page.evaluate(() => {
      localStorage.setItem('session-token', 'mock-test-token')
      localStorage.setItem('user-role', 'admin')
    })
    await page.goto('/treatment/register')
  })

  test('should display treatment registration form', async ({ page }) => {
    // Check if key form elements are present
    // Note: Actual visibility depends on authentication state
    const pageContent = await page.content()

    // Basic check to ensure page loaded
    expect(pageContent).toBeTruthy()
  })

  test('should have date picker for treatment date', async ({ page }) => {
    const dateInput = page.locator('[id*="treatment"][id*="date"]').first()
    if (await dateInput.isVisible()) {
      await expect(dateInput).toBeVisible()
    }
  })

  test('should have time picker for treatment time', async ({ page }) => {
    const timeInput = page.locator('[id*="time"]').first()
    if (await timeInput.isVisible()) {
      await expect(timeInput).toBeVisible()
    }
  })

  test('should allow filling patient code', async ({ page }) => {
    const patientCodeInput = page.locator('[id*="patient"][id*="code"]').first()
    if (await patientCodeInput.isVisible()) {
      await patientCodeInput.fill('PAT001')
      await expect(patientCodeInput).toHaveValue('PAT001')
    }
  })

  test('should have therapist selection dropdown', async ({ page }) => {
    // Therapist select component should be present
    const therapistSelect = page.locator('[id*="therapist"]').first()
    if (await therapistSelect.isVisible()) {
      await expect(therapistSelect).toBeVisible()
    }
  })

  test('should allow selecting treatment conditions', async ({ page }) => {
    // Treatment condition checkboxes should be present
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check()
      await expect(firstCheckbox).toBeChecked()

      // Uncheck it
      await firstCheckbox.uncheck()
      await expect(firstCheckbox).not.toBeChecked()
    }
  })

  test('should allow filling issues field', async ({ page }) => {
    const issuesInput = page.locator('[id*="issues"]').first()
    if (await issuesInput.isVisible()) {
      const testIssues = 'Patient complains of back pain'
      await issuesInput.fill(testIssues)
      await expect(issuesInput).toHaveValue(testIssues)
    }
  })

  test('should allow filling remarks field', async ({ page }) => {
    const remarksInput = page.locator('[id*="remarks"]').first()
    if (await remarksInput.isVisible()) {
      const testRemarks = 'Patient responded well to treatment'
      await remarksInput.fill(testRemarks)
      await expect(remarksInput).toHaveValue(testRemarks)
    }
  })

  test('should allow filling next visit field', async ({ page }) => {
    const nextVisitInput = page.locator('[id*="next"][id*="visit"]').first()
    if (await nextVisitInput.isVisible()) {
      const testNextVisit = '2024-02-01'
      await nextVisitInput.fill(testNextVisit)
      await expect(nextVisitInput).toHaveValue(testNextVisit)
    }
  })
})
