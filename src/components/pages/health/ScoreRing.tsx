import type { ReactNode } from "react";
import type { AdminHealthLevel } from "@/data/profileHealth";

const LEVEL_STROKE: Record<AdminHealthLevel, string> = {
  excellent: "stroke-emerald-500",
  good: "stroke-lime-500",
  fair: "stroke-amber-500",
  low: "stroke-red-500",
};

interface ScoreRingProps {
  percent: number;
  size: number;
  strokeWidth: number;
  level?: AdminHealthLevel;
  className?: string;
  children?: ReactNode;
}

/** Cercle rempli à `percent` % (entièrement plein à 100 %), contenu centré */
export function ScoreRing({ percent, size, strokeWidth, level, className = "", children }: ScoreRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score du compte : ${clamped} %`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth} className="stroke-muted"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeLinecap={clamped > 0 && clamped < 100 ? "round" : "butt"}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${level ? LEVEL_STROKE[level] : "stroke-primary"} transition-[stroke-dashoffset] duration-500`}
        />
      </svg>
      {children}
    </div>
  );
}