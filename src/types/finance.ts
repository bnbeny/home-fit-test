/** Employment category — replaces the old credit-profile checkboxes with a
 *  single classification. Informational only: like the credit flags before
 *  it, it does not feed into any calculation. */
export type EmploymentType =
  | "government-state-enterprise"
  | "permanent"
  | "contract-temporary"
  | "business-owner"
  | "self-employed-freelancer"
  | "gig-commission"
  | "unemployed";

/** Why the user is buying — informational only, does not feed into any
 *  calculation. */
export type HomePurchasePurpose = "live-in" | "investment";

/** Raw answers collected from the questionnaire. Kept flat (not nested into
 *  sub-objects) so the shallow-merge `onUpdate` patch mechanism in App.tsx
 *  keeps working without special-casing. */
export interface QuestionnaireAnswers {
  // Income — both stored canonically as monthly THB. The Monthly/Annual
  // entry toggle in StepIncome is a display-only concern that converts on
  // input; nothing downstream ever sees an annual figure for these two.
  /** Take-home pay from the applicant's main job. */
  primaryIncomeMonthly: number;
  /** Other steady monthly income of the applicant's own — side income,
   *  freelance work, rental income. Counted at full weight, like
   *  primaryIncomeMonthly (unlike bonus, which is discounted — see
   *  variableIncomeWeight). Deliberately does NOT cover a co-borrower's
   *  income — see coBorrowerIncomeMonthly for that. */
  additionalIncomeMonthly: number;
  /** A co-borrower's regular monthly income (optional) — kept as its own
   *  field, not folded into additionalIncomeMonthly, so the household-income
   *  total and its symmetric debt counterpart (coBorrowerDebtMonthly) stay
   *  paired and auditable. Counted at full weight, exactly like
   *  primaryIncomeMonthly/additionalIncomeMonthly: it's genuinely regular
   *  income, just earned by a different household member — there's no
   *  reason for variableIncomeWeight's "not guaranteed" discount (which
   *  exists only for bonus) to apply here. */
  coBorrowerIncomeMonthly: number;
  bonusAnnual: number;

  // Debt (existing, pre-purchase obligations)
  homeLoanMonthly: number;
  /** Merged "Car Loan + Other Loans" — car loan, credit cards, personal
   *  loans, and any other fixed monthly payment. */
  otherDebtMonthly: number;
  /** A co-borrower's own existing debt obligations (optional) — combined
   *  with the applicant's own debt (homeLoanMonthly + otherDebtMonthly) into
   *  totalMonthlyDebt, symmetrically with how coBorrowerIncomeMonthly joins
   *  steadyMonthlyIncome. Without this, counting a co-borrower's income but
   *  not their debt would systematically overstate affordability whenever a
   *  co-borrower is involved. */
  coBorrowerDebtMonthly: number;

  // Expenses — monthlyLivingExpenses is deliberately ONE household-level
  // field rather than split per person, unlike income/debt above: unlike a
  // salary or a loan payment, day-to-day living costs are rarely cleanly
  // attributable to one person in a shared household, so a helper text asks
  // the user to enter the combined household figure instead (see
  // en.ts/th.ts expenses.livingExpensesHelp).
  monthlyLivingExpenses: number;
  annualLumpSumExpenses: number;
  isRenting: boolean;
  monthlyRent: number;

  // Savings & cash on hand
  totalSavings: number;
  availableDownPayment: number;
  /** No longer a form input — the form always writes 0 here (see
   *  DEFAULT_ANSWERS), which the `> 0` guard in calculateInstallmentCeilings
   *  already treats as "no comfort cap." Kept as a field rather than deleted
   *  so that ceiling logic doesn't need a separate code path. */
  maxComfortableInstallment: number;

  // About you — both informational only, like HomePurchasePurpose: neither
  // feeds any calculation (loan tenure is now a flat BUY_LOAN_TENURE_YEARS,
  // not age-derived).
  applicantAge: number;
  employmentType: EmploymentType;

  // Home goals
  /** No longer collected in the form — the questionnaire computes a
   *  Recommended Home Price automatically, and the user instead adjusts
   *  "Your Target Home Price" live on the results page (see
   *  ResultsDashboard, which owns this value going forward and merges it in
   *  before every calculation). */
  targetHomePrice: number;
  targetTimelineMonths: number;
  homePurchasePurpose: HomePurchasePurpose;
  /** Annual appreciation, as a fraction (0.04 = 4%, the "capital growth"
   *  assumption). Not a form input — held at a fixed system default (see
   *  DEFAULT_ANSWERS). */
  expectedAppreciationPct: number;

  // Loan tenure is deliberately not an answer field: every Buy calculation
  // uses a flat BUY_LOAN_TENURE_YEARS (see lib/calculations.ts), never asked
  // for or derived from age.
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
  /** Gross rental yield used to estimate market rent from a home price for
   *  the Buy vs Rent wealth comparison. */
  rentalYieldPct: number;
  /** Comfortable ceiling = this share of computed home budget (maxHomePrice). */
  safeBudgetMultiplier: number;
  /** Stretch ceiling as a multiple of computed home budget — 1.0 means
   *  exactly at computed capacity. */
  stretchBudgetMultiplier: number;
  /** Above this multiple of computed home budget, a target price is flagged
   *  as meaningfully over budget. */
  riskZoneMultiplier: number;

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
  rentalYieldPct: 0.04,
  safeBudgetMultiplier: 0.85,
  stretchBudgetMultiplier: 1.0,
  riskZoneMultiplier: 1.06,
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
    downPaymentCoverage: number;
    budgetFit: number;
    timelineFit: number;
  };
}

/** Which ceiling actually determined the recommended installment — the bank's
 *  DSR limit, the household's own budget/disposable-income limit, or the
 *  user's self-declared comfort limit. Drives the rationale copy so the
 *  number never reads as a black box. */
export type BindingInstallmentCeiling = "dsr" | "budget" | "comfort";

export interface PurchasingPowerResult {
  /** Bank-view ceiling: DSR-qualifying income minus existing debt. */
  affordableByDSR: number;
  /** Reality-check ceiling: gross income minus debt, living expenses, and
   *  annualized lump-sum costs (rent excluded — it's replaced by the new
   *  mortgage payment once the user owns, not stacked on top of it). */
  affordableByBudget: number;
  recommendedMonthlyInstallment: number;
  bindingInstallmentCeiling: BindingInstallmentCeiling;
  /** Always BUY_LOAN_TENURE_YEARS (30) — kept on the result (rather than
   *  inlined as a UI constant) so the "Based on a 30-year loan tenure" note
   *  has a single source of truth. */
  effectiveLoanTermYears: number;
  /** Loan amount the recommended installment could support at full term —
   *  the loan side of maxHomePrice's construction (see maxHomePrice: at
   *  that price, the loan needed assuming the minimum down payment is
   *  exactly loanCapacity, by construction). Not necessarily the loan
   *  actually taken — see estimatedLoanAmount, which uses real cash. */
  loanCapacity: number;
  /** Loan needed at maxHomePrice using the household's ACTUAL available
   *  down payment (answers.availableDownPayment) — NOT the minimum down
   *  payment assumed by maxHomePrice's own construction. Can exceed
   *  loanCapacity when available cash is less than maxHomePrice's implied
   *  minimum (maxHomePrice * downPaymentRate) — that's not a bug, it's the
   *  same cash-shortfall signal ActionPlanResult.remainingDownPayment
   *  surfaces separately; can also be below loanCapacity when available
   *  cash exceeds that minimum. Not currently displayed anywhere in the UI. */
  estimatedLoanAmount: number;
  /** The home price supported by borrowing/repayment capacity alone:
   *  loanCapacity / (1 - downPaymentRate) — the price at which a loan of
   *  exactly loanCapacity, financed at the minimum required down payment
   *  rate, would exactly cover the rest. Deliberately does NOT depend on
   *  availableDownPayment: this is an affordability ceiling ("what does my
   *  income/debt profile support"), not a "could I close on this today"
   *  figure — whether today's actual cash meets the resulting minimum down
   *  payment is a separate question, answered by
   *  ActionPlanResult.remainingDownPayment / BuyGapNarrative's Down Payment
   *  Gap, never by moving this ceiling itself. (Previously
   *  loanCapacity + availableDownPayment — deliberately changed: that
   *  formula let extra cash silently raise this ceiling, conflating
   *  affordability with cash-readiness-today, which THE GAP's Home Price
   *  Gap / Down Payment Gap split is specifically designed to keep apart.) */
  maxHomePrice: number;
  safeBudget: number;
  stretchBudget: number;
  riskZoneThreshold: number;

  /** Shortfall between the target home price and maxHomePrice itself — zero
   *  once the target is within reach. The headline number for "The Gap &
   *  The Plan": answers "does my loan-approved capacity even reach this
   *  price," not "do I have cash to close today" (that liquidity question
   *  is answered separately by ActionPlanResult.remainingDownPayment, which
   *  still exists and still feeds the Readiness Score — this field only
   *  changed what's shown in that UI section, not the underlying
   *  cash-timeline math). */
  priceGap: number;
  isPriceGapClosed: boolean;
  /** Additional monthly installment capacity that alone would close
   *  priceGap. NOT priceGap/loanFactor: since maxHomePrice =
   *  loanCapacity / (1 - downPaymentRate), each ฿1 of extra loan capacity
   *  raises maxHomePrice by 1 / (1 - downPaymentRate) — so closing priceGap
   *  needs only priceGap * (1 - downPaymentRate) of extra loan capacity.
   *  This is now the ONLY lever that closes priceGap — extra down payment
   *  cash no longer does (see maxHomePrice's own comment); there is
   *  deliberately no "additional down payment" counterpart lever anymore. */
  additionalMonthlyInstallmentNeeded: number;
  /** additionalMonthlyInstallmentNeeded + recommendedMonthlyInstallment —
   *  the total installment needed to qualify for the loan the target price
   *  requires. */
  requiredMonthlyInstallmentForTarget: number;
}

/** The only two "downsize" suggestions left — see BuyGapNarrative in
 *  lib/calculations.ts (calculateBuyGapNarrative), which is what actually
 *  produces these now, generalized to whichever home price basis the Buy
 *  vs Rent section's toggle currently shows. */
export type AlternativeSuggestionKey = "over-risk-budget" | "stretch-zone";

/** Structured, not pre-rendered text, so each language can phrase (and
 *  reorder) the interpolated amount/month count naturally. */
export interface AlternativeSuggestion {
  key: AlternativeSuggestionKey;
  amountTHB?: number;
}

export interface ActionPlanResult {
  /** targetHomePrice * downPaymentRate — the down payment alone. Deliberately
   *  excludes transaction/registration costs: those are real cash the
   *  household should prepare (see transactionCostEstimate, shown separately
   *  in The Gap & The Plan), but they don't reflect the household's own
   *  saving progress toward a down payment, so they must never dilute
   *  downPaymentCoverage or the saving-timeline math below. */
  requiredDownPayment: number;
  /** max(requiredDownPayment - availableDownPayment, 0). */
  remainingDownPayment: number;
  /** Estimated transfer + mortgage-registration fees at targetHomePrice —
   *  additional cash to prepare on top of the down payment. Kept on the
   *  result purely for display (The Gap & The Plan); never subtracted from
   *  requiredDownPayment/remainingDownPayment and never feeds
   *  downPaymentCoverage, the readiness score, or the saving-timeline
   *  fields below. */
  transactionCostEstimate: number;
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
  /** "Total monthly income" for this comparison — IncomeProfile.
   *  steadyMonthlyIncome (primary + additional monthly income only).
   *  Deliberately excludes bonus, even averaged: a household's annual
   *  bonus isn't guaranteed recurring monthly cash flow. */
  incomeMonthly: number;
  housingPaymentMonthly: number;
  /** = incomeMonthly - totalMonthlyDebt - monthlyLivingExpenses -
   *  monthlyLumpSumEquivalent - housingPaymentMonthly. Reuses the same
   *  "income minus other obligations" formula as
   *  InstallmentCeilings.affordableByBudget (see
   *  calculateBuyVsRentCashFlow), then also subtracts this option's own
   *  housing payment. Can go negative when obligations exceed income — the
   *  High-Risk signal itself, not an error state. */
  remainingMonthly: number;
  remainingPct: number;
  cushionStatus: CashFlowRiskLevel;
  /** One-time cash due to start this option: Buy's down payment + estimated
   *  transaction costs, RTO's contract fee, or 2 months' rent for Rent. */
  initialPaymentTHB: number;
  /** Total cash the household actually pays toward housing over the first
   *  10 years — a pure cost figure, deliberately NOT netted against Capital
   *  Value (see CapitalValueResult), so the two rows answer two different
   *  questions side by side: money out the door vs. equity built.
   *
   *  Buy: housingPaymentMonthly * 120, plus initialPaymentTHB (down payment
   *  + transaction costs, a real non-refundable cost distinct from the
   *  monthly payment stream — no double-count, since the installment only
   *  amortizes the financed balance net of the down payment). Assumes the
   *  monthly payment stays constant over the decade — a mortgage
   *  installment genuinely is fixed.
   *
   *  Rent-to-Own is read verbatim from RentToOwnResult.totalPaidOver10YearsTHB,
   *  NOT housingPaymentMonthly * 120 + initialPaymentTHB: RTO is a 3-year
   *  pathway to ownership, not a flat payment for all 10 years — the
   *  contract fee, 3 years of the RTO payment, and 7 years of the
   *  post-transition mortgage installment are already summed there (see
   *  RentToOwnResult).
   *
   *  Rent is different: read verbatim from
   *  WealthComparisonResult.years[9].totalRentPaid, NOT
   *  estimatedMonthlyRent * 120 — rent is modeled as growing alongside the
   *  property's own appreciation (see calculateWealthComparison), so a flat
   *  multiply would understate this by construction. initialPaymentTHB (2
   *  months' rent) is deliberately EXCLUDED from Rent's total: standard
   *  practice bundles a refundable security deposit with an advance rent
   *  payment that simply prepays a month already counted in that total, so
   *  it's never an additional cost. */
  totalPaidOver10YearsTHB: number;
}

/** Whether an option builds toward owning the property, for the "Capital
 *  Value" row of the Rent/RTO/Buy comparison. */
export interface CapitalValueResult {
  /** False only for Rent — renting accumulates no ownership stake or
   *  property value, full stop. */
  accumulates: boolean;
  /** THB estimate of the property value built, present only when
   *  accumulates is true — both on the SAME 10-year horizon. For Buy, this
   *  is WealthComparisonResult.affordableHomeValueYear10. For RTO, this is
   *  RentToOwnResult.projectedHomeValueYear10THB (the contract's own
   *  accumulation math through year 3, then ownership + appreciation
   *  through year 10 — see that field's docstring for why this isn't the
   *  same as the RTO contract's raw 3-year milestone). */
  amountTHB?: number;
}

export interface CapitalValueByScenario {
  buy: CapitalValueResult;
  rent: CapitalValueResult;
  rentToOwn: CapitalValueResult;
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
   *  milestone, marked "After 3 Year" there). Past this point the contract
   *  itself defines no further rule, which is exactly why the household
   *  transitions to an ordinary mortgage at year 3 — see
   *  remainingPrincipalAfter3YearsTHB. */
  paidTowardPriceAfter3YearsTHB: number;
  /** The mortgage principal carried into year 4 once the 3-year RTO
   *  contract ends: rtoPriceTHB minus paidTowardPriceAfter3YearsTHB. Uses
   *  rtoPriceTHB (the contractual exercise price actually agreed to), not
   *  homePriceBasis — the RTO markup is a real cost the household commits
   *  to, not one that disappears at the transition. */
  remainingPrincipalAfter3YearsTHB: number;
  /** The household's new monthly payment for years 4-10, once
   *  remainingPrincipalAfter3YearsTHB is financed as a standard mortgage —
   *  same financing assumption Buy itself uses (BUY_LOAN_TENURE_YEARS,
   *  annualInterestRate), not a second RTO-specific rate. Replaces
   *  monthlyPaymentTHB after the 3-year RTO period; the two payments are
   *  deliberately different figures for different phases, not one flat
   *  RTO payment continuing for all 10 years. */
  postTransitionMonthlyPaymentTHB: number;
  /** contractFeeTHB + 3 years of monthlyPaymentTHB + 7 years of
   *  postTransitionMonthlyPaymentTHB — the RTO pathway's real 10-year cost.
   *  Deliberately NOT monthlyPaymentTHB * 120: the original RTO rate never
   *  continues past the 3-year contract. */
  totalPaidOver10YearsTHB: number;
  /** The Year-10 Capital Value figure for RTO — always IDENTICAL to Buy's
   *  WealthComparisonResult.affordableHomeValueYear10 for the same
   *  homePriceBasis and appreciation assumption (passed in verbatim by
   *  calculateRentToOwn, not recomputed). This is a deliberate conceptual
   *  choice: a home's market value depends on the home itself, not on how
   *  it was financed, so the RTO markup (rtoPriceTHB vs. homePriceBasis) —
   *  a real acquisition cost, reflected in contractFeeTHB/monthlyPaymentTHB
   *  and the Financial Snapshot's cost rows — must never inflate the
   *  property's market value. NOT an extrapolation of the RTO contract's
   *  own month-by-month accumulation math past year 3 either (that math has
   *  no defined rule beyond RTO_PERIOD_YEARS — see
   *  paidTowardPriceAfter3YearsTHB for that separate, contract-native
   *  figure). */
  projectedHomeValueYear10THB: number;
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
  /** Cumulative rent paid through this year — NOT a flat
   *  estimatedMonthlyRent * months. Rent is modeled as growing alongside
   *  the property's own appreciation (rentalYieldPct is a constant fraction
   *  of property value, so if the property is modeled as appreciating, the
   *  rent that yield is a fraction of must rise with it too) — each year's
   *  rent is based on that year's start-of-year property value, stepped up
   *  annually. Year 1 alone equals 12 * estimatedMonthlyRent exactly. */
  totalRentPaid: number;
}

/** All fields rooted at whichever homePriceBasis calculateWealthComparison
 *  was called with — see BuyVsRentOption, which is computed twice (once for
 *  Recommended Home Price, once for the user's adjustable Target Home
 *  Price) so the Buy vs Rent section's own basis toggle can show either. */
export interface WealthComparisonResult {
  years: WealthComparisonYear[];
  estimatedMonthlyRent: number;
  installmentForTargetHome: number;
  loanForTargetHome: number;
  /** Same appreciation-compounding math as each `years` entry's homeValue,
   *  at year 10 — powers the "10-Year Home Value" headline. */
  affordableHomeValueYear10: number;
}

/** One full view of the Buy vs Rent section, computed for a single home
 *  price basis. computeCalculatorResult produces two of these —
 *  `buyVsRentByBudget` (homePriceBasis = PurchasingPowerResult.maxHomePrice,
 *  i.e. Recommended Home Price) and `buyVsRentByTarget` (homePriceBasis =
 *  QuestionnaireAnswers.targetHomePrice) — so BuyVsRentComparison's own
 *  basis toggle can let the user view the section grounded in either. */
export interface BuyVsRentOption {
  homePriceBasis: number;
  wealthComparison: WealthComparisonResult;
  rentToOwn: RentToOwnResult;
  cashFlow: BuyVsRentCashFlowResult;
  capitalValue: CapitalValueByScenario;
}

/** The three housing paths the results page lets the user narrate a
 *  Gap/Plan/Alternative story for — see GapAndPlan and
 *  calculateRtoGapPlan/calculateRentGapPlan. */
export type GapPlanScenario = "buy" | "rto" | "rent";

/** RTO's Gap & Plan lens: can the household cover the contract fee, and is
 *  the monthly RTO payment itself affordable. There's no bank-eligibility
 *  question here (unlike Buy) — RTO's "gap" is purely a cash-on-hand and
 *  cash-flow question. */
/** RTO's Gap & Plan lens. Deliberately does NOT carry its own
 *  RTO-specific "affordable home price" — Buy and RTO share ONE financial
 *  eligibility ceiling (PurchasingPowerResult.maxHomePrice, the Recommended
 *  Home Price), so the "does this price fit my finances" gap/plan pair is
 *  computed once, by calculateBuyGapNarrative, and reused for both Buy and
 *  RTO (see BuyContent/RtoContent in GapAndPlan.tsx). This result is scoped
 *  to what's genuinely RTO-specific: the contract fee (an upfront cash
 *  requirement Buy doesn't have) and the RTO monthly payment's own
 *  cash-flow cushion (RTO's payment mechanics — see calculateRentToOwn —
 *  are a fixed per-million contract rate, never run through Buy's
 *  DSR/installment math). */
export interface RtoGapPlanResult {
  /** = homePriceBasis * rtoContractFeeRate — rentToOwn.contractFeeTHB
   *  verbatim. */
  requiredRtoContractFee: number;
  /** answers.availableDownPayment verbatim — surfaced here (rather than
   *  making the UI reach into answers directly) so THE GAP can show the
   *  full "required vs. available vs. gap" relationship in one place. */
  availableDownPaymentTHB: number;
  /** max(0, requiredRtoContractFee - availableDownPayment). */
  rtoContractFeeGap: number;
  isContractFeeGapClosed: boolean;
  /** Same convention as ActionPlanResult.monthsToReady: null when the
   *  household's saving capacity is $0/mo against a real gap. */
  monthsToCloseContractFeeGap: number | null;
  hasMonthlyShortfall: boolean;
  /** abs(cashFlow.rentToOwn.remainingMonthly) when hasMonthlyShortfall,
   *  else 0. */
  monthlyShortfallTHB: number;
  /** RTO's flat monthly payment — the target the household's monthly
   *  capacity needs to reach to close monthlyShortfallTHB. Kept entirely
   *  separate from Buy's installment math: this is a fixed per-million rate
   *  on the RTO contract price (see calculateRentToOwn), not amortized over
   *  a chosen loan tenure. */
  monthlyPaymentTHB: number;
  /** Same 3-tier classification as CashFlowBreakdown.cushionStatus
   *  (comfortable/moderate/high-risk) — the Plan flags a thin-but-positive
   *  margin, not just an outright negative one. */
  cushionStatus: CashFlowRiskLevel;
  /** Signed — cashFlow.rentToOwn.remainingMonthly verbatim (negative when
   *  hasMonthlyShortfall is true). Needed alongside cushionStatus to name
   *  the actual thin-but-positive margin when the household isn't in an
   *  outright shortfall but also isn't comfortable. */
  remainingMonthlyTHB: number;
}

/** Rent's Gap & Plan lens: no bank approval and no ongoing minimum-equity
 *  requirement like Buy, but renting does have a real upfront cash
 *  requirement — the 2-month rental deposit — plus the same ongoing
 *  monthly-affordability question every option has. */
export interface RentGapPlanResult {
  hasMonthlyShortfall: boolean;
  monthlyShortfallTHB: number;
  /** 2 months' estimated rent — CashFlowBreakdown.initialPaymentTHB for Rent
   *  verbatim (the same figure the comparison grid's "Initial payment" row
   *  already shows). Treated as a one-time upfront cash requirement, not a
   *  recurring monthly cost: never added to housingPaymentMonthly or folded
   *  into monthlyShortfallTHB above. */
  requiredRentalDeposit: number;
  /** max(0, requiredRentalDeposit - answers.totalSavings). totalSavings
   *  (not availableDownPayment, which is earmarked specifically for a home
   *  purchase) is the right pool to check here — Rent needs no down
   *  payment, so all of the household's savings are available for the
   *  deposit. */
  rentalDepositGap: number;
  isRentalDepositReady: boolean;
  /** Same convention as ActionPlanResult.monthsToReady: null when the
   *  household's saving capacity is $0/mo against a real gap. */
  monthsToCloseRentalDepositGap: number | null;
}

export interface CalculatorResult {
  purchasingPower: PurchasingPowerResult;
  actionPlan: ActionPlanResult;
  readiness: ReadinessResult;
  advisoryNotices: AdvisoryNotice[];
  buyVsRentByBudget: BuyVsRentOption;
  buyVsRentByTarget: BuyVsRentOption;
  /** Computed for both bases, like buyVsRentByBudget/ByTarget, so Gap &
   *  Plan's RTO/Rent tabs can follow the Buy vs Rent section's own basis
   *  toggle (see GapAndPlan.tsx and BuyVsRentComparison.tsx). Buy's own gap
   *  narrative doesn't need this treatment — see calculateBuyGapNarrative,
   *  which recomputes it for any basis on the fly from purchasingPower
   *  alone. */
  rtoGapPlanByBudget: RtoGapPlanResult;
  rtoGapPlanByTarget: RtoGapPlanResult;
  rentGapPlanByBudget: RentGapPlanResult;
  rentGapPlanByTarget: RentGapPlanResult;
}
