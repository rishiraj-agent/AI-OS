import { cn } from "@/lib/cn";

export function HelixMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("text-accent", className)} aria-hidden>
      <path
        d="M24 4 42 14.5v19L24 44 6 33.5v-19L24 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 18c6 8 10 8 16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <path
        d="M16 30c6-8 10-8 16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}
