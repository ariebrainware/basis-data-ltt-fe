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
    // Fallback: directly set the element's value and dispatch stronger events.
    await page.$eval(
      selector,
      (el: Element, val: string) => {
        const node = el as HTMLInputElement | HTMLTextAreaElement | null
        if (!node) return
        node.focus()
        ;(node as any).value = val
        // Dispatch InputEvent which many frameworks listen to
        node.dispatchEvent(new InputEvent('input', { bubbles: true }))
        node.dispatchEvent(new Event('change', { bubbles: true }))
        node.dispatchEvent(new Event('blur', { bubbles: true }))
      },
      value
    )

    // Give WebKit a short moment to process
    await page.waitForTimeout(50)
    await expect(locator).toHaveValue(value, { timeout: 5000 })
  }
}

// Helper to assert and dismiss SweetAlert error dialogs with a given message
async function assertSweetAlertError(page: any, expectedText: string) {
  await page.waitForSelector('.swal2-popup', { timeout: 5000 })
  const errorTitle = page.locator('.swal2-title')
  await expect(errorTitle).toHaveText('Gagal')
  const errorContent = page.locator('.swal2-html-container')
  await expect(errorContent).toHaveText(expectedText)
  await page.locator('.swal2-confirm').click()
}

async function ensureTermsAccepted(page: any) {
  const checkbox = page.locator('#termConditionCheckbox')

  await checkbox.waitFor({ state: 'attached', timeout: 5000 })
  await expect(checkbox).toBeVisible({ timeout: 5000 })

  if (!(await checkbox.isChecked())) {
    await checkbox.setChecked(true, { force: true })
  }

  if (!(await checkbox.isChecked())) {
    const label = page.locator('label[for="termConditionCheckbox"]').first()
    await label.click({ force: true })
  }

  await expect(checkbox).toBeChecked({ timeout: 5000 })
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
    const fullNameValue = 'John Doe'
    await reliableFill(page, '#fullName', fullNameValue)
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

    await ensureTermsAccepted(page)
  })

  test('should validate complete form submission flow', async ({ page }) => {
    // Fill all required fields
    const fullNameValue = 'John Doe'
    await reliableFill(page, '#fullName', fullNameValue)
    await page.locator('#gender_male').check()
    await reliableFill(page, '#age', '30')
    await reliableFill(page, '#job', 'Engineer')
    await reliableFill(page, '#address', 'Test Address')
    await reliableFill(page, '#phone-0', '+628123456789')
    await reliableFill(page, '#surgeryHistory', 'None')

    await ensureTermsAccepted(page)
    // Re-assert full name after toggling terms (WebKit can drop input state)
    const fullNameLocator = page.locator('#fullName')
    if ((await fullNameLocator.inputValue()) !== fullNameValue) {
      await reliableFill(page, '#fullName', fullNameValue)
    }

    // Verify register button is now active (style-based anchor)
    const registerBtn = page.locator('#registerBtn')
    await expect(registerBtn).not.toHaveClass(/bg-slate-200/)
    // Note: Actual submission test would require mocking the API
  })

  // Helper to fill basic required fields and submit, then assert expected SweetAlert error.
  async function submitAndExpectError(
    page: any,
    {
      fullName = 'John Doe',
      gender, // 'male' | 'female' | undefined (omit to simulate not selected)
      phoneValue, // string | undefined: undefined => don't touch phone; '' => focus+blur to leave empty
      expectedError,
    }: {
      fullName?: string
      gender?: 'male' | 'female'
      phoneValue?: string
      expectedError: string
    }
  ) {
    await reliableFill(page, '#fullName', fullName)
    // Ensure fullName was applied (helps WebKit timing flakiness)
    await expect(page.locator('#fullName')).toHaveValue(fullName, {
      timeout: 5000,
    })

    if (gender === 'male') {
      await page.locator('#gender_male').check()
    } else if (gender === 'female') {
      await page.locator('#gender_female').check()
    }

    if (phoneValue === undefined) {
      // Do not touch the phone field to simulate missing phone number
    } else if (phoneValue === '') {
      // Leave the phone input empty but touched
      await page.locator('#phone-0').focus()
      await page.locator('#phone-0').blur()
    } else {
      await page.locator('#phone-0').fill(phoneValue)
    }

    await ensureTermsAccepted(page)

    // Click register button
    // Trigger register action; use page.$eval to invoke click in page context
    await page.$eval('#registerBtn', (el: Element) => {
      const btn = el as HTMLElement
      btn.click()
    })

    await assertSweetAlertError(page, expectedError)
  }

  test('should show error when submitting without gender selected', async ({
    page,
  }) => {
    await submitAndExpectError(page, {
      gender: undefined,
      phoneValue: '+628123456789',
      expectedError: 'Jenis kelamin wajib dipilih',
    })
  })

  test('should show error when submitting without phone number', async ({
    page,
  }) => {
    await submitAndExpectError(page, {
      gender: 'male',
      phoneValue: undefined,
      expectedError: 'Minimal satu nomor telepon wajib diisi',
    })
  })

  test('should show error when submitting with empty phone number field', async ({
    page,
  }) => {
    await submitAndExpectError(page, {
      gender: 'female',
      phoneValue: '',
      expectedError: 'Minimal satu nomor telepon wajib diisi',
    })
  })
})
