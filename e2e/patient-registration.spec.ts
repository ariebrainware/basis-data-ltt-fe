import { test, expect } from '@playwright/test'

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
    await expect(page.locator('#phoneNumber')).toBeVisible()
    await expect(page.locator('#registerBtn')).toBeVisible()
  })

  test('should allow filling full name', async ({ page }) => {
    const fullNameInput = page.locator('#fullName')
    await fullNameInput.fill('John Doe')
    await expect(fullNameInput).toHaveValue('John Doe')
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
    const ageInput = page.locator('#age')
    await ageInput.fill('30')
    await expect(ageInput).toHaveValue('30')
  })

  test('should allow filling job field', async ({ page }) => {
    const jobInput = page.locator('#job')
    await jobInput.fill('Software Engineer')
    await expect(jobInput).toHaveValue('Software Engineer')
  })

  test('should allow filling address textarea', async ({ page }) => {
    const addressInput = page.locator('#address')
    const testAddress = 'Jl. Test No. 123, Jakarta'
    await addressInput.fill(testAddress)
    await expect(addressInput).toHaveValue(testAddress)
  })

  test('should allow selecting health conditions', async ({ page }) => {
    // Health condition multi-select should be present
    const healthHistorySelect = page.locator('#healthHistorySelect')
    
    // Ensure the select is visible
    await expect(healthHistorySelect).toBeVisible()

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
    const surgeryHistoryInput = page.locator('#surgeryHistory')
    const testHistory = 'Appendectomy in 2020'
    await surgeryHistoryInput.fill(testHistory)
    await expect(surgeryHistoryInput).toHaveValue(testHistory)
  })

  test('should allow filling phone number', async ({ page }) => {
    const phoneInput = page.locator('#phoneNumber')
    await phoneInput.fill('+628123456789')
    await expect(phoneInput).toHaveValue('+628123456789')
  })

  test('should allow adding additional phone numbers', async ({ page }) => {
    const addPhoneButton = page.getByText('Tambah Nomor Telepon')

    // Click to add first optional phone number
    await addPhoneButton.click()

    // Check if optional input was added
    const optionalPhone1 = page.locator('#phoneNumberOptional-1')
    await expect(optionalPhone1).toBeVisible()

    // Fill the optional phone number
    await optionalPhone1.fill('+628987654321')
    await expect(optionalPhone1).toHaveValue('+628987654321')

    // Click to add second optional phone number
    await addPhoneButton.click()

    const optionalPhone2 = page.locator('#phoneNumberOptional-2')
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
    await page.locator('#phoneNumber').fill('+628123456789')
    await page.locator('#surgeryHistory').fill('None')

    // Force-click the checkbox to avoid any overlay intercepting pointer events
    await page.locator('#termConditionCheckbox').click({ force: true })

    // Verify register button is now active (style-based anchor)
    const registerBtn = page.locator('#registerBtn')
    await expect(registerBtn).not.toHaveClass(/bg-slate-200/)
    // Note: Actual submission test would require mocking the API
  })
})
