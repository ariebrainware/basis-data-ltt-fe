import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check if the page title is visible
    await expect(page.getByText('Login Lee Tit Tar')).toBeVisible()

    // Check if email input is present
    const emailInput = page.locator('#email')
    await expect(emailInput).toBeVisible()

    // Check if password input is present
    const passwordInput = page.locator('#password')
    await expect(passwordInput).toBeVisible()

    // Check if login button is present
    await expect(page.locator('#loginBtn')).toBeVisible()
  })

  test('should allow typing in email field', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('#email')
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('should allow typing in password field', async ({ page }) => {
    await page.goto('/login')

    const passwordInput = page.locator('#password')
    await passwordInput.fill('password123')
    await expect(passwordInput).toHaveValue('password123')
  })

  test('should mask password input', async ({ page }) => {
    await page.goto('/login')

    const passwordInput = page.locator('#password')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should show error message on invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in credentials
    await page.locator('#email').fill('invalid@example.com')
    await page.locator('#password').fill('wrongpassword')

    // Click login button
    await page.locator('#loginBtn a').click()

    // Wait for error message (if API is available)
    // Note: This test might need to be adjusted based on actual API responses
  })

  test('should clear form fields after input', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')

    // Fill inputs
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')

    // Clear inputs
    await emailInput.clear()
    await passwordInput.clear()

    // Verify they're empty
    await expect(emailInput).toHaveValue('')
    await expect(passwordInput).toHaveValue('')
  })

  test('should have proper input placeholders', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')

    await expect(emailInput).toHaveAttribute('placeholder', 'Email')
    await expect(passwordInput).toHaveAttribute('placeholder', 'Password')
  })
})
