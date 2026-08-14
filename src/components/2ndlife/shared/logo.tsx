"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

/**
 * 2ndLife logo — uses the exact uploaded asset.
 * The PNG has a transparent background and works on any color.
 */
export function Logo({
  variant = "light",
  size = "md",
  showTagline = true,
  className = "",
}: LogoProps) {
  const sizes = {
    sm: { h: 28, w: 110 },
    md: { h: 36, w: 144 },
    lg: { h: 48, w: 192 },
    xl: { h: 64, w: 256 },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className="relative shrink-0"
        style={{ height: s.h, width: s.w * 0.4 }}
      >
        <Image
          src="/2ndlife-logo.png"
          alt="2ndLife — Revenue Recovery Intelligence"
          width={s.w * 0.4}
          height={s.h}
          priority
          className="object-contain"
          style={{ filter: variant === "dark" ? "invert(0)" : "none" }}
        />
      </div>
      {showTagline && (
        <div className="ml-2 hidden sm:block leading-tight">
          <div
            className={`font-extrabold tracking-tight ${
              variant === "light" ? "text-white" : "text-brand-950"
            }`}
            style={{ fontSize: size === "sm" ? 14 : size === "md" ? 16 : 18 }}
          >
            2ndLife
          </div>
          <div
            className={`uppercase tracking-[0.2em] font-medium ${
              variant === "light" ? "text-brand-200/70" : "text-muted-foreground"
            }`}
            style={{ fontSize: 8 }}
          >
            Revenue Recovery
          </div>
        </div>
      )}
    </div>
  );
}
