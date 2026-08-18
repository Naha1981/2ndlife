"use client";

import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/2ndlife/shared/logo";
import Link from "next/link";

export default function SignInPage() {
  const isClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen bg-[#052e22] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-8 z-10 flex flex-col items-center">
        <Link href="/">
          <Logo variant="light" height={44} />
        </Link>
        <p className="text-xs text-emerald-300/80 mt-2 font-medium tracking-wide">
          Revenue Recovery Intelligence Login
        </p>
      </div>

      <div className="z-10 w-full max-w-md">
        {isClerk ? (
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-slate-900/95 border border-slate-800 shadow-2xl text-white",
                  headerTitle: "text-white font-bold",
                  headerSubtitle: "text-slate-400",
                  socialButtonsBlockButton: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
                  formFieldLabel: "text-slate-300",
                  formFieldInput: "bg-slate-950 border-slate-700 text-white",
                  formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold",
                  footerActionText: "text-slate-400",
                  footerActionLink: "text-emerald-400 hover:text-emerald-300 font-semibold",
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/onboarding"
            />
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-sm">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Direct Access (Demo Mode)</h2>
              <p className="text-xs text-slate-400">
                Clerk auth is in sandbox demo mode. Click below to continue directly to your dashboard.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-900/20"
            >
              Enter Dashboard →
            </Link>
            <div className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-emerald-400 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 z-10 text-center text-xs text-emerald-200/50">
        © 2025 2ndLife by NahaLabs · POPIA Compliant
      </div>
    </div>
  );
}
