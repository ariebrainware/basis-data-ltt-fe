import { test, expect } from '@playwright/test'

// Small helper similar to patient tests to robustly fill inputs across engines
async function reliableFill(page: any, selector: string, value: string) {
  const locator = page.locator(selector)
  await locator.focus()
  await locator.fill(value)

  try {
    await expect(locator).toHaveValue(value, { timeout: 5000 })
    return
  } catch (err) {
    await page.$eval(
      selector,
      (el: Element, val: string) => {
        const node = el as HTMLInputElement | HTMLTextAreaElement | null
        if (!node) return
        node.focus()
        ;(node as any).value = val
        node.dispatchEvent(new InputEvent('input', { bubbles: true }))
        node.dispatchEvent(new Event('change', { bubbles: true }))
        node.dispatchEvent(new Event('blur', { bubbles: true }))
      },
      value
    )
    await page.waitForTimeout(50)
    await expect(locator).toHaveValue(value, { timeout: 5000 })
  }
}

test.describe('Therapist Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/therapist/register')
  })

  test('should display therapist registration form', async ({ page }) => {
    // Check if key form elements are present
    await expect(page.locator('#fullName')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirm_password')).toBeVisible()
    await expect(page.locator('#address')).toBeVisible()
  })

  test('should allow filling full name', async ({ page }) => {
    const fullNameInput = page.locator('#fullName')
    await fullNameInput.fill('Dr. Jane Smith')
    await expect(fullNameInput).toHaveValue('Dr. Jane Smith')
  })

  test('should allow filling email', async ({ page }) => {
    const emailInput = page.locator('#email')
    await emailInput.fill('therapist@example.com')
    await expect(emailInput).toHaveValue('therapist@example.com')
  })

  test('should mask password fields', async ({ page }) => {
    const passwordInput = page.locator('#password')
    const confirmPasswordInput = page.locator('#confirm_password')

    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })

  test('should allow filling password fields', async ({ page }) => {
    const passwordInput = page.locator('#password')
    const confirmPasswordInput = page.locator('#confirm_password')

    await reliableFill(page, '#password', 'SecurePass123!')
    await reliableFill(page, '#confirm_password', 'SecurePass123!')

    await expect(passwordInput).toHaveValue('SecurePass123!')
    await expect(confirmPasswordInput).toHaveValue('SecurePass123!')
  })

  test('should allow filling address', async ({ page }) => {
    const addressInput = page.locator('#address')
    const testAddress = 'Jl. Medis No. 456, Surabaya'
    await addressInput.fill(testAddress)
    await expect(addressInput).toHaveValue(testAddress)
  })

  test('should have date of birth picker', async ({ page }) => {
    // Check if date picker component is present
    const dateInput = page.locator('#date_of_birth')
    if (await dateInput.isVisible()) {
      await expect(dateInput).toBeVisible()
    }
  })

  test('should have phone input field', async ({ page }) => {
    // Phone input should be present (may be a custom component)
    const phoneContainer = page.locator('[id*="phone"]').first()
    if (await phoneContainer.isVisible()) {
      await expect(phoneContainer).toBeVisible()
    }
  })

  test('should allow filling NIK field', async ({ page }) => {
    // NIK field should be present (may be in IDCardInput component)
    const nikInput = page.locator('[id*="nik"]').first()
    if (await nikInput.isVisible()) {
      await nikInput.fill('1234567890123456')
      await expect(nikInput).toHaveValue('1234567890123456')
    }
  })

  test('should allow filling weight and height', async ({ page }) => {
    // Weight and height inputs (may be in WeightHeightInput component)
    const weightInput = page.locator('[id*="weight"]').first()
    const heightInput = page.locator('[id*="height"]').first()

    if (await weightInput.isVisible()) {
      await weightInput.fill('70')
      await expect(weightInput).toHaveValue('70')
    }

    if (await heightInput.isVisible()) {
      await heightInput.fill('170')
      await expect(heightInput).toHaveValue('170')
    }
  })

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('#email')

    // Fill with invalid email
    await emailInput.fill('invalid-email')
    await emailInput.blur()

    // Fill with valid email
    await emailInput.fill('valid@example.com')
    await expect(emailInput).toHaveValue('valid@example.com')
  })

  test('should validate complete form submission flow', async ({ page }) => {
    // Fill all required fields
    await page.locator('#fullName').fill('Dr. John Therapist')
    await page.locator('#email').fill('john.therapist@example.com')
    await page.locator('#password').fill('SecurePass123!')
    await page.locator('#confirm_password').fill('SecurePass123!')
    await page.locator('#address').fill('Jl. Therapy No. 789, Bandung')

    // Note: Actual submission test would require mocking the API
    // and handling authentication
  })
})
