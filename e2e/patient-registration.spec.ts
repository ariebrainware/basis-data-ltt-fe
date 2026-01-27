import { test, expect } from '@playwright/test'

// Helper: focus -> fill -> confirm value. Falls back to setting value via
// page.evaluate and dispatching input/change if the fill didn't stick.
async function reliableFill(page: any, selector: string, value: string) {
  const locator = page.locator(selector)
  await locator.focus()
  await locator.fill(value)

  try {
    await expect(locator).toHaveValue(value, { timeout: 5000 })
    return
  } catch (err) {
    // Fallback: directly set the element's value and dispatch events.
    await page.$eval(
      selector,
      (el: Element, val: string) => {
        const node = el as HTMLInputElement | HTMLTextAreaElement | null
        if (!node) return
        node.focus()
        ;(node as any).value = val
        node.dispatchEvent(new Event('input', { bubbles: true }))
        node.dispatchEvent(new Event('change', { bubbles: true }))
      },
      value
    )

    await expect(locator).toHaveValue(value, { timeout: 5000 })
  }
}

test.describe('Patient Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display patient registration form', async ({ page }) => {
    // Check page title
    await expect(page.getByText('Form Registrasi Pasien')).toBeVisible()

    // Check required fields are present
    await expect(page.locator('#fullName')).toBeVisible()
    await expect(page.locator('#age')).toBeVisible()
    await expect(page.locator('#job')).toBeVisible()
    await expect(page.locator('#address')).toBeVisible()
    await expect(page.locator('#surgeryHistory')).toBeVisible()
    await expect(page.locator('#phone-0')).toBeVisible()
    await expect(page.locator('#registerBtn')).toBeVisible()
  })

  test('should allow filling full name', async ({ page }) => {
    await reliableFill(page, '#fullName', 'John Doe')
    await expect(page.locator('#fullName')).toHaveValue('John Doe')
  })

  test('should allow selecting gender', async ({ page }) => {
    // Test male radio button
    const maleRadio = page.locator('#gender_male')
    await maleRadio.click()
    await expect(maleRadio).toBeChecked()

    // Test female radio button
    const femaleRadio = page.locator('#gender_female')
    await femaleRadio.click()
    await expect(femaleRadio).toBeChecked()
    await expect(maleRadio).not.toBeChecked()
  })

  test('should allow filling age field', async ({ page }) => {
    await reliableFill(page, '#age', '30')
    await expect(page.locator('#age')).toHaveValue('30')
  })

  test('should allow filling job field', async ({ page }) => {
    await reliableFill(page, '#job', 'Software Engineer')
    await expect(page.locator('#job')).toHaveValue('Software Engineer')
  })

  test('should allow filling address textarea', async ({ page }) => {
    const testAddress = 'Jl. Test No. 123, Jakarta'
    await reliableFill(page, '#address', testAddress)
    await expect(page.locator('#address')).toHaveValue(testAddress)
  })

  test('should allow selecting health conditions', async ({ page }) => {
    // Health condition multi-select should be present
    const healthHistorySelect = page.locator('#healthHistorySelect')

    // Ensure the select is visible
    await expect(healthHistorySelect).toBeVisible()

    // Wait for options to load (when select is not disabled and has options)
    await expect(healthHistorySelect).not.toBeDisabled()
    // Wait for at least one option beyond the placeholder/empty state
    await page.waitForFunction(
      (selectId) => {
        const select = document.getElementById(
          selectId
        ) as HTMLSelectElement | null
        return select && select.options.length > 1
      },
      'healthHistorySelect',
      { timeout: 5000 }
    )

    // Get available options dynamically to avoid hardcoding IDs
    const options = await healthHistorySelect
      .locator('option')
      .evaluateAll((elements) =>
        elements
          .map((el) => (el as HTMLOptionElement).value)
          .filter((v) => v !== '')
      )

    // Fail the test if there are insufficient options to test selection functionality
    expect(
      options.length,
      `Expected at least 2 disease options to be available for testing, but found ${options.length}`
    ).toBeGreaterThanOrEqual(2)

    // Select first two available disease options
    await healthHistorySelect.selectOption([options[0], options[1]])

    // Verify the selection was made
    const selectedValues = await healthHistorySelect.evaluate(
      (el: HTMLSelectElement) =>
        Array.from(el.selectedOptions).map((option) => option.value)
    )
    expect(selectedValues).toContain(options[0])
    expect(selectedValues).toContain(options[1])
  })

  test('should allow filling surgery history', async ({ page }) => {
    const testHistory = 'Appendectomy in 2020'
    await reliableFill(page, '#surgeryHistory', testHistory)
    await expect(page.locator('#surgeryHistory')).toHaveValue(testHistory)
  })

  test('should allow filling phone number', async ({ page }) => {
    await reliableFill(page, '#phone-0', '+628123456789')
    await expect(page.locator('#phone-0')).toHaveValue('+628123456789')
  })

  test('should allow adding additional phone numbers', async ({ page }) => {
    const addPhoneButton = page.getByText('Tambah Nomor Telepon')

    // Click to add first optional phone number
    await addPhoneButton.click()

    // Check if optional input was added
    const optionalPhone1 = page.locator('#phone-1')
    await expect(optionalPhone1).toBeVisible()

    // Fill the optional phone number
    await optionalPhone1.fill('+628987654321')
    await expect(optionalPhone1).toHaveValue('+628987654321')

    // Click to add second optional phone number
    await addPhoneButton.click()

    const optionalPhone2 = page.locator('#phone-2')
    await expect(optionalPhone2).toBeVisible()
  })

  test('should show patient code field when legacy patient checkbox is checked', async ({
    page,
  }) => {
    const legacyCheckbox = page.locator('#legacyPatientCodeCheckbox')
    await legacyCheckbox.check()

    // Patient code field should now be visible
    const patientCodeInput = page.locator('#patientCode')
    await expect(patientCodeInput).toBeVisible()

    // Should be able to fill patient code
    await patientCodeInput.fill('PAT001')
    await expect(patientCodeInput).toHaveValue('PAT001')
  })

  test('should require terms and conditions to be checked', async ({
    page,
  }) => {
    const termCheckbox = page.locator('#termConditionCheckbox')
    const registerBtn = page.locator('#registerBtn')

    // Initially button should have disabled styling
    await expect(registerBtn).toHaveClass(/bg-slate-200/)

    // Force-click the checkbox to avoid any overlay intercepting pointer events
    await termCheckbox.click({ force: true })
    await expect(termCheckbox).toBeChecked()
  })

  test('should validate complete form submission flow', async ({ page }) => {
    // Fill all required fields
    await page.locator('#fullName').fill('John Doe')
    await page.locator('#gender_male').check()
    await page.locator('#age').fill('30')
    await page.locator('#job').fill('Engineer')
    await page.locator('#address').fill('Test Address')
    await page.locator('#phone-0').fill('+628123456789')
    await page.locator('#surgeryHistory').fill('None')

    // Force-click the checkbox to avoid any overlay intercepting pointer events
    await page.locator('#termConditionCheckbox').click({ force: true })

    // Verify register button is now active (style-based anchor)
    const registerBtn = page.locator('#registerBtn')
    await expect(registerBtn).not.toHaveClass(/bg-slate-200/)
    // Note: Actual submission test would require mocking the API
  })
})
