import {
  type ActionPlanResult,
  type AdvisoryNotice,
  type AlternativeSuggestion,
  type ArchetypeKey,
  type BindingInstallmentCeiling,
  type BuyVsRentCashFlowResult,
  type BuyVsRentOption,
  type CalculationAssumptions,
  type CalculatorResult,
  type CapitalValueByScenario,
  type CashFlowBreakdown,
  type CashFlowRiskLevel,
  type PurchasingPowerResult,
  type QuestionnaireAnswers,
  type ReadinessResult,
  type ReadinessStatus,
  type RentGapPlanResult,
  type RentToOwnResult,
  type RtoGapPlanResult,
  type WealthComparisonResult,
  type WealthComparisonYear,
  DEFAULT_ASSUMPTIONS,
} from "../types/finance";

/** Flat tenure assumed for every Buy calculation (installment sizing, loan
 *  capacity, 10-year wealth comparison) — a fixed policy assumption, not
 *  derived from the applicant's age. */
export const BUY_LOAN_TENURE_YEARS = 30;

/** RTO-Payment.xlsx's own natural contract block: the sheet defines RTO
 *  accumulation month-by-month only through month 36 (see calculateRentToOwn
 *  and RentToOwnResult.paidTowardPriceAfter3YearsTHB). */
export const RTO_PERIOD_YEARS = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Loan amount factor: how much loan principal a given monthly payment
 * supports, over `termYears` at `annualRate`.
 *
 *   factor = (1 - (1 + r)^-n) / r     where r = monthly rate, n = # payments
 */
export function loanFactor(termYears: number, annualRate: number): number {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  if (numPayments <= 0) return 0;
  if (monthlyRate === 0) return numPayments;
  return (1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate;
}

/**
 * Standard closed-form remaining balance of a level-payment loan after
 * `monthsElapsed` payments, clamped to >=0 so a paid-off loan (or a horizon
 * beyond its term) never reports a negative balance.
 */
export function remainingBalance(
  principal: number,
  installment: number,
  annualRate: number,
  monthsElapsed: number,
): number {
  if (principal <= 0 || monthsElapsed <= 0) return Math.max(0, principal);
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) {
    return Math.max(0, principal - installment * monthsElapsed);
  }
  const growth = Math.pow(1 + monthlyRate, monthsElapsed);
  const balance = principal * growth - installment * ((growth - 1) / monthlyRate);
  return Math.max(0, balance);
}

export interface IncomeProfile {
  grossMonthlyIncome: number;
  /** Primary + additional + co-borrower monthly income — deliberately
   *  excludes any bonus/variable income, even averaged. This is "Total
   *  monthly income" for the Financial Snapshot's "Remaining monthly
   *  income" row (see calculateBuyVsRentCashFlow): a household's annual
   *  bonus isn't guaranteed recurring monthly cash flow, so it must never
   *  inflate a figure that's meant to answer "what do I have left every
   *  month." Co-borrower income is included at the same full weight as the
   *  applicant's own — see QuestionnaireAnswers.coBorrowerIncomeMonthly. */
  steadyMonthlyIncome: number;
  /** Income as a lender would count it — bonus/other income discounted by
   *  variableIncomeWeight, since it isn't guaranteed like salary. Steady
   *  income (including co-borrower income) is never discounted. */
  bankQualifyingMonthlyIncome: number;
  /** Applicant's own debt + co-borrower's own debt — kept symmetric with
   *  steadyMonthlyIncome's inclusion of coBorrowerIncomeMonthly, so counting
   *  a co-borrower's income never inflates affordability without their debt
   *  obligations counting against it too. */
  totalMonthlyDebt: number;
}

export function calculateIncomeProfile(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
): IncomeProfile {
  const steadyMonthlyIncome =
    answers.primaryIncomeMonthly + answers.additionalIncomeMonthly + answers.coBorrowerIncomeMonthly;
  const variableMonthlyIncome = answers.bonusAnnual / 12;
  const grossMonthlyIncome = steadyMonthlyIncome + variableMonthlyIncome;
  const bankQualifyingMonthlyIncome =
    steadyMonthlyIncome + variableMonthlyIncome * assumptions.variableIncomeWeight;
  const totalMonthlyDebt = answers.homeLoanMonthly + answers.otherDebtMonthly + answers.coBorrowerDebtMonthly;
  return { grossMonthlyIncome, steadyMonthlyIncome, bankQualifyingMonthlyIncome, totalMonthlyDebt };
}

export interface ExpenseProfile {
  /** Excludes rent — rent is tracked separately since it disappears once the
   *  user buys (replaced by the mortgage payment, not stacked on top of it). */
  monthlyLivingExpenses: number;
  monthlyLumpSumEquivalent: number;
  monthlyRent: number;
  monthlySavingCapacity: number;
  /** Unclamped income-minus-obligations residual, before housing. Negative
   *  means the household is already spending more than it earns — a red
   *  flag that the clamped monthlySavingCapacity (floored at 0) would
   *  otherwise silently hide. */
  monthlyCashFlowBeforeHousing: number;
}

export function resolveExpenseProfile(
  answers: QuestionnaireAnswers,
  income: IncomeProfile,
): ExpenseProfile {
  const monthlyRent = answers.isRenting ? answers.monthlyRent : 0;
  const monthlyLumpSumEquivalent = answers.annualLumpSumExpenses / 12;
  const monthlyCashFlowBeforeHousing =
    income.grossMonthlyIncome -
    income.totalMonthlyDebt -
    answers.monthlyLivingExpenses -
    monthlyLumpSumEquivalent -
    monthlyRent;
  return {
    monthlyLivingExpenses: answers.monthlyLivingExpenses,
    monthlyLumpSumEquivalent,
    monthlyRent,
    monthlySavingCapacity: Math.max(0, monthlyCashFlowBeforeHousing),
    monthlyCashFlowBeforeHousing,
  };
}

export interface InstallmentCeilings {
  affordableByDSR: number;
  affordableByBudget: number;
  recommendedMonthlyInstallment: number;
  bindingInstallmentCeiling: BindingInstallmentCeiling;
}

/**
 * Three independent lenses on "how much mortgage payment can this household
 * actually take on": what a bank's DSR policy would approve, what's left of
 * real disposable income after real living costs (a check the old model
 * skipped entirely), and what the user personally wants to cap it at. The
 * lowest one governs — DSR and budget are always active; comfort only
 * overrides when it's set and stricter than both.
 */
export function calculateInstallmentCeilings(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
  income: IncomeProfile,
  expenses: ExpenseProfile,
): InstallmentCeilings {
  const affordableByDSR = Math.max(
    0,
    income.bankQualifyingMonthlyIncome * assumptions.debtServiceRatio - income.totalMonthlyDebt,
  );
  const affordableByBudget = Math.max(
    0,
    income.grossMonthlyIncome -
      income.totalMonthlyDebt -
      expenses.monthlyLivingExpenses -
      expenses.monthlyLumpSumEquivalent,
  );

  let recommendedMonthlyInstallment = Math.min(affordableByDSR, affordableByBudget);
  let bindingInstallmentCeiling: BindingInstallmentCeiling =
    affordableByDSR <= affordableByBudget ? "dsr" : "budget";

  if (
    answers.maxComfortableInstallment > 0 &&
    answers.maxComfortableInstallment < recommendedMonthlyInstallment
  ) {
    recommendedMonthlyInstallment = answers.maxComfortableInstallment;
    bindingInstallmentCeiling = "comfort";
  }

  return {
    affordableByDSR,
    affordableByBudget,
    recommendedMonthlyInstallment,
    bindingInstallmentCeiling,
  };
}

export function calculatePurchasingPower(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
): PurchasingPowerResult {
  const income = calculateIncomeProfile(answers, assumptions);
  const expenses = resolveExpenseProfile(answers, income);
  const ceilings = calculateInstallmentCeilings(answers, assumptions, income, expenses);

  // Tenure is never asked for — always the flat policy assumption.
  const effectiveLoanTermYears = BUY_LOAN_TENURE_YEARS;
  const factor = loanFactor(effectiveLoanTermYears, assumptions.annualInterestRate);
  const loanCapacity = ceilings.recommendedMonthlyInstallment * factor;

  // Recommended Home Price = the price supported by borrowing/repayment
  // capacity ALONE, assuming the minimum required down payment
  // (downPaymentRate) is put down: loanCapacity finances (1-downPaymentRate)
  // of the price, so price = loanCapacity / (1-downPaymentRate). This is an
  // affordability ceiling, not a "could I close on this today" figure —
  // deliberately independent of availableDownPayment. Today's actual cash
  // doesn't raise this ceiling (extra cash can't make a bank lend above your
  // DSR/budget capacity) and doesn't lower it either; whether today's real
  // cash meets the minimum down payment this price implies is a separate
  // question, answered by calculateActionPlan's remainingDownPayment /
  // calculateBuyGapNarrative's Down Payment Gap, never by moving this
  // ceiling. (Previously loanCapacity + availableDownPayment — changed
  // because that let extra cash silently raise this ceiling, conflating
  // affordability with today's cash-readiness, which THE GAP's Home Price
  // Gap / Down Payment Gap split is specifically designed to keep apart.)
  const maxHomePrice =
    assumptions.downPaymentRate < 1 ? loanCapacity / (1 - assumptions.downPaymentRate) : 0;

  // Loan needed at maxHomePrice using the household's ACTUAL available cash
  // — not the minimum down payment maxHomePrice's own construction assumes.
  // Can exceed loanCapacity when available cash falls short of maxHomePrice's
  // implied minimum (maxHomePrice * downPaymentRate) — that's not a bug, it's
  // the same cash-shortfall signal remainingDownPayment surfaces separately.
  // Not currently shown anywhere in the UI.
  const availableForDownPayment = answers.availableDownPayment;
  const estimatedLoanAmount = Math.max(0, maxHomePrice - availableForDownPayment);

  // Budget zones give the user a spending range rather than one brittle
  // number. Safe = comfortable cushion below capacity; Stretch = exactly at
  // capacity; Risk = anything meaningfully above it. Percentages are a
  // product judgment call, not a regulatory figure — tune freely.
  const safeBudget = maxHomePrice * assumptions.safeBudgetMultiplier;
  const stretchBudget = maxHomePrice * assumptions.stretchBudgetMultiplier;
  const riskZoneThreshold = maxHomePrice * assumptions.riskZoneMultiplier;

  // "The Gap & The Plan" headline number — how far the target price sits
  // beyond maxHomePrice itself (not the stretch-adjusted zone above). Extra
  // down payment cash no longer closes this on its own (see maxHomePrice's
  // own comment) — the only lever left is more loan capacity. Since
  // maxHomePrice = loanCapacity / (1-downPaymentRate), each ฿1 of extra loan
  // capacity raises maxHomePrice by 1/(1-downPaymentRate), so closing
  // priceGap needs only priceGap * (1-downPaymentRate) of extra loan
  // capacity, not priceGap itself.
  const priceGap = Math.max(0, answers.targetHomePrice - maxHomePrice);
  const isPriceGapClosed = priceGap === 0;
  const additionalMonthlyInstallmentNeeded =
    factor > 0 ? (priceGap * (1 - assumptions.downPaymentRate)) / factor : 0;
  const requiredMonthlyInstallmentForTarget =
    ceilings.recommendedMonthlyInstallment + additionalMonthlyInstallmentNeeded;

  return {
    affordableByDSR: ceilings.affordableByDSR,
    affordableByBudget: ceilings.affordableByBudget,
    recommendedMonthlyInstallment: ceilings.recommendedMonthlyInstallment,
    bindingInstallmentCeiling: ceilings.bindingInstallmentCeiling,
    effectiveLoanTermYears,
    loanCapacity,
    estimatedLoanAmount,
    maxHomePrice,
    safeBudget,
    stretchBudget,
    riskZoneThreshold,
    priceGap,
    isPriceGapClosed,
    additionalMonthlyInstallmentNeeded,
    requiredMonthlyInstallmentForTarget,
  };
}

/** Cash due at closing for a Buy at `homePriceBasis`: the minimum down
 *  payment plus estimated transfer/registration fees. Parameterized on the
 *  basis (rather than always reading answers.targetHomePrice) so the same
 *  formula can price Buy's "Initial Payment" row in the Rent/RTO/Buy
 *  comparison at whatever basis that section is rooted at. */
export function calculateBuyInitialPayment(
  homePriceBasis: number,
  assumptions: CalculationAssumptions,
): number {
  return homePriceBasis * assumptions.downPaymentRate + homePriceBasis * assumptions.transactionCostRate;
}

export function calculateActionPlan(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
  expenses: ExpenseProfile,
): ActionPlanResult {
  // Down payment only — Readiness/downPaymentCoverage and the saving-timeline
  // math below deliberately track just the down payment, not the full cash
  // due at closing. Transaction/registration costs are real cash the
  // household should prepare, but they're a fixed cost of the transaction,
  // not something saving progress "covers" the way a down payment is — see
  // transactionCostEstimate, kept for display only.
  const requiredDownPayment = answers.targetHomePrice * assumptions.downPaymentRate;
  const remainingDownPayment = Math.max(0, requiredDownPayment - answers.availableDownPayment);
  const isDownPaymentReady = remainingDownPayment === 0;
  const transactionCostEstimate = answers.targetHomePrice * assumptions.transactionCostRate;

  let monthsToReady: number | null;
  if (isDownPaymentReady) {
    monthsToReady = 0;
  } else if (expenses.monthlySavingCapacity > 0) {
    monthsToReady = Math.ceil(remainingDownPayment / expenses.monthlySavingCapacity);
  } else {
    // Saving $0/month against a real gap means "not achievable" — don't
    // divide by zero and don't lie with a number.
    monthsToReady = null;
  }
  const yearsToReady = monthsToReady === null ? null : +(monthsToReady / 12).toFixed(1);

  const isOnTargetTimeline =
    monthsToReady === null ? null : monthsToReady <= answers.targetTimelineMonths;

  let shortfallMonths: number | null = null;
  let suggestedMonthlySavingsIncrease: number | null = null;
  if (monthsToReady !== null && isOnTargetTimeline === false) {
    shortfallMonths = monthsToReady - answers.targetTimelineMonths;
    const requiredMonthlySavingForTarget = Math.ceil(remainingDownPayment / answers.targetTimelineMonths);
    suggestedMonthlySavingsIncrease = Math.max(
      0,
      requiredMonthlySavingForTarget - expenses.monthlySavingCapacity,
    );
  }

  return {
    requiredDownPayment,
    remainingDownPayment,
    transactionCostEstimate,
    monthlySavingCapacity: expenses.monthlySavingCapacity,
    isDownPaymentReady,
    monthsToReady,
    yearsToReady,
    isOnTargetTimeline,
    shortfallMonths,
    suggestedMonthlySavingsIncrease,
  };
}

// Readiness sub-score weights — budgetFit weighted heaviest since it's the
// strongest signal of "can this household's loan capacity actually reach
// the target price"; downPaymentCoverage and timelineFit matter, but
// shouldn't be able to outvote it. Product judgment call, not a regulatory
// figure. Previously an equal 1/3 split, which let a fast down-payment
// saving timeline (timelineFit near 100%) mask a target price the
// household's loan capacity could never actually reach — e.g. a ~33%
// budgetFit could still average out to "Almost Ready." Weighted, not a hard
// cutoff at some budgetFit threshold: a threshold creates a cliff (a 0.1-point
// change in budgetFit flipping the status band), where a heavier weight
// degrades the score continuously as budgetFit drops.
const READINESS_BUDGET_FIT_WEIGHT = 0.5;
const READINESS_DOWN_PAYMENT_WEIGHT = 0.35;
const READINESS_TIMELINE_FIT_WEIGHT = 0.15;

export function calculateReadiness(
  answers: QuestionnaireAnswers,
  purchasingPower: PurchasingPowerResult,
  actionPlan: ActionPlanResult,
): ReadinessResult {
  // Three independent lenses on "can they buy this home": how much of the
  // down payment they already have, does their loan capacity reach the
  // price, and will their saving rate get them the rest on their own
  // timeline. Deliberately down-payment-only, not full cash-at-closing —
  // transaction/registration costs are excluded (see
  // ActionPlanResult.transactionCostEstimate, shown separately in The Gap &
  // The Plan) so they never dilute this score.
  const downPaymentCoverage = actionPlan.requiredDownPayment > 0
    ? clamp((answers.availableDownPayment / actionPlan.requiredDownPayment) * 100, 0, 100)
    : 100;

  const budgetFit = answers.targetHomePrice > 0
    ? clamp((purchasingPower.maxHomePrice / answers.targetHomePrice) * 100, 0, 100)
    : 100;

  let timelineFit: number;
  if (actionPlan.monthsToReady === 0) {
    timelineFit = 100;
  } else if (actionPlan.monthsToReady === null || answers.targetTimelineMonths <= 0) {
    timelineFit = 0;
  } else {
    timelineFit = clamp(
      (answers.targetTimelineMonths / actionPlan.monthsToReady) * 100,
      0,
      100,
    );
  }

  const readinessPercent = Math.round(
    READINESS_BUDGET_FIT_WEIGHT * budgetFit +
      READINESS_DOWN_PAYMENT_WEIGHT * downPaymentCoverage +
      READINESS_TIMELINE_FIT_WEIGHT * timelineFit,
  );

  let status: ReadinessStatus;
  let archetype: ArchetypeKey;
  if (readinessPercent >= 85) {
    status = "ready";
    archetype = "buy-now";
  } else if (readinessPercent >= 65) {
    status = "almost-ready";
    archetype = "near-ready";
  } else if (readinessPercent >= 45) {
    status = "almost-ready";
    archetype = "emerging-buyer";
  } else if (readinessPercent >= 25) {
    status = "not-ready";
    archetype = "early-preparation";
  } else {
    status = "not-ready";
    archetype = "rent-for-now";
  }

  return {
    status,
    readinessPercent,
    archetype,
    subScores: { downPaymentCoverage, budgetFit, timelineFit },
  };
}

/**
 * Warning-only by design: this function reads ONLY `expenses`, never
 * `assumptions` — a structural guarantee (not just a convention) that a
 * pre-housing cash-flow shortfall can never leak into the DSR ceiling,
 * affordability numbers, or readiness score. It only ever produces an
 * advisory message.
 */
export function getAdvisoryNotices(expenses: ExpenseProfile): AdvisoryNotice[] {
  const notices: AdvisoryNotice[] = [];
  if (expenses.monthlyCashFlowBeforeHousing < 0) {
    notices.push({
      key: "negative-cash-flow",
      amountTHB: Math.abs(expenses.monthlyCashFlowBeforeHousing),
    });
  }
  return notices;
}

/** The "Comfortable" remaining-income threshold used by classifyCushion below. */
const COMFORTABLE_REMAINING_PCT = 15;

/** Shared cushion thresholds for both sides of the Buy vs Rent cash-flow
 *  comparison: >=15% of income left over is Comfortable, >=5% is Tight,
 *  below that is High Risk. */
function classifyCushion(remainingPct: number): CashFlowRiskLevel {
  if (remainingPct >= COMFORTABLE_REMAINING_PCT) return "comfortable";
  if (remainingPct >= 5) return "moderate";
  return "high-risk";
}

/** income.steadyMonthlyIncome minus existing debt, living expenses, and
 *  annualized lump-sum costs — the "other obligations" subtraction
 *  Remaining Monthly Income uses (see calculateBuyVsRentCashFlow). */
function calculateIncomeAfterOtherObligations(income: IncomeProfile, expenses: ExpenseProfile): number {
  const otherObligationsMonthly =
    income.totalMonthlyDebt + expenses.monthlyLivingExpenses + expenses.monthlyLumpSumEquivalent;
  return income.steadyMonthlyIncome - otherObligationsMonthly;
}

/**
 * Rent-to-Own (RTO) figures, reproducing RTO-Payment.xlsx's formulas
 * verbatim for the first RTO_PERIOD_YEARS — see CalculationAssumptions'
 * rto* fields for the exact source cell each value traces back to — and
 * then modeling RTO as what it actually is: a 3-year pathway TO
 * homeownership, not a flat RTO payment that somehow continues forever.
 * At the end of year 3 the household transitions to a normal mortgage on
 * whatever the RTO contract hasn't already credited toward the price (see
 * remainingPrincipalAfter3YearsTHB), using the SAME standard financing
 * assumption Buy itself uses (BUY_LOAN_TENURE_YEARS, annualInterestRate) —
 * not a second, RTO-specific one. Rooted at `homePriceBasis`, the same
 * basis calculateWealthComparison is called with for Buy and Rent, so all
 * three housing options price the same home (either the suggested home
 * budget or the user's stated target price, depending on which
 * BuyVsRentOption this is for — see BuyVsRentOption).
 *
 * `marketValueYear10THB` — Buy's own WealthComparisonResult.
 * affordableHomeValueYear10 for this SAME homePriceBasis and appreciation
 * assumption — is passed in rather than recomputed here, and used verbatim
 * as projectedHomeValueYear10THB. This is a deliberate conceptual choice:
 * the RTO markup (rtoPriceMarkupRate) is the extra cost of acquiring the
 * home through Rent-to-Own — it inflates rtoPriceTHB (what the household
 * pays) but must NOT inflate the property's actual market value. The home
 * is worth what it's worth regardless of how it was financed, so RTO and
 * Buy must show the identical Year-10 property value for the same home —
 * see RentToOwnResult.
 */
export function calculateRentToOwn(
  homePriceBasis: number,
  assumptions: CalculationAssumptions,
  marketValueYear10THB: number,
): RentToOwnResult {
  const rtoPriceTHB = homePriceBasis * (1 + assumptions.rtoPriceMarkupRate);
  const contractFeeTHB = homePriceBasis * assumptions.rtoContractFeeRate;
  const monthlyPaymentTHB = (rtoPriceTHB / 1_000_000) * assumptions.rtoPaymentPerMillion;

  // Months 1 through RTO_PERIOD_YEARS*12: RTO-Payment.xlsx's own first
  // "3-year" block (its own natural, fully-specified milestone — see
  // RentToOwnResult's docstring). Splits the flat monthly payment into
  // imputed interest (on the declining balance) and principal (credited
  // toward the price), with the imputed rate stepping up 1%/year.
  let remaining = rtoPriceTHB;
  for (let month = 1; month <= RTO_PERIOD_YEARS * 12; month++) {
    const rate =
      month <= 12
        ? assumptions.rtoYear1InterestRate
        : month <= 24
          ? assumptions.rtoYear2InterestRate
          : assumptions.rtoYear3InterestRate;
    const interest = (remaining * rate) / 12;
    const principal = monthlyPaymentTHB - interest;
    remaining -= principal;
  }
  const paidTowardPriceAfter3YearsTHB = Math.max(0, rtoPriceTHB - remaining);

  // Transition to normal homeownership at the end of year 3: a standard
  // mortgage on whatever the RTO contract hasn't already credited toward
  // the contract/exercise price (rtoPriceTHB) — not the original
  // homePriceBasis (that would ignore the real markup the household agreed
  // to pay for the RTO structure) and not a fresh Year-3 market appraisal
  // (the exercise price is contractually fixed, not renegotiated). Uses the
  // SAME standard financing assumption as Buy — an ordinary mortgage, not a
  // second RTO-flavored calculation.
  const remainingPrincipalAfter3YearsTHB = Math.max(0, rtoPriceTHB - paidTowardPriceAfter3YearsTHB);
  const transitionLoanFactor = loanFactor(BUY_LOAN_TENURE_YEARS, assumptions.annualInterestRate);
  const postTransitionMonthlyPaymentTHB =
    transitionLoanFactor > 0 ? remainingPrincipalAfter3YearsTHB / transitionLoanFactor : 0;

  // Total Paid Over 10 Years = contract fee + 3 years of RTO payments + 7
  // years of the post-transition mortgage installment — never
  // monthlyPaymentTHB * 120. The original RTO rate never continues past the
  // 3-year contract; years 4-10 pay the transition mortgage instead.
  const rtoMonths = RTO_PERIOD_YEARS * 12;
  const mortgageMonths = 120 - rtoMonths;
  const totalPaidOver10YearsTHB =
    contractFeeTHB + monthlyPaymentTHB * rtoMonths + postTransitionMonthlyPaymentTHB * mortgageMonths;

  return {
    rtoPriceTHB,
    contractFeeTHB,
    monthlyPaymentTHB,
    paidTowardPriceAfter3YearsTHB,
    remainingPrincipalAfter3YearsTHB,
    postTransitionMonthlyPaymentTHB,
    totalPaidOver10YearsTHB,
    // The property's market value at year 10 — identical to Buy's, since
    // market value depends on the home itself, not on the RTO markup paid
    // to acquire it (see this function's docstring).
    projectedHomeValueYear10THB: marketValueYear10THB,
  };
}

/**
 * Rent vs Rent-to-Own vs Buy, one representative month, side by side. All
 * three scenarios share the same income/living-expenses/debt — they differ
 * only in the housing line (estimated market rent, the RTO contract's flat
 * monthly payment, or the target home's mortgage installment), so "remaining
 * monthly income" is directly comparable across all three. Uses the same
 * housing figures as calculateWealthComparison (installmentForTargetHome /
 * estimatedMonthlyRent) and calculateRentToOwn so the monthly view and the
 * 10-year wealth view are telling one consistent story about the same
 * target home, not different affordability lenses.
 *
 * remainingMonthly reuses the SAME "income minus other obligations" formula
 * as InstallmentCeilings.affordableByBudget (steadyMonthlyIncome -
 * totalMonthlyDebt - monthlyLivingExpenses - monthlyLumpSumEquivalent),
 * then subtracts this option's own housing payment on top — affordableByBudget
 * is the budget available FOR housing; remainingMonthly is what's left
 * AFTER it. Deliberately uses steadyMonthlyIncome, not grossMonthlyIncome:
 * annual bonus isn't guaranteed recurring monthly cash flow, so it must
 * never inflate this figure, even averaged.
 *
 * Also computes each scenario's one-time Initial Payment (Buy's down
 * payment + transaction costs via calculateBuyInitialPayment, RTO's contract
 * fee, or 2 months' rent) and its Total Paid Over 10 Years (see
 * CashFlowBreakdown.totalPaidOver10YearsTHB) for the side-by-side comparison
 * grid.
 */
export function calculateBuyVsRentCashFlow(
  homePriceBasis: number,
  income: IncomeProfile,
  expenses: ExpenseProfile,
  assumptions: CalculationAssumptions,
  wealthComparison: WealthComparisonResult,
  rentToOwn: RentToOwnResult,
): BuyVsRentCashFlowResult {
  const incomeAfterOtherObligations = calculateIncomeAfterOtherObligations(income, expenses);

  const buildBreakdown = (
    housingPaymentMonthly: number,
    initialPaymentTHB: number,
    totalPaidOver10YearsTHB: number,
  ): CashFlowBreakdown => {
    const remainingMonthly = incomeAfterOtherObligations - housingPaymentMonthly;
    const remainingPct =
      income.steadyMonthlyIncome > 0 ? (remainingMonthly / income.steadyMonthlyIncome) * 100 : 0;
    return {
      incomeMonthly: income.steadyMonthlyIncome,
      housingPaymentMonthly,
      remainingMonthly,
      remainingPct,
      cushionStatus: classifyCushion(remainingPct),
      initialPaymentTHB,
      totalPaidOver10YearsTHB,
    };
  };

  const buyInitialPayment = calculateBuyInitialPayment(homePriceBasis, assumptions);
  // Rent's own initial payment (2 months') is a refundable deposit plus a
  // prepaid month already counted in the 120-month rent total below, not an
  // additional cost — so it's excluded here, unlike Buy/RTO's real one-time
  // fees, which are added on top of their own totals.
  const rentInitialPayment = wealthComparison.estimatedMonthlyRent * 2;
  // Year-10 entry of the wealth projection's own cumulative total — rent
  // grows with the property's appreciation there (see
  // calculateWealthComparison), so this must be read from that projection
  // rather than re-derived here as a flat estimatedMonthlyRent * 120, which
  // would silently understate what renting this same appreciating property
  // actually costs over 10 years.
  const totalRentPaidOver10Years = wealthComparison.years[wealthComparison.years.length - 1].totalRentPaid;

  return {
    buy: buildBreakdown(
      wealthComparison.installmentForTargetHome,
      buyInitialPayment,
      wealthComparison.installmentForTargetHome * 120 + buyInitialPayment,
    ),
    rent: buildBreakdown(wealthComparison.estimatedMonthlyRent, rentInitialPayment, totalRentPaidOver10Years),
    // RTO's own totalPaidOver10YearsTHB already accounts for the 3-year RTO
    // phase followed by 7 years on the post-transition mortgage — never
    // monthlyPaymentTHB * 120 (see calculateRentToOwn).
    rentToOwn: buildBreakdown(rentToOwn.monthlyPaymentTHB, rentToOwn.contractFeeTHB, rentToOwn.totalPaidOver10YearsTHB),
  };
}

/** Capital Value data for the comparison grid — Buy and RTO both project to
 *  the SAME year-10 horizon (see RentToOwnResult.projectedHomeValueYear10THB
 *  for how RTO gets there despite its own contract math stopping at year 3). */
export function calculateCapitalValue(
  wealthComparison: WealthComparisonResult,
  rentToOwn: RentToOwnResult,
): CapitalValueByScenario {
  return {
    buy: { accumulates: true, amountTHB: wealthComparison.affordableHomeValueYear10 },
    rent: { accumulates: false },
    rentToOwn: { accumulates: true, amountTHB: rentToOwn.projectedHomeValueYear10THB },
  };
}

/**
 * Buy vs Rent over 10 years, rooted at `homePriceBasis` — the user's
 * adjustable Target Home Price (see BuyVsRentOption). Tracks each scenario's
 * actual housing outcome only:
 *   - Buy: home equity (home value minus remaining loan balance) — a real,
 *     owned asset.
 *   - Rent: no housing asset accumulates, ever — renting a home builds no
 *     equity in it, by definition. There is deliberately no attempt to
 *     model what a renter does with the cash they didn't put toward a down
 *     payment (bank it, invest it, spend it) — that's a real question but a
 *     different, much more assumption-heavy one than "how much housing
 *     asset value did each option build," which is what this comparison
 *     answers. Do not call this "net wealth": it is housing-asset value
 *     only, not a household's total net worth.
 *
 * The modeled loan is ALWAYS sized off the assumed minimum required down
 * payment (homePriceBasis * downPaymentRate) — the same standard financing
 * assumption for BOTH the Recommended-price and Target-price scenarios (see
 * computeCalculatorResult), never the household's real
 * answers.availableDownPayment. This is what makes loanForTargetHome exactly
 * equal purchasingPower.loanCapacity when homePriceBasis = maxHomePrice
 * (matching maxHomePrice's own construction), and what keeps Buy's modeled
 * installment a pure function of price + standard assumptions at ANY basis,
 * never silently different between the two scenarios shown side by side on
 * the same page. Whether the household's REAL cash actually covers this
 * minimum is a deliberately separate question — the Down Payment Gap
 * (ActionPlanResult.remainingDownPayment / BuyGapNarrative.remainingDownPayment),
 * which still compares requiredDownPayment against real availableDownPayment,
 * just never feeds into this loan/installment math.
 * `loanTermYears` is always BUY_LOAN_TENURE_YEARS at every call site.
 */
export function calculateWealthComparison(
  homePriceBasis: number,
  assumptions: CalculationAssumptions,
  loanTermYears: number,
  appreciationPct: number,
): WealthComparisonResult {
  const requiredDownPayment = homePriceBasis * assumptions.downPaymentRate;
  const loanForTargetHome = Math.max(0, homePriceBasis - requiredDownPayment);
  const factor = loanFactor(loanTermYears, assumptions.annualInterestRate);
  const installmentForTargetHome = factor > 0 ? loanForTargetHome / factor : 0;

  // "Today" / start-of-comparison estimate — this is what the UI's Monthly
  // Payment / Estimated Monthly Rent figure shows, and it stays this fixed
  // snapshot even though the year-by-year projection below grows rent
  // alongside the property's own appreciation (see totalRentPaid): rentalYieldPct
  // is a constant fraction of property value, so if the property's value is
  // modeled as appreciating, the market rent that yield is a fraction OF must
  // rise with it too, not stay flat for 10 years while the value under it grows.
  const estimatedMonthlyRent = (homePriceBasis * assumptions.rentalYieldPct) / 12;
  const loanTermMonths = loanTermYears * 12;

  const years: WealthComparisonYear[] = [];
  let cumulativeRentPaid = 0;
  for (let year = 1; year <= 10; year++) {
    const months = year * 12;
    const homeValue = homePriceBasis * Math.pow(1 + appreciationPct, year);
    const loanBalance = remainingBalance(
      loanForTargetHome,
      installmentForTargetHome,
      assumptions.annualInterestRate,
      months,
    );
    const homeEquity = homeValue - loanBalance;
    // Payments stop once the loan is paid off (e.g. a 5-year term reaching
    // year 10) — without this cap a short term kept accruing phantom
    // installments for years the loan no longer existed.
    const totalMortgagePaid = installmentForTargetHome * Math.min(months, loanTermMonths);
    // Rent during this year tracks the property's value as of the START of
    // the year (appreciationPct^(year-1)) at the same constant
    // rentalYieldPct — a "step" growth model matching this function's own
    // annual resolution elsewhere (homeValue/loanBalance are also computed
    // once per year, not monthly). Year 1 uses homePriceBasis itself
    // un-appreciated, so its total matches 12 * estimatedMonthlyRent exactly.
    const annualRentThisYear =
      homePriceBasis * Math.pow(1 + appreciationPct, year - 1) * assumptions.rentalYieldPct;
    cumulativeRentPaid += annualRentThisYear;
    const totalRentPaid = cumulativeRentPaid;

    years.push({ year, homeValue, loanBalance, homeEquity, totalMortgagePaid, totalRentPaid });
  }

  return {
    years,
    estimatedMonthlyRent,
    installmentForTargetHome,
    loanForTargetHome,
    // Same formula as each `years` entry's homeValue, at year 10 — reused
    // directly rather than recomputed.
    affordableHomeValueYear10: years[years.length - 1].homeValue,
  };
}

/** Computes the full BuyVsRentOption (wealth comparison + RTO + monthly cash
 *  flow + capital value) rooted at the user's Target Home Price. */
function buildBuyVsRentOption(
  homePriceBasis: number,
  assumptions: CalculationAssumptions,
  loanTermYears: number,
  appreciationPct: number,
  income: IncomeProfile,
  expenses: ExpenseProfile,
): BuyVsRentOption {
  const wealthComparison = calculateWealthComparison(
    homePriceBasis,
    assumptions,
    loanTermYears,
    appreciationPct,
  );
  const rentToOwn = calculateRentToOwn(homePriceBasis, assumptions, wealthComparison.affordableHomeValueYear10);
  const cashFlow = calculateBuyVsRentCashFlow(
    homePriceBasis,
    income,
    expenses,
    assumptions,
    wealthComparison,
    rentToOwn,
  );
  const capitalValue = calculateCapitalValue(wealthComparison, rentToOwn);
  return { homePriceBasis, wealthComparison, rentToOwn, cashFlow, capitalValue };
}

/** RTO's Gap & Plan lens — see RtoGapPlanResult.
 *
 *  Deliberately does NOT compute its own RTO-specific "affordable home
 *  price": Buy and RTO share one financial-eligibility ceiling
 *  (PurchasingPowerResult.maxHomePrice, the same Recommended Home Price
 *  shown for Buy), so "does this price fit my finances" is answered once,
 *  by calculateBuyGapNarrative, and reused for both — see BuyContent and
 *  RtoContent in GapAndPlan.tsx, which both call it with the same
 *  homePriceBasis. This function is scoped to what's genuinely
 *  RTO-specific: the contract fee (an upfront cash requirement Buy doesn't
 *  have) and the RTO monthly payment's own cash-flow cushion (RTO's payment
 *  mechanics — see calculateRentToOwn — are not a bank loan, so they're
 *  never run through Buy's DSR/installment math). RtoContent surfaces
 *  hasMonthlyShortfall/monthlyShortfallTHB as their own GAP/PLAN row — RTO's
 *  Years 1-3 payment-feasibility check — kept entirely separate from the
 *  shared Home Price Gap row above. */
export function calculateRtoGapPlan(
  answers: QuestionnaireAnswers,
  expenses: ExpenseProfile,
  rentToOwn: RentToOwnResult,
  rentToOwnCashFlow: CashFlowBreakdown,
): RtoGapPlanResult {
  const requiredRtoContractFee = rentToOwn.contractFeeTHB;
  const rtoContractFeeGap = Math.max(0, requiredRtoContractFee - answers.availableDownPayment);
  const isContractFeeGapClosed = rtoContractFeeGap === 0;
  const monthsToCloseContractFeeGap = isContractFeeGapClosed
    ? 0
    : expenses.monthlySavingCapacity > 0
      ? Math.ceil(rtoContractFeeGap / expenses.monthlySavingCapacity)
      : null;
  const hasMonthlyShortfall = rentToOwnCashFlow.remainingMonthly < 0;

  return {
    requiredRtoContractFee,
    availableDownPaymentTHB: answers.availableDownPayment,
    rtoContractFeeGap,
    isContractFeeGapClosed,
    monthsToCloseContractFeeGap,
    hasMonthlyShortfall,
    monthlyShortfallTHB: hasMonthlyShortfall ? Math.abs(rentToOwnCashFlow.remainingMonthly) : 0,
    monthlyPaymentTHB: rentToOwn.monthlyPaymentTHB,
    cushionStatus: rentToOwnCashFlow.cushionStatus,
    remainingMonthlyTHB: rentToOwnCashFlow.remainingMonthly,
  };
}

/** Rent's Gap & Plan lens — see RentGapPlanResult. */
export function calculateRentGapPlan(
  rentCashFlow: CashFlowBreakdown,
  answers: QuestionnaireAnswers,
  expenses: ExpenseProfile,
): RentGapPlanResult {
  const hasMonthlyShortfall = rentCashFlow.remainingMonthly < 0;

  // Upfront cash requirement — the 2-month deposit, not a monthly cost (see
  // RentGapPlanResult). rentCashFlow.initialPaymentTHB is already exactly
  // this figure (estimatedMonthlyRent * 2), computed once in
  // calculateBuyVsRentCashFlow and reused here rather than recomputed.
  const requiredRentalDeposit = rentCashFlow.initialPaymentTHB;
  const rentalDepositGap = Math.max(0, requiredRentalDeposit - answers.totalSavings);
  const isRentalDepositReady = rentalDepositGap === 0;
  const monthsToCloseRentalDepositGap = isRentalDepositReady
    ? 0
    : expenses.monthlySavingCapacity > 0
      ? Math.ceil(rentalDepositGap / expenses.monthlySavingCapacity)
      : null;

  return {
    hasMonthlyShortfall,
    monthlyShortfallTHB: hasMonthlyShortfall ? Math.abs(rentCashFlow.remainingMonthly) : 0,
    requiredRentalDeposit,
    rentalDepositGap,
    isRentalDepositReady,
    monthsToCloseRentalDepositGap,
  };
}

/** Buy's Gap & Plan lens, generalized to whatever home price basis the Buy
 *  vs Rent section's toggle currently shows (Recommended Home Price or the
 *  user's Target Home Price) — unlike PurchasingPowerResult's own
 *  priceGap/etc. fields, which are always rooted at the user's live target
 *  regardless of that toggle. purchasingPower's other fields (maxHomePrice,
 *  loanCapacity, stretchBudget, riskZoneThreshold, ...) don't depend on any
 *  home price basis, so this can be recomputed for either basis on the fly
 *  from the same purchasingPower object. */
export interface BuyGapNarrative {
  priceGap: number;
  isPriceGapClosed: boolean;
  /** The ONLY lever that closes priceGap — see PurchasingPowerResult's
   *  matching field: more loan capacity, not more down payment cash (which
   *  no longer moves maxHomePrice at all — see maxHomePrice's own comment).
   *  NOT priceGap/loanFactor: accounts for maxHomePrice's
   *  loanCapacity/(1-downPaymentRate) construction. */
  additionalMonthlyInstallmentNeeded: number;
  requiredMonthlyInstallmentForTarget: number;
  /** Present when homePriceBasis sits above the stretch or risk zone —
   *  same trigger as calculateActionPlan's over-risk-budget/stretch-zone
   *  suggestion, generalized to any basis price. */
  downsizeSuggestion?: AlternativeSuggestion;
  /** Down payment readiness at homePriceBasis — the same down-payment-only
   *  framing as ActionPlanResult (see calculateActionPlan), just generalized
   *  to whichever basis price is selected instead of always
   *  answers.targetHomePrice. This is the cash-readiness question — distinct
   *  from priceGap above, which is the loan-eligibility question. The two
   *  are deliberately independent now: closing one never closes the other. */
  requiredDownPayment: number;
  /** max(requiredDownPayment - availableDownPayment, 0). */
  remainingDownPayment: number;
  /** Estimated transfer + mortgage-registration fees at homePriceBasis —
   *  additional cash to prepare on top of the down payment, shown for
   *  planning only. Never subtracted from requiredDownPayment/
   *  remainingDownPayment above. */
  transactionCostEstimate: number;
}

export function calculateBuyGapNarrative(
  homePriceBasis: number,
  purchasingPower: PurchasingPowerResult,
  assumptions: CalculationAssumptions,
  availableDownPayment: number,
): BuyGapNarrative {
  const factor = loanFactor(purchasingPower.effectiveLoanTermYears, assumptions.annualInterestRate);
  const priceGap = Math.max(0, homePriceBasis - purchasingPower.maxHomePrice);
  const isPriceGapClosed = priceGap === 0;
  const additionalMonthlyInstallmentNeeded =
    factor > 0 ? (priceGap * (1 - assumptions.downPaymentRate)) / factor : 0;
  const requiredMonthlyInstallmentForTarget =
    purchasingPower.recommendedMonthlyInstallment + additionalMonthlyInstallmentNeeded;

  const requiredDownPayment = homePriceBasis * assumptions.downPaymentRate;
  const remainingDownPayment = Math.max(0, requiredDownPayment - availableDownPayment);
  const transactionCostEstimate = homePriceBasis * assumptions.transactionCostRate;

  let downsizeSuggestion: AlternativeSuggestion | undefined;
  if (homePriceBasis > purchasingPower.riskZoneThreshold) {
    downsizeSuggestion = {
      key: "over-risk-budget",
      amountTHB: Math.max(0, homePriceBasis - purchasingPower.stretchBudget),
    };
  } else if (homePriceBasis > purchasingPower.stretchBudget) {
    downsizeSuggestion = { key: "stretch-zone" };
  }

  return {
    priceGap,
    isPriceGapClosed,
    additionalMonthlyInstallmentNeeded,
    requiredMonthlyInstallmentForTarget,
    downsizeSuggestion,
    requiredDownPayment,
    remainingDownPayment,
    transactionCostEstimate,
  };
}

export function computeCalculatorResult(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions = DEFAULT_ASSUMPTIONS,
): CalculatorResult {
  const income = calculateIncomeProfile(answers, assumptions);
  const expenses = resolveExpenseProfile(answers, income);
  const purchasingPower = calculatePurchasingPower(answers, assumptions);
  const actionPlan = calculateActionPlan(answers, assumptions, expenses);
  const readiness = calculateReadiness(answers, purchasingPower, actionPlan);
  const advisoryNotices = getAdvisoryNotices(expenses);

  // Both bases model Buy's loan/installment the SAME way — the standard
  // financing assumption of a minimum-required down payment
  // (homePriceBasis * downPaymentRate), computed inside
  // calculateWealthComparison itself — never the household's real
  // answers.availableDownPayment. This is what makes byBudget's
  // loanForTargetHome exactly equal purchasingPower.loanCapacity (by
  // construction, since maxHomePrice = loanCapacity / (1-downPaymentRate)),
  // and what keeps byBudget and byTarget's modeled Buy figures consistent
  // with each other and with Purchasing Power, rather than one using real
  // cash and the other an assumption. The household's REAL cash still
  // matters — it's compared against this same requiredDownPayment
  // separately, as the Down Payment Gap (ActionPlanResult.remainingDownPayment
  // / BuyGapNarrative.remainingDownPayment) — just never inside this
  // loan/installment math.
  const buyVsRentByBudget = buildBuyVsRentOption(
    purchasingPower.maxHomePrice,
    assumptions,
    purchasingPower.effectiveLoanTermYears,
    answers.expectedAppreciationPct,
    income,
    expenses,
  );
  const buyVsRentByTarget = buildBuyVsRentOption(
    answers.targetHomePrice,
    assumptions,
    purchasingPower.effectiveLoanTermYears,
    answers.expectedAppreciationPct,
    income,
    expenses,
  );

  // RTO/Rent Gap & Plan computed for BOTH bases — like buyVsRentByBudget/
  // ByTarget, so the Buy vs Rent section's basis toggle can drive Gap &
  // Plan's RTO/Rent tabs too (see GapAndPlan, which reads whichever pair
  // BuyVsRentComparison's toggle currently selects).
  const rtoGapPlanByBudget = calculateRtoGapPlan(
    answers,
    expenses,
    buyVsRentByBudget.rentToOwn,
    buyVsRentByBudget.cashFlow.rentToOwn,
  );
  const rtoGapPlanByTarget = calculateRtoGapPlan(
    answers,
    expenses,
    buyVsRentByTarget.rentToOwn,
    buyVsRentByTarget.cashFlow.rentToOwn,
  );
  const rentGapPlanByBudget = calculateRentGapPlan(buyVsRentByBudget.cashFlow.rent, answers, expenses);
  const rentGapPlanByTarget = calculateRentGapPlan(buyVsRentByTarget.cashFlow.rent, answers, expenses);

  return {
    purchasingPower,
    actionPlan,
    readiness,
    advisoryNotices,
    buyVsRentByBudget,
    buyVsRentByTarget,
    rtoGapPlanByBudget,
    rtoGapPlanByTarget,
    rentGapPlanByBudget,
    rentGapPlanByTarget,
  };
}

export function formatTHB(value: number): string {
  const rounded = Math.round(value);
  if (Math.abs(rounded) >= 1_000_000) {
    return `฿${(rounded / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(rounded) >= 1_000) {
    return `฿${(rounded / 1_000).toFixed(0)}K`;
  }
  return `฿${rounded.toLocaleString("en-US")}`;
}

/** Formats a fraction (0.06) as a percentage string ("6.0%"). Used for
 *  assumption values (interest rate, appreciation, rental yield, etc.). */
export function formatPercent(value: number, fractionDigits = 1): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}
