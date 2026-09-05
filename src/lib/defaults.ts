import type { QuestionnaireAnswers } from "../types/finance";

/** Reasonable starting values so sliders don't all open at zero. */
export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  // Income
  primaryIncomeMonthly: 35_000,
  additionalIncomeMonthly: 0,
  coBorrowerIncomeMonthly: 0,
  bonusAnnual: 0,

  // Debt
  homeLoanMonthly: 0,
  otherDebtMonthly: 3_000,
  coBorrowerDebtMonthly: 0,

  // Expenses
  monthlyLivingExpenses: 12_000,
  annualLumpSumExpenses: 20_000,
  isRenting: true,
  monthlyRent: 8_000,

  // Savings & cash on hand
  totalSavings: 150_000,
  availableDownPayment: 100_000,
  // No longer a form input — see the field's docstring in types/finance.ts.
  maxComfortableInstallment: 0,

  // About you
  applicantAge: 32,
  employmentType: "permanent",

  // Home goals
  // No longer a form input — ResultsDashboard overrides this with the
  // user's live-adjustable Target Home Price. This starting value only
  // matters before that first override happens.
  targetHomePrice: 3_000_000,
  targetTimelineMonths: 24,
  homePurchasePurpose: "live-in",
  // Market-based "capital growth" default, not user-adjustable in the main
  // flow — see StepHomeGoals' appreciation remark.
  expectedAppreciationPct: 0.04,
};
