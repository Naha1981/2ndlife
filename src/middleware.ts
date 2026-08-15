import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * 2ndLife Revenue OS — Clerk Middleware
 *
 * CRITICAL: When CLERK_SECRET_KEY is absent, this middleware is a no-op (demo mode).
 * The build MUST pass with zero environment variables.
 *
 * When Clerk is configured:
 * - Protects /app/* routes (dashboard, customers, campaigns, etc.)
 * - Leaves /api/webhooks/* and /api/v1/selftest public
 * - Leaves marketing pages public
 */

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/customers(.*)",
  "/imports(.*)",
  "/campaigns(.*)",
  "/conversations(.*)",
  "/payments(.*)",
  "/reports(.*)",
  "/integrations(.*)",
  "/settings(.*)",
  "/demand-radar(.*)",
]);

// Check if Clerk is configured (runtime check, not module-load)
function isClerkConfigured(): boolean {
  return !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export default clerkMiddleware((auth, req) => {
  // Demo mode: if Clerk is not configured, middleware is a no-op
  if (!isClerkConfigured()) {
    return;
  }

  // Protect app routes when Clerk is configured
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|pdf)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
