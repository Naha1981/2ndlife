import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "2ndLife — Revenue Recovery Intelligence",
  description:
    "2ndLife finds the revenue hiding in your existing systems — inactive, stale, abandoned, unpaid or at-risk — and recovers it through intelligent, empathetic WhatsApp-first workflows. Give your revenue a second life.",
  keywords: [
    "2ndLife",
    "Revenue Recovery",
    "WhatsApp AI",
    "Ozow Instant EFT",
    "South African SaaS",
    "Lapsed policy recovery",
    "NahaLabs",
  ],
  authors: [{ name: "NahaLabs (Pty) Ltd" }],
  icons: {
    icon: "/2ndlife-logo.png",
  },
  openGraph: {
    title: "2ndLife — Revenue Recovery Intelligence",
    description:
      "Give your revenue a second life. AI-powered WhatsApp recovery for South African businesses.",
    siteName: "2ndLife",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2ndLife — Revenue Recovery Intelligence",
    description:
      "Give your revenue a second life. AI-powered WhatsApp recovery for South African businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

