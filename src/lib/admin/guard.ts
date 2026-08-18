import { auth, currentUser } from '@clerk/nextjs/server';

export async function requireSuperAdmin(): Promise<string> {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminUserId = process.env.SUPER_ADMIN_USER_ID;

  // In local development if no admin keys or clerk keys are set, allow dev access
  if (!process.env.CLERK_SECRET_KEY && !adminEmail && !adminUserId && process.env.NODE_ENV === 'development') {
    return 'dev-admin';
  }

  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj?.userId ?? null;
  } catch {
    userId = null;
  }

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Check by user ID
  if (adminUserId && userId === adminUserId) {
    return userId;
  }

  // Fallback: check via Clerk user email
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (adminEmail && email && email.toLowerCase() === adminEmail.toLowerCase()) {
      return userId;
    }
  } catch {
    // Ignore currentUser fetch error
  }

  throw new Error('Forbidden: not super admin');
}
