import type { QuestionnaireAnswers } from "../types/finance";

/** Reasonable starting values so sliders don't all open at zero. */
export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  // Income
  monthlyIncome: 35_000,
  bonusAnnual: 0,

  // Debt
  homeLoanMonthly: 0,
  otherDebtMonthly: 3_000,

  // Expenses
  monthlyLivingExpenses: 12_000,
  annualLumpSumExpenses: 20_000,
  isRenting: true,
  monthlyRent: 8_000,

  // Savings & cash on hand
  totalSavings: 150_000,
  availableDownPayment: 100_000,
  maxComfortableInstallment: 12_000,

  // About you
  applicantAge: 32,
  employmentType: "salaried",

  // Home goals
  targetHomePrice: 3_000_000,
  targetTimelineMonths: 24,
  homePurchasePurpose: "live-in",
  // Market-based default, not user-adjustable in the main flow — see
  // StepHomeGoals' appreciation remark.
  expectedAppreciationPct: 0.03,
};
