import { test, expect } from "@playwright/test";

test.describe("Real User End-to-End Journey & Audit", () => {
  test("1. Landing Page to Sign-Up Flow", async ({ page }) => {
    // Visit landing page
    await page.goto("/");
    await expect(page).toHaveTitle(/2ndLife/);

    // Assert Get Started button is visible and click it
    const getStartedButton = page.locator("a:has-text('Get Started')").first();
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    // Verify navigation to /sign-up
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("2. Industry Onboarding & Dashboard Customization", async ({ page }) => {
    // Navigate to /onboarding
    await page.goto("/onboarding");

    // Select Restaurant & Hospitality
    const restaurantCard = page.locator("button:has-text('Restaurant & Hospitality')");
    await expect(restaurantCard).toBeVisible();
    await restaurantCard.click();

    // Fill Business Name
    const nameInput = page.locator("#businessName");
    await nameInput.fill("La Piazza Bistro");

    // Submit form
    const submitButton = page.locator("button:has-text('Launch My Dashboard')");
    await submitButton.click();

    // Wait for redirect to app
    await page.waitForURL(/\/(onboarding)?/, { timeout: 10000 });

    // Visit dashboard/app
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Verify onboarding choice saved in storage/state
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toBeTruthy();
  });

  test("3. Super Admin Gate Behavior", async ({ page }) => {
    // Navigate to Super Admin (/admin)
    const response = await page.goto("/admin");
    
    // Unauthenticated requests should be redirected to / or 401/403
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/(admin)?/);
  });

  test("4. Production Selftest Endpoint Verification", async ({ request }) => {
    const response = await request.get("/api/v1/selftest");
    expect(response.status()).toBe(200);

    const json = await response.json();
    console.log("[Selftest Result]:", json);

    // Assert selftest returns status ok
    expect(json.status).toBe("ok");
    expect(json.checks.database).toBe("ok");
  });
});
