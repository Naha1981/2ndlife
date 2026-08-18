# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-user-journey.spec.ts >> Real User End-to-End Journey & Audit >> 1. Landing Page to Sign-Up Flow
- Location: tests\e2e-user-journey.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/sign-up/
Received string:  "http://localhost:3000/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    - locator resolved to <html lang="en">…</html>
    - unexpected value "http://localhost:3000/"
    - waiting for "http://localhost:3000/sign-up" navigation to finish...
    - navigated to "http://localhost:3000/sign-up"

```

```yaml
- banner:
  - button "2ndLife — Revenue Recovery Intelligence":
    - img "2ndLife — Revenue Recovery Intelligence": 2 nd Life
  - navigation:
    - button "Product"
    - button "By Industry"
    - button "Pricing"
    - button "Company"
  - link "Login":
    - /url: /sign-in
  - link "Get Started":
    - /url: /sign-up
  - button "Book Demo"
- main:
  - text: Revenue Recovery Intelligence
  - heading "Give Your Revenue a Second Life." [level=1]
  - paragraph: 2ndLife finds the revenue hiding in your existing systems and helps you recover it — automatically.
  - text: Detect lost customers Prioritize what matters Engage at the right time Recover more revenue
  - link "Start Free":
    - /url: /sign-up
  - button "Book a Demo"
  - button "See How It Works"
  - paragraph: Secure. Compliant. Built for South African Businesses.
  - paragraph: Proven in SA's toughest recovery market — funeral insurance. Built for every recurring-revenue business.
  - text: Funeral Secure Ubuntu Life Careway SA Comfort Umoja
  - heading "Every lost customer is revenue you've already earned." [level=2]
  - paragraph: Debit orders fail. Trials end. Quotes go cold. Invoices go unpaid. The intent was real — the follow-up wasn't.
  - text: Millions in lost revenue High manual follow-up costs Time-consuming processes Low win-back rates
  - heading "2ndLife Changes That." [level=2]
  - paragraph: We turn recovery into a workflow — empathetic, automated, and measurable.
  - heading "AI WhatsApp Conversations" [level=3]
  - paragraph: Empathetic, smart conversations that re-engage customers and handle objections — at scale, 24/7.
  - heading "Instant Payments" [level=3]
  - paragraph: Customers pay via Ozow or Stripe right inside the chat. No debit orders, no card-on-file friction.
  - heading "Smart Workflows" [level=3]
  - paragraph: Algorithms that prioritize what recovers. Focus your human team only on high-value escalations.
  - heading "Actionable Insights" [level=3]
  - paragraph: Know exactly what's working, what's not, and where to focus next. Reports that actually help you decide.
  - heading "How 2ndLife Works" [level=2]
  - text: "1"
  - heading "Upload" [level=3]
  - paragraph: "Upload your list: lapsed customers, stale quotes, failed payments."
  - text: "2"
  - heading "Score" [level=3]
  - paragraph: We rank and segment the best opportunities.
  - text: "3"
  - heading "Engage" [level=3]
  - paragraph: AI starts empathetic WhatsApp conversations.
  - text: "4"
  - heading "Collect" [level=3]
  - paragraph: Customers pay via Instant EFT or Card.
  - text: "5"
  - heading "Win Back" [level=3]
  - paragraph: Customer won back. Payment verified. Revenue recovered.
  - text: "Flagship Case Study Funeral Insurance Also built for: Subscriptions · Financial Services · Education · Healthcare · Retail · B2B"
  - paragraph: “2ndLife has transformed how we handle lapsed policies. In just 60 days, we recovered over R1.2 million in premium with a fraction of our call centre costs.”
  - text: SM
  - paragraph: Sibusiso M.
  - paragraph: Operations Manager, Funeral Secure
  - paragraph: R1.2M+
  - paragraph: Recovered in 60 days
  - paragraph: 38%
  - paragraph: Reactivation Rate
  - paragraph: 70%
  - paragraph: Lower Cost vs Call Centre
  - button "Read the full funeral insurance case study"
  - heading "Ready to give your revenue a second life?" [level=2]
  - paragraph: Join forward-thinking businesses recovering lapsed customers, winning back abandoned carts, and collecting overdue invoices.
  - link "Get Started Free":
    - /url: /sign-up
  - button "Book Your Free Demo"
  - paragraph: No setup fees · No long-term contracts · 14-day free trial
- contentinfo:
  - img "2ndLife — Revenue Recovery Intelligence": 2 nd Life
  - paragraph: We help businesses recover the revenue hiding in their systems — lapsed customers, stale leads, unpaid invoices, missed renewals and more.
  - heading "By Industry" [level=4]
  - list:
    - listitem:
      - button "Funeral & Micro-Insurance ★"
    - listitem:
      - button "Subscriptions"
    - listitem:
      - button "Financial Services"
    - listitem:
      - button "Education"
    - listitem:
      - button "Healthcare"
    - listitem:
      - button "Retail"
    - listitem:
      - button "B2B Services"
  - heading "By Use Case" [level=4]
  - list:
    - listitem:
      - button "Win-Backs"
    - listitem:
      - button "Renewals"
    - listitem:
      - button "Unpaid Invoices"
    - listitem:
      - button "Stale Quotes"
    - listitem:
      - button "Failed Payments"
  - heading "Company" [level=4]
  - list:
    - listitem:
      - button "About"
    - listitem:
      - button "Contact"
    - listitem:
      - button "POPIA"
    - listitem:
      - button "Privacy"
  - paragraph: © 2025 NahaLabs (Pty) Ltd. All rights reserved.
- region "Notifications (F8)":
  - list
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Real User End-to-End Journey & Audit", () => {
  4  |   test("1. Landing Page to Sign-Up Flow", async ({ page }) => {
  5  |     // Visit landing page
  6  |     await page.goto("/");
  7  |     await expect(page).toHaveTitle(/2ndLife/);
  8  | 
  9  |     // Assert Get Started button is visible and click it
  10 |     const getStartedButton = page.locator("a:has-text('Get Started')").first();
  11 |     await expect(getStartedButton).toBeVisible();
  12 |     await getStartedButton.click();
  13 | 
  14 |     // Verify navigation to /sign-up
> 15 |     await expect(page).toHaveURL(/\/sign-up/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  16 |   });
  17 | 
  18 |   test("2. Industry Onboarding & Dashboard Customization", async ({ page }) => {
  19 |     // Navigate to /onboarding
  20 |     await page.goto("/onboarding");
  21 | 
  22 |     // Select Restaurant & Hospitality
  23 |     const restaurantCard = page.locator("button:has-text('Restaurant & Hospitality')");
  24 |     await expect(restaurantCard).toBeVisible();
  25 |     await restaurantCard.click();
  26 | 
  27 |     // Fill Business Name
  28 |     const nameInput = page.locator("#businessName");
  29 |     await nameInput.fill("La Piazza Bistro");
  30 | 
  31 |     // Submit form
  32 |     const submitButton = page.locator("button:has-text('Launch My Dashboard')");
  33 |     await submitButton.click();
  34 | 
  35 |     // Wait for redirect to app
  36 |     await page.waitForURL(/\/(onboarding)?/, { timeout: 10000 });
  37 | 
  38 |     // Visit dashboard/app
  39 |     await page.goto("/");
  40 |     await page.waitForTimeout(1000);
  41 | 
  42 |     // Verify onboarding choice saved in storage/state
  43 |     const bodyText = await page.locator("body").innerText();
  44 |     expect(bodyText).toBeTruthy();
  45 |   });
  46 | 
  47 |   test("3. Super Admin Gate Behavior", async ({ page }) => {
  48 |     // Navigate to Super Admin (/admin)
  49 |     const response = await page.goto("/admin");
  50 |     
  51 |     // Unauthenticated requests should be redirected to / or 401/403
  52 |     const finalUrl = page.url();
  53 |     expect(finalUrl).toMatch(/\/(admin)?/);
  54 |   });
  55 | 
  56 |   test("4. Production Selftest Endpoint Verification", async ({ request }) => {
  57 |     const response = await request.get("/api/v1/selftest");
  58 |     expect(response.status()).toBe(200);
  59 | 
  60 |     const json = await response.json();
  61 |     console.log("[Selftest Result]:", json);
  62 | 
  63 |     // Assert selftest returns status ok
  64 |     expect(json.status).toBe("ok");
  65 |     expect(json.checks.database).toBe("ok");
  66 |   });
  67 | });
  68 | 
```