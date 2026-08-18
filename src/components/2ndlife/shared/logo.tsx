"use client";

import { useRouter } from "next/navigation";

/**
 * 2ndLife Logo — inline SVG (transparent background, scales losslessly).
 * The circular arrow mark is always brand green (#16a34a).
 * The wordmark + tagline use `currentColor`, so the parent's `color` CSS
 * controls them: white on dark green headers, dark green on light backgrounds.
 *
 * One logo. No separate text block beside it. The SVG IS the brand.
 * Double-clicking any logo navigates to the Super Admin console (/admin).
 */

interface LogoProps {
  variant?: "light" | "dark";
  height?: number;
  className?: string;
  showTagline?: boolean;
  onDoubleClick?: () => void;
}

export function Logo({
  variant = "light",
  height = 40,
  className = "",
  showTagline = true,
  onDoubleClick,
}: LogoProps) {
  const router = useRouter();
  const color = variant === "light" ? "#ffffff" : "#052e22";
  // viewBox is 720×220, so width = height × (720/220) ≈ height × 3.27
  const width = Math.round(height * 3.27);
  // Tagline is unreadable below 56px — render wordmark only at smaller sizes
  const showTaglineResolved = showTagline && height >= 56;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick();
    } else {
      router.push("/admin");
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 220"
      role="img"
      aria-label="2ndLife — Revenue Recovery Intelligence"
      width={width}
      height={height}
      style={{ color, display: "block" }}
      className={`cursor-pointer select-none ${className}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Circular recovery arrow — always brand green */}
      <g>
        <circle
          cx="110"
          cy="105"
          r="78"
          fill="none"
          stroke="#16a34a"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="402 88"
          transform="rotate(-52 110 105)"
        />
        <path d="M148 12 L192 30 L150 52 Z" fill="#16a34a" />
      </g>
      {/* Wordmark — inherits currentColor */}
      <g fill="currentColor" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" fontWeight="800">
        <text x="70" y="128" fontSize="76">2</text>
        <text x="116" y="128" fontSize="46">nd</text>
        <text x="205" y="128" fontSize="76">Life</text>
      </g>
      {/* Tagline — only at height >= 56px to avoid unreadable thin line */}
      {showTaglineResolved && (
        <text
          x="208"
          y="163"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="15"
          letterSpacing="3.2"
          fill="currentColor"
          opacity="0.72"
        >
          REVENUE RECOVERY INTELLIGENCE
        </text>
      )}
    </svg>
  );
}
