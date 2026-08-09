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
  type CashFlowBreakdown,
  type CashFlowRiskLevel,
  type PurchasingPowerResult,
  type QuestionnaireAnswers,
  type ReadinessResult,
  type ReadinessStatus,
  type RentToOwnResult,
  type WealthComparisonResult,
  type WealthComparisonYear,
  DEFAULT_ASSUMPTIONS,
} from "../types/finance";

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
  /** Income as a lender would count it — bonus/other income discounted by
   *  variableIncomeWeight, since it isn't guaranteed like salary. */
  bankQualifyingMonthlyIncome: number;
  totalMonthlyDebt: number;
}

export function calculateIncomeProfile(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
): IncomeProfile {
  const variableMonthlyIncome = answers.bonusAnnual / 12;
  const grossMonthlyIncome = answers.monthlyIncome + variableMonthlyIncome;
  const bankQualifyingMonthlyIncome =
    answers.monthlyIncome + variableMonthlyIncome * assumptions.variableIncomeWeight;
  const totalMonthlyDebt = answers.homeLoanMonthly + answers.otherDebtMonthly;
  return { grossMonthlyIncome, bankQualifyingMonthlyIncome, totalMonthlyDebt };
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

/** Loan tenure is always auto-calculated from age, never asked for: the
 *  standard bank rule of thumb that age + tenure must not exceed a maximum
 *  age at loan maturity. The loan doesn't originate today, though — it
 *  originates whenever the user actually buys — so `targetTimelineMonths` is
 *  added to the applicant's age first, rounded up to the next whole year
 *  (any partial year still pushes them into the next age bracket by the
 *  time the loan starts, so 1.1 years must be treated as 2, not 1). Always
 *  returns a usable term (floors at minLoanTermYears, caps at
 *  maxLoanTermYearsCap). */
export function calculateMaxLoanTermYears(
  applicantAge: number,
  targetTimelineMonths: number,
  assumptions: CalculationAssumptions,
): number {
  const timelineYears = Math.ceil(targetTimelineMonths / 12);
  return clamp(
    assumptions.maxAgeAtLoanMaturity - applicantAge - timelineYears,
    assumptions.minLoanTermYears,
    assumptions.maxLoanTermYearsCap,
  );
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

  // Tenure is never asked for — always the age-based maximum.
  const effectiveLoanTermYears = calculateMaxLoanTermYears(
    answers.applicantAge,
    answers.targetTimelineMonths,
    assumptions,
  );
  const factor = loanFactor(effectiveLoanTermYears, assumptions.annualInterestRate);
  const loanCapacity = ceilings.recommendedMonthlyInstallment * factor;

  // Home-price ceiling = loan capacity + whatever cash is available for a
  // down payment. Purchasing power is deliberately about capacity only —
  // what income, debt, and available cash support — and does NOT subtract
  // transaction costs. Those are a closing expense, not a factor in how big
  // a home you can afford; they're accounted for separately in
  // calculateActionPlan's requiredCashAtClosing, which is the "do I have
  // enough cash to close" question.
  //
  // Deliberately NOT additionally capped by availableDownPayment / r (the
  // minimum-equity read of the down payment requirement) — maxHomePrice is
  // a loan-capacity ceiling, not a "could I close on this today" figure;
  // whether today's available cash covers the resulting down payment is a
  // separate question, answered by calculateActionPlan's cashGap, not by
  // shrinking this ceiling. For the same reason, ฿0 available down payment
  // is not a special case either — it just means maxHomePrice reduces to
  // loanCapacity alone (a real, non-zero ceiling whenever income supports
  // one), rather than forcing the whole figure to 0.
  const availableForDownPayment = answers.availableDownPayment;
  const maxHomePrice = Math.max(0, loanCapacity + availableForDownPayment);

  // Loan actually needed to reach maxHomePrice — can be less than
  // loanCapacity when available cash, not loan capacity, is what binds.
  // maxHomePrice = estimatedLoanAmount + availableDownPayment, always.
  const estimatedLoanAmount = Math.max(0, maxHomePrice - availableForDownPayment);

  // Budget zones give the user a spending range rather than one brittle
  // number. Safe = comfortable cushion below capacity; Stretch = exactly at
  // capacity; Risk = anything meaningfully above it. Percentages are a
  // product judgment call, not a regulatory figure — tune freely.
  const safeBudget = maxHomePrice * assumptions.safeBudgetMultiplier;
  const stretchBudget = maxHomePrice * assumptions.stretchBudgetMultiplier;
  const riskZoneThreshold = maxHomePrice * assumptions.riskZoneMultiplier;

  const isOverStretchBudget = answers.targetHomePrice > stretchBudget;
  const overStretchAmount = Math.max(0, answers.targetHomePrice - stretchBudget);

  // "The Gap & The Plan" headline numbers — how far the target price sits
  // beyond maxHomePrice itself (not the stretch-adjusted zone above), and
  // the two independent ways to close that gap. Both plan options are exact
  // because maxHomePrice = loanCapacity + availableDownPayment is additive:
  // adding priceGap of cash, or enough installment capacity to grow
  // loanCapacity by priceGap, each close it on their own.
  const priceGap = Math.max(0, answers.targetHomePrice - maxHomePrice);
  const isPriceGapClosed = priceGap === 0;
  const additionalDownPaymentNeeded = priceGap;
  const additionalMonthlyInstallmentNeeded = factor > 0 ? priceGap / factor : 0;
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
    isOverStretchBudget,
    overStretchAmount,
    priceGap,
    isPriceGapClosed,
    additionalDownPaymentNeeded,
    additionalMonthlyInstallmentNeeded,
    requiredMonthlyInstallmentForTarget,
  };
}

export function calculateActionPlan(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
  purchasingPower: PurchasingPowerResult,
  expenses: ExpenseProfile,
): ActionPlanResult {
  const requiredCashAtClosing =
    answers.targetHomePrice * assumptions.downPaymentRate +
    answers.targetHomePrice * assumptions.transactionCostRate;
  const cashGap = Math.max(0, requiredCashAtClosing - answers.availableDownPayment);
  const isDownPaymentReady = cashGap === 0;

  let monthsToReady: number | null;
  if (isDownPaymentReady) {
    monthsToReady = 0;
  } else if (expenses.monthlySavingCapacity > 0) {
    monthsToReady = Math.ceil(cashGap / expenses.monthlySavingCapacity);
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
    const requiredMonthlySavingForTarget = Math.ceil(cashGap / answers.targetTimelineMonths);
    suggestedMonthlySavingsIncrease = Math.max(
      0,
      requiredMonthlySavingForTarget - expenses.monthlySavingCapacity,
    );
  }

  // Keys + raw numbers only — the UI layer renders these in the active
  // language, since word order and phrasing don't map 1:1 across languages.
  const alternativeSuggestions: AlternativeSuggestion[] = [];

  if (answers.targetHomePrice > purchasingPower.riskZoneThreshold) {
    alternativeSuggestions.push({
      key: "over-risk-budget",
      amountTHB: purchasingPower.overStretchAmount,
    });
  } else if (purchasingPower.isOverStretchBudget) {
    alternativeSuggestions.push({ key: "stretch-zone" });
  }

  if (monthsToReady === null && cashGap > 0) {
    alternativeSuggestions.push({ key: "no-saving-plan" });
  }

  if (purchasingPower.bindingInstallmentCeiling === "comfort") {
    alternativeSuggestions.push({ key: "comfort-limited" });
  }

  // What's left of total savings after everything the purchase actually
  // consumes (down payment + transaction costs) — the safety net that keeps
  // a home purchase from wiping the user out. 3 months of (existing debt +
  // the new mortgage payment) is a standard starter emergency-fund rule of
  // thumb, not a regulatory figure.
  const emergencyCushion = Math.max(0, answers.totalSavings - requiredCashAtClosing);
  const monthlyObligationsAfterPurchase =
    answers.homeLoanMonthly +
    answers.otherDebtMonthly +
    purchasingPower.recommendedMonthlyInstallment;
  const recommendedCushion = monthlyObligationsAfterPurchase * 3;
  if (recommendedCushion > 0 && emergencyCushion < recommendedCushion) {
    alternativeSuggestions.push({
      key: "low-emergency-cushion",
      amountTHB: recommendedCushion - emergencyCushion,
    });
  }

  return {
    requiredCashAtClosing,
    cashGap,
    monthlySavingCapacity: expenses.monthlySavingCapacity,
    isDownPaymentReady,
    monthsToReady,
    yearsToReady,
    isOnTargetTimeline,
    shortfallMonths,
    suggestedMonthlySavingsIncrease,
    alternativeSuggestions,
  };
}

// Readiness sub-score weights — budgetFit weighted heaviest since it's the
// strongest signal of "can this household's loan capacity actually reach
// the target price"; closingCashCoverage and timelineFit matter, but
// shouldn't be able to outvote it. Product judgment call, not a regulatory
// figure. Previously an equal 1/3 split, which let a fast down-payment
// saving timeline (timelineFit near 100%) mask a target price the
// household's loan capacity could never actually reach — e.g. a ~33%
// budgetFit could still average out to "Almost Ready." Weighted, not a hard
// cutoff at some budgetFit threshold: a threshold creates a cliff (a 0.1-point
// change in budgetFit flipping the status band), where a heavier weight
// degrades the score continuously as budgetFit drops.
const READINESS_BUDGET_FIT_WEIGHT = 0.5;
const READINESS_CLOSING_CASH_WEIGHT = 0.35;
const READINESS_TIMELINE_FIT_WEIGHT = 0.15;

export function calculateReadiness(
  answers: QuestionnaireAnswers,
  purchasingPower: PurchasingPowerResult,
  actionPlan: ActionPlanResult,
): ReadinessResult {
  // Three independent lenses on "can they buy this home": can they cover
  // cash needed at closing today, does their loan capacity reach the price,
  // and will their saving rate get them there on their own timeline.
  const closingCashCoverage = actionPlan.requiredCashAtClosing > 0
    ? clamp((answers.availableDownPayment / actionPlan.requiredCashAtClosing) * 100, 0, 100)
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
      READINESS_CLOSING_CASH_WEIGHT * closingCashCoverage +
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
    subScores: { closingCashCoverage, budgetFit, timelineFit },
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

/** Shared cushion thresholds for both sides of the Buy vs Rent cash-flow
 *  comparison: >=15% of income left over is Comfortable, >=5% is Tight,
 *  below that is High Risk. */
function classifyCushion(remainingPct: number): CashFlowRiskLevel {
  if (remainingPct >= 15) return "comfortable";
  if (remainingPct >= 5) return "moderate";
  return "high-risk";
}

/**
 * Rent-to-Own (RTO) figures, reproducing RTO-Payment.xlsx's formulas
 * verbatim — see CalculationAssumptions' rto* fields for the exact source
 * cell each value traces back to. Rooted at `homePriceBasis`, the same basis
 * calculateWealthComparison is called with for Buy and Rent, so all three
 * housing options price the same home (either the suggested home budget or
 * the user's stated target price, depending on which BuyVsRentOption this
 * is for — see BuyVsRentOption).
 */
export function calculateRentToOwn(
  homePriceBasis: number,
  assumptions: CalculationAssumptions,
): RentToOwnResult {
  const rtoPriceTHB = homePriceBasis * (1 + assumptions.rtoPriceMarkupRate);
  const contractFeeTHB = homePriceBasis * assumptions.rtoContractFeeRate;
  const monthlyPaymentTHB = (rtoPriceTHB / 1_000_000) * assumptions.rtoPaymentPerMillion;

  // Months 1-36: RTO-Payment.xlsx's own first "3-year" block (its own
  // natural, fully-specified milestone — see RentToOwnResult's docstring).
  // Splits the flat monthly payment into imputed interest (on the
  // declining balance) and principal (credited toward the price), with the
  // imputed rate stepping up 1%/year.
  let remaining = rtoPriceTHB;
  for (let month = 1; month <= 36; month++) {
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

  return {
    rtoPriceTHB,
    contractFeeTHB,
    monthlyPaymentTHB,
    paidTowardPriceAfter3YearsTHB: Math.max(0, rtoPriceTHB - remaining),
  };
}

/**
 * Rent vs Rent-to-Own vs Buy, one representative month, side by side. All
 * three scenarios share the same income, living expenses, and existing debt
 * — they differ only in the housing line (estimated market rent, the RTO
 * contract's flat monthly payment, or the target home's mortgage
 * installment), so "remaining disposable income" is directly comparable
 * across all three. Uses the same housing figures as calculateWealthComparison
 * (installmentForTargetHome / estimatedMonthlyRent) and calculateRentToOwn
 * so the monthly view and the 10-year wealth view are telling one consistent
 * story about the same target home, not different affordability lenses.
 * "Savings" is intentionally not its own line — subtracting it separately
 * would double-count against the budget ceiling in
 * calculateInstallmentCeilings. The remaining line already represents the
 * residual available for savings & buffer.
 */
export function calculateBuyVsRentCashFlow(
  income: IncomeProfile,
  expenses: ExpenseProfile,
  wealthComparison: WealthComparisonResult,
  rentToOwn: RentToOwnResult,
): BuyVsRentCashFlowResult {
  const livingExpensesMonthly = expenses.monthlyLivingExpenses + expenses.monthlyLumpSumEquivalent;
  const debtMonthly = income.totalMonthlyDebt;

  const buildBreakdown = (housingPaymentMonthly: number): CashFlowBreakdown => {
    const remainingMonthly =
      income.grossMonthlyIncome - livingExpensesMonthly - debtMonthly - housingPaymentMonthly;
    const remainingPct =
      income.grossMonthlyIncome > 0 ? (remainingMonthly / income.grossMonthlyIncome) * 100 : 0;
    return {
      incomeMonthly: income.grossMonthlyIncome,
      livingExpensesMonthly,
      debtMonthly,
      housingPaymentMonthly,
      remainingMonthly,
      remainingPct,
      cushionStatus: classifyCushion(remainingPct),
    };
  };

  return {
    buy: buildBreakdown(wealthComparison.installmentForTargetHome),
    rent: buildBreakdown(wealthComparison.estimatedMonthlyRent),
    rentToOwn: buildBreakdown(rentToOwn.monthlyPaymentTHB),
  };
}

/**
 * Buy vs Rent over 10 years, rooted at `homePriceBasis` — either the
 * suggested home budget (purchasingPower.maxHomePrice) or the user's stated
 * target home price, depending on which BuyVsRentOption this is computing
 * (see computeCalculatorResult, which calls this twice, once per basis, so
 * the whole Buy vs Rent section can be viewed either way). Tracks each
 * scenario's actual housing outcome only:
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
 * `downPaymentAmount` is an explicit THB amount — always the user's actual
 * available down payment (answers.availableDownPayment), for both basis
 * prices, never a generic downPaymentRate-of-price figure. This keeps every
 * "Buy" installment in the app anchored to the same real cash contribution:
 * at the suggested home budget, maxHomePrice was itself built as
 * loanCapacity + this exact amount, so reusing it here keeps this
 * installment equal to purchasingPower.recommendedMonthlyInstallment; at
 * the user's stated target price, it keeps this installment equal to
 * PurchasingPowerResult.requiredMonthlyInstallmentForTarget (The Gap & The
 * Plan's "Option 2" total) — both are provably the same formula,
 * (homePriceBasis - availableDownPayment) / loanFactor, algebraically.
 */
export function calculateWealthComparison(
  homePriceBasis: number,
  downPaymentAmount: number,
  assumptions: CalculationAssumptions,
  loanTermYears: number,
  appreciationPct: number,
): WealthComparisonResult {
  const loanForTargetHome = Math.max(0, homePriceBasis - downPaymentAmount);
  const factor = loanFactor(loanTermYears, assumptions.annualInterestRate);
  const installmentForTargetHome = factor > 0 ? loanForTargetHome / factor : 0;

  const estimatedMonthlyRent = (homePriceBasis * assumptions.rentalYieldPct) / 12;
  const loanTermMonths = loanTermYears * 12;

  const years: WealthComparisonYear[] = [];
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
    const totalRentPaid = estimatedMonthlyRent * months;

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

/** Computes one full BuyVsRentOption (wealth comparison + RTO + monthly
 *  cash flow) for a single home price basis — see BuyVsRentOption's and
 *  calculateWealthComparison's docstrings for why this runs twice, once per
 *  basis, each with its own downPaymentAmount. */
function buildBuyVsRentOption(
  homePriceBasis: number,
  downPaymentAmount: number,
  assumptions: CalculationAssumptions,
  loanTermYears: number,
  appreciationPct: number,
  income: IncomeProfile,
  expenses: ExpenseProfile,
): BuyVsRentOption {
  const wealthComparison = calculateWealthComparison(
    homePriceBasis,
    downPaymentAmount,
    assumptions,
    loanTermYears,
    appreciationPct,
  );
  const rentToOwn = calculateRentToOwn(homePriceBasis, assumptions);
  const cashFlow = calculateBuyVsRentCashFlow(income, expenses, wealthComparison, rentToOwn);
  return { homePriceBasis, wealthComparison, rentToOwn, cashFlow };
}

export function computeCalculatorResult(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions = DEFAULT_ASSUMPTIONS,
): CalculatorResult {
  const income = calculateIncomeProfile(answers, assumptions);
  const expenses = resolveExpenseProfile(answers, income);
  const purchasingPower = calculatePurchasingPower(answers, assumptions);
  const actionPlan = calculateActionPlan(answers, assumptions, purchasingPower, expenses);
  const readiness = calculateReadiness(answers, purchasingPower, actionPlan);
  const advisoryNotices = getAdvisoryNotices(expenses);

  // Both bases use the SAME real down payment amount — see
  // calculateWealthComparison's docstring for why this is what keeps every
  // "Buy" installment in the app (this section, Purchasing Power, and The
  // Gap & The Plan) telling one consistent story instead of three.
  const buyVsRentByBudget = buildBuyVsRentOption(
    purchasingPower.maxHomePrice,
    answers.availableDownPayment,
    assumptions,
    purchasingPower.effectiveLoanTermYears,
    answers.expectedAppreciationPct,
    income,
    expenses,
  );
  const buyVsRentByTarget = buildBuyVsRentOption(
    answers.targetHomePrice,
    answers.availableDownPayment,
    assumptions,
    purchasingPower.effectiveLoanTermYears,
    answers.expectedAppreciationPct,
    income,
    expenses,
  );

  return {
    purchasingPower,
    actionPlan,
    readiness,
    advisoryNotices,
    buyVsRentByBudget,
    buyVsRentByTarget,
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
