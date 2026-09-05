import type { CashFlowRiskLevel } from "../../types/finance";

/**
 * Same mint/mandarin/critical traffic light as statusStyles.ts. This status
 * now appears in exactly ONE place — the small dot-tag on the "Remaining
 * monthly income" row (see CushionTag in BuyVsRentComparison.tsx) — not
 * duplicated as a separate header badge, so there's no risk of it reading
 * as a second, competing verdict next to BudgetZoneBar's Safe/Stretch/Risk
 * colors elsewhere on the page.
 */
export const CASH_FLOW_RISK_STYLES: Record<
  CashFlowRiskLevel,
  { text: string; bg: string; border: string; icon: string }
> = {
  comfortable: {
    text: "text-brand-mint",
    bg: "bg-brand-mint",
    border: "border-brand-mint",
    icon: "✓",
  },
  moderate: {
    text: "text-brand-mandarin",
    bg: "bg-brand-mandarin",
    border: "border-brand-mandarin",
    icon: "⚠",
  },
  "high-risk": {
    text: "text-brand-critical",
    bg: "bg-brand-critical",
    border: "border-brand-critical",
    icon: "✕",
  },
};
