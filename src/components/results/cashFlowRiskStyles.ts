import type { CashFlowRiskLevel } from "../../types/finance";

/**
 * Same mint/mandarin/critical traffic light as statusStyles.ts, kept in a
 * separate file since CashFlowRiskLevel and ReadinessStatus are different
 * domains (monthly cash-flow risk vs. overall buy-readiness) even though
 * they share the same 3-step color language and never-color-alone rule.
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
