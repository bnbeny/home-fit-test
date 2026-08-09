import type { ReadinessStatus } from "../../types/finance";

/**
 * Status is a fixed, reserved scale (good/warning/critical) — never reused
 * for anything else, and always paired with an icon + label so meaning never
 * rides on color alone (colorblind-safe by construction).
 */
export const STATUS_STYLES: Record<
  ReadinessStatus,
  { text: string; bg: string; border: string; icon: string }
> = {
  ready: {
    text: "text-brand-mint",
    bg: "bg-brand-mint",
    border: "border-brand-mint",
    icon: "✓",
  },
  "almost-ready": {
    text: "text-brand-mandarin",
    bg: "bg-brand-mandarin",
    border: "border-brand-mandarin",
    icon: "⚠",
  },
  "not-ready": {
    text: "text-brand-critical",
    bg: "bg-brand-critical",
    border: "border-brand-critical",
    icon: "✕",
  },
};
