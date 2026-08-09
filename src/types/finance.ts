/** Employment category — replaces the old credit-profile checkboxes with a
 *  single classification. Informational only: like the credit flags before
 *  it, it does not feed into any calculation. */
export type EmploymentType = "salaried" | "business-owner";

/** Why the user is buying — informational only, does not feed into any
 *  calculation. */
export type HomePurchasePurpose = "live-in" | "investment";

/** Raw answers collected from the questionnaire. Kept flat (not nested into
 *  sub-objects) so the shallow-merge `onUpdate` patch mechanism in App.tsx
 *  keeps working without special-casing. */
export interface QuestionnaireAnswers {
  // Income
  /** Merged "Monthly Salary + Other Monthly Income" — take-home pay plus any
   *  other steady monthly income, counted at full weight (unlike bonus,
   *  which is discounted — see variableIncomeWeight). */
  monthlyIncome: number;
  bonusAnnual: number;

  // Debt (existing, pre-purchase obligations)
  homeLoanMonthly: number;
  /** Merged "Car Loan + Other Loans" — car loan, credit cards, personal
   *  loans, and any other fixed monthly payment. */
  otherDebtMonthly: number;

  // Expenses
  monthlyLivingExpenses: number;
  annualLumpSumExpenses: number;
  isRenting: boolean;
  monthlyRent: number;

  // Savings & cash on hand
  totalSavings: number;
  availableDownPayment: number;
  maxComfortableInstallment: number;

  // About you
  applicantAge: number;
  employmentType: EmploymentType;

  // Home goals
  targetHomePrice: number;
  targetTimelineMonths: number;
  homePurchasePurpose: HomePurchasePurpose;
  /** Annual appreciation, as a fraction (0.03 = 3%). Not a form input — held
   *  at a fixed system default (see DEFAULT_ANSWERS). */
  expectedAppreciationPct: number;

  // Loan tenure is deliberately not an answer field: it's always derived
  // from applicantAge at calculation time (see calculateMaxLoanTermYears),
  // never asked for or stored.
}

/** Assumptions the bank/lender side of the model runs on. Kept separate from
 *  the user's answers so they can be tuned (or fetched from a config service)
 *  without touching calculation logic. */
export interface CalculationAssumptions {
  /** Debt Service Ratio: share of qualifying income a lender will count
   *  toward all debt obligations, including the new mortgage. Thai mortgage
   *  lenders commonly underwrite around 40%. */
  debtServiceRatio: number;
  /** Annual mortgage interest rate used to size the loan. */
  annualInterestRate: number;
  /** Minimum down payment as a fraction of home price. */
  downPaymentRate: number;
  /** Banks typically only count a portion of bonus/variable income toward
   *  the DSR ceiling, since it isn't guaranteed like salary. */
  variableIncomeWeight: number;
  /** Estimated transfer + mortgage-registration fees, as a fraction of home
   *  price. A fixed policy assumption (not a form question) surfaced only via
   *  the assumptions footnote. */
  transactionCostRate: number;
  /** Loan tenure is always auto-calculated as this minus the applicant's
   *  current age (see calculateMaxLoanTermYears) — the standard bank rule of
   *  thumb that age + tenure must not exceed this at loan maturity. */
  maxAgeAtLoanMaturity: number;
  minLoanTermYears: number;
  maxLoanTermYearsCap: number;
  /** Gross rental yield used to estimate market rent from a home price for
   *  the Buy vs Rent wealth comparison. */
  rentalYieldPct: number;

  // --- Rent-to-Own (RTO) — sourced verbatim from "RTO-Payment.xlsx",
  // treated as the authoritative model for this financing path. Every value
  // below maps directly to a labeled input cell in that sheet. ---
  /** One-time contract fee due at signing, as a fraction of the target home
   *  price (RTO-Payment.xlsx: "ค่าทำสัญญา", D5 = D4*G5). Not a recurring
   *  monthly cost. */
  rtoContractFeeRate: number;
  /** Markup the RTO contract price carries over the plain home price —
   *  13% total value-add minus the 7% contract fee (RTO-Payment.xlsx:
   *  "ราคาเช่าเพื่อซื้อ", G6 = 13%-G5). */
  rtoPriceMarkupRate: number;
  /** Flat monthly RTO payment per ฿1,000,000 of RTO contract price
   *  (RTO-Payment.xlsx: "ค่าเช่ารายเดือน... ล้านละ", D7 = D6/1,000,000*G7). */
  rtoPaymentPerMillion: number;
  /** "Equivalent interest rate" RTO-Payment.xlsx uses to split each flat
   *  monthly payment into principal (counted toward the home's price) and
   *  interest, stepping up 1%/year for the contract's first 3 years
   *  (RTO-Payment.xlsx: "อัตราเทียบเท่าดอกเบี้ย", D8/D9/D10). */
  rtoYear1InterestRate: number;
  rtoYear2InterestRate: number;
  rtoYear3InterestRate: number;
}

export const DEFAULT_ASSUMPTIONS: CalculationAssumptions = {
  debtServiceRatio: 0.4,
  annualInterestRate: 0.06,
  downPaymentRate: 0.1,
  variableIncomeWeight: 0.5,
  transactionCostRate: 0.02,
  maxAgeAtLoanMaturity: 70,
  minLoanTermYears: 5,
  maxLoanTermYearsCap: 30,
  rentalYieldPct: 0.04,
  rtoContractFeeRate: 0.07,
  rtoPriceMarkupRate: 0.06,
  rtoPaymentPerMillion: 6800,
  rtoYear1InterestRate: 0.045,
  rtoYear2InterestRate: 0.055,
  rtoYear3InterestRate: 0.065,
};

export type ReadinessStatus = "ready" | "almost-ready" | "not-ready";

/** Slugs, not display text — the UI layer looks these up in the active
 *  language's translation table so calculation logic stays language-agnostic. */
export type ArchetypeKey =
  | "rent-for-now"
  | "early-preparation"
  | "emerging-buyer"
  | "near-ready"
  | "buy-now";

export interface ReadinessResult {
  status: ReadinessStatus;
  /** 0-100 composite score. */
  readinessPercent: number;
  archetype: ArchetypeKey;
  /** Breakdown so the UI/dev can explain *why* the score landed where it did. */
  subScores: {
    closingCashCoverage: number;
    budgetFit: number;
    timelineFit: number;
  };
}

/** Which ceiling actually determined the recommended installment — the bank's
 *  DSR limit, the household's own budget/disposable-income limit, or the
 *  user's self-declared comfort limit. Drives the rationale copy so the
 *  number never reads as a black box. */
export type BindingInstallmentCeiling = "dsr" | "budget" | "comfort";

/** Why `maxHomePrice` landed where it did: capped by loan capacity, capped by
 *  the minimum-equity (down payment ratio) requirement given available cash,
 *  or the user has no cash available for a down payment at all. */
export type HomePriceLimitingFactor =
  | "loan-capacity"
  | "equity-requirement"
  | "insufficient-closing-cash";

export interface PurchasingPowerResult {
  /** Bank-view ceiling: DSR-qualifying income minus existing debt. */
  affordableByDSR: number;
  /** Reality-check ceiling: gross income minus debt, living expenses, and
   *  annualized lump-sum costs (rent excluded — it's replaced by the new
   *  mortgage payment once the user owns, not stacked on top of it). */
  affordableByBudget: number;
  recommendedMonthlyInstallment: number;
  bindingInstallmentCeiling: BindingInstallmentCeiling;
  /** Loan term actually usable, after the age-based maturity cap. */
  effectiveLoanTermYears: number;
  /** Loan amount the recommended installment could support at full term —
   *  a ceiling, not necessarily the loan actually taken (see
   *  estimatedLoanAmount, which can be lower when cash/equity binds). */
  loanCapacity: number;
  /** Loan actually needed to reach maxHomePrice. May be less than
   *  loanCapacity when available cash (not loan capacity) is the binding
   *  constraint on home price. */
  estimatedLoanAmount: number;
  /** Maximum home price affordable once minimum down-payment ratio and
   *  transaction costs are correctly accounted for. A pure purchasing-power
   *  figure (see HomePriceLimitingFactor). */
  maxHomePrice: number;
  homePriceLimitingFactor: HomePriceLimitingFactor;
  safeBudget: number;
  stretchBudget: number;
  riskZoneThreshold: number;
  /** True when the target home price is above the Stretch Home Budget — the
   *  upper edge of the recommended range. This is the single source of truth
   *  for that comparison: it's measured against Stretch Budget, never the
   *  more conservative Safe/"comfortable" budget, since Stretch Budget is
   *  the actual ceiling of what's recommended. Drives both the stretch/risk
   *  suggestion triggers and the installment-rationale note. */
  isOverStretchBudget: boolean;
  /** How far the target home price sits above the Stretch Home Budget, in
   *  THB. Zero when at or under it. */
  overStretchAmount: number;
}

export type AlternativeSuggestionKey =
  | "over-risk-budget"
  | "stretch-zone"
  | "no-saving-plan"
  | "comfort-limited"
  | "low-emergency-cushion";

/** Structured, not pre-rendered text, so each language can phrase (and
 *  reorder) the interpolated amount/month count naturally. */
export interface AlternativeSuggestion {
  key: AlternativeSuggestionKey;
  amountTHB?: number;
}

export interface ActionPlanResult {
  /** Down payment + estimated transaction costs — the full cash the user
   *  needs on hand at closing, not just the down payment. */
  requiredCashAtClosing: number;
  cashGap: number;
  /** The canonical monthlySavingCapacity from resolveExpenseProfile.
   *  Surfaced here so the UI doesn't need to re-derive the expense profile
   *  itself. */
  monthlySavingCapacity: number;
  isDownPaymentReady: boolean;
  monthsToReady: number | null;
  yearsToReady: number | null;
  /** Whether the saved-for timeline beats the user's stated target timeline. */
  isOnTargetTimeline: boolean | null;
  /** How many months behind the user's stated target timeline they are.
   *  Null when on-track, ready, or no saving-rate data exists. */
  shortfallMonths: number | null;
  /** Extra monthly saving needed to hit the ORIGINAL target timeline exactly.
   *  Null under the same conditions as shortfallMonths. */
  suggestedMonthlySavingsIncrease: number | null;
  alternativeSuggestions: AlternativeSuggestion[];
}

/** Warning-only signal: a pre-housing cash-flow shortfall. Never feeds into
 *  the DSR ceiling, affordability numbers, or readiness score — see
 *  getAdvisoryNotices, which structurally can only read `answers` and
 *  `expenses`, never `assumptions`. */
export type AdvisoryNoticeKey = "negative-cash-flow";

export interface AdvisoryNotice {
  key: AdvisoryNoticeKey;
  amountTHB?: number;
}

export type CashFlowRiskLevel = "comfortable" | "moderate" | "high-risk";

/** One option (Rent, Rent-to-Own, or Buy) in the monthly cash-flow
 *  comparison. All three share the same income/living-expenses/debt — they
 *  differ only in housingPaymentMonthly (market rent, the RTO contract's
 *  flat monthly payment, or the mortgage installment for the target home),
 *  so all three are directly comparable line-for-line. */
export interface CashFlowBreakdown {
  incomeMonthly: number;
  /** Living costs (monthly living expenses + annualized lump-sum) and
   *  existing debt, split out for display — split rather than a single
   *  merged figure so the UI can show each as its own line item. */
  livingExpensesMonthly: number;
  debtMonthly: number;
  housingPaymentMonthly: number;
  /** Can go negative when obligations exceed income — the High-Risk signal
   *  itself, not an error state. */
  remainingMonthly: number;
  remainingPct: number;
  cushionStatus: CashFlowRiskLevel;
}

export interface BuyVsRentCashFlowResult {
  buy: CashFlowBreakdown;
  rent: CashFlowBreakdown;
  rentToOwn: CashFlowBreakdown;
}

/** Rent-to-Own figures, computed verbatim from RTO-Payment.xlsx's formulas —
 *  see CalculationAssumptions' rto* fields for exactly which cells each
 *  value traces back to. */
export interface RentToOwnResult {
  /** The RTO contract price — the target home price plus the RTO markup
   *  (RTO-Payment.xlsx: "ราคาเช่าเพื่อซื้อ", D6). */
  rtoPriceTHB: number;
  /** One-time fee due at contract signing — not a recurring monthly cost,
   *  so it never enters the monthly cash-flow comparison
   *  (RTO-Payment.xlsx: "ค่าทำสัญญา", D5). */
  contractFeeTHB: number;
  /** Flat monthly payment for the contract's first year — the figure shown
   *  as this scenario's "housing payment" (RTO-Payment.xlsx: "ค่าเช่ารายเดือน", D7). */
  monthlyPaymentTHB: number;
  /** How much of the RTO price has been paid down (net of the imputed
   *  interest portion each month) after 3 years of payments — the "path
   *  toward ownership" figure. Reproduces RTO-Payment.xlsx's month-1-to-36
   *  amortization schedule exactly (the sheet's own natural first
   *  milestone, marked "After 3 Year" there); the sheet does not define a
   *  consistent rule past that point, so this app does not extrapolate
   *  beyond it. */
  paidTowardPriceAfter3YearsTHB: number;
}

export interface WealthComparisonYear {
  year: number;
  homeValue: number;
  loanBalance: number;
  /** Home value minus remaining loan balance — the buyer's housing asset
   *  value. There is no equivalent field for the rent scenario: renting
   *  accumulates no property equity, full stop, so its housing asset value
   *  is definitionally 0 rather than a modeled quantity. Deliberately NOT
   *  called "net wealth" — this is housing-asset value only, not a
   *  household's total net worth (which would also need to account for
   *  what a renter does with the cash they didn't put toward a home). */
  homeEquity: number;
  totalMortgagePaid: number;
  totalRentPaid: number;
}

export interface WealthComparisonResult {
  years: WealthComparisonYear[];
  estimatedMonthlyRent: number;
  installmentForTargetHome: number;
  loanForTargetHome: number;
  /** Same appreciation-compounding math as each `years` entry's homeValue,
   *  but rooted at the SUGGESTED affordable home price
   *  (PurchasingPowerResult.maxHomePrice) rather than the user's stated
   *  target home price — powers the "10-Year Home Value" headline, which is
   *  deliberately about what the suggested budget could grow into, not the
   *  home the user said they want (see `years`' docstring for that
   *  deliberate opposite choice). */
  affordableHomeValueYear10: number;
}

export interface CalculatorResult {
  purchasingPower: PurchasingPowerResult;
  actionPlan: ActionPlanResult;
  readiness: ReadinessResult;
  advisoryNotices: AdvisoryNotice[];
  buyVsRentCashFlow: BuyVsRentCashFlowResult;
  wealthComparison: WealthComparisonResult;
  rentToOwn: RentToOwnResult;
}
