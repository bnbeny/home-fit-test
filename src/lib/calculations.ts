import {
  type ActionPlanResult,
  type AdvisoryNotice,
  type AlternativeSuggestion,
  type ArchetypeKey,
  type BindingInstallmentCeiling,
  type BuyVsRentCashFlowResult,
  type CalculationAssumptions,
  type CalculatorResult,
  type CashFlowBreakdown,
  type CashFlowRiskLevel,
  type HomePriceLimitingFactor,
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
 *  age at loan maturity. Always returns a usable term (floors at
 *  minLoanTermYears, caps at maxLoanTermYearsCap). */
export function calculateMaxLoanTermYears(
  applicantAge: number,
  assumptions: CalculationAssumptions,
): number {
  return clamp(
    assumptions.maxAgeAtLoanMaturity - applicantAge,
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
  const effectiveLoanTermYears = calculateMaxLoanTermYears(answers.applicantAge, assumptions);
  const factor = loanFactor(effectiveLoanTermYears, assumptions.annualInterestRate);
  const loanCapacity = ceilings.recommendedMonthlyInstallment * factor;

  // Home-price ceiling, correctly enforcing the minimum down-payment ratio
  // instead of naively adding loan + cash without any equity check.
  //
  // Purchasing power is deliberately about capacity only — what income, debt,
  // and available cash support — and does NOT subtract transaction costs.
  // Those are a closing expense, not a factor in how big a home you can
  // afford; they're accounted for separately in calculateActionPlan's
  // requiredCashAtClosing, which is the "do I have enough cash to close"
  // question. Netting them against the down-payment pool here would make
  // maxHomePrice (and everything derived from it — safeBudget, stretchBudget,
  // the readiness budgetFit sub-score) obscure the simple, expected identity
  // below, conflating "how much home can I afford" with "do I have enough
  // cash on top of that to close."
  //
  // Two independent caps on candidate price P:
  //   loan-capacity cap:   P <= L + C   (loan plus all available cash)
  //   minimum-equity cap:  P <= C / r   (cash must be >= r% of price)
  // The lower one binds. Because neither branch subtracts anything from C,
  // maxHomePrice always equals estimatedLoanAmount + availableDownPayment
  // exactly — verified below rather than assumed.
  const availableForDownPayment = answers.availableDownPayment;
  const r = assumptions.downPaymentRate;

  let maxHomePrice: number;
  let homePriceLimitingFactor: HomePriceLimitingFactor;
  if (availableForDownPayment <= 0) {
    maxHomePrice = 0;
    homePriceLimitingFactor = "insufficient-closing-cash";
  } else {
    const priceByLoan = loanCapacity + availableForDownPayment;
    const priceByCash = availableForDownPayment / r;
    if (priceByLoan <= priceByCash) {
      maxHomePrice = priceByLoan;
      homePriceLimitingFactor = "loan-capacity";
    } else {
      maxHomePrice = priceByCash;
      homePriceLimitingFactor = "equity-requirement";
    }
  }
  maxHomePrice = Math.max(0, maxHomePrice);

  // Loan actually needed to reach maxHomePrice — can be less than
  // loanCapacity when available cash, not loan capacity, is what binds.
  // maxHomePrice = estimatedLoanAmount + availableDownPayment, always.
  const estimatedLoanAmount = Math.max(0, maxHomePrice - availableForDownPayment);

  // Budget zones give the user a spending range rather than one brittle
  // number. Safe = comfortable cushion below capacity; Stretch = exactly at
  // capacity; Risk = anything meaningfully above it. Percentages are a
  // product judgment call, not a regulatory figure — tune freely.
  const safeBudget = maxHomePrice * 0.85;
  const stretchBudget = maxHomePrice * 1.0;
  const riskZoneThreshold = maxHomePrice * 1.06;

  const isOverStretchBudget = answers.targetHomePrice > stretchBudget;
  const overStretchAmount = Math.max(0, answers.targetHomePrice - stretchBudget);

  return {
    affordableByDSR: ceilings.affordableByDSR,
    affordableByBudget: ceilings.affordableByBudget,
    recommendedMonthlyInstallment: ceilings.recommendedMonthlyInstallment,
    bindingInstallmentCeiling: ceilings.bindingInstallmentCeiling,
    effectiveLoanTermYears,
    loanCapacity,
    estimatedLoanAmount,
    maxHomePrice,
    homePriceLimitingFactor,
    safeBudget,
    stretchBudget,
    riskZoneThreshold,
    isOverStretchBudget,
    overStretchAmount,
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

export function calculateReadiness(
  answers: QuestionnaireAnswers,
  purchasingPower: PurchasingPowerResult,
  actionPlan: ActionPlanResult,
): ReadinessResult {
  // Three independent lenses on "can they buy this home": can they cover
  // cash needed at closing today, does their loan capacity reach the price,
  // and will their saving rate get them there on their own timeline.
  // Equal-weighted average keeps the model simple and explainable to a
  // non-technical user.
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
    (closingCashCoverage + budgetFit + timelineFit) / 3,
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
 * cell each value traces back to. Rooted at the user's stated target home
 * price, the same basis calculateWealthComparison uses for Buy and Rent, so
 * all three housing options price the same home.
 */
export function calculateRentToOwn(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
): RentToOwnResult {
  const rtoPriceTHB = answers.targetHomePrice * (1 + assumptions.rtoPriceMarkupRate);
  const contractFeeTHB = answers.targetHomePrice * assumptions.rtoContractFeeRate;
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
 * Buy vs Rent over 10 years, for the TARGET home price (consistent with the
 * Gap & Plan section, deliberately not maxHomePrice, so this compares the
 * home the user actually wants). Tracks each scenario's actual housing
 * outcome only:
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
 */
export function calculateWealthComparison(
  answers: QuestionnaireAnswers,
  assumptions: CalculationAssumptions,
  purchasingPower: PurchasingPowerResult,
): WealthComparisonResult {
  const loanForTargetHome = Math.max(
    0,
    answers.targetHomePrice * (1 - assumptions.downPaymentRate),
  );
  const factor = loanFactor(purchasingPower.effectiveLoanTermYears, assumptions.annualInterestRate);
  const installmentForTargetHome = factor > 0 ? loanForTargetHome / factor : 0;

  const estimatedMonthlyRent = (answers.targetHomePrice * assumptions.rentalYieldPct) / 12;
  const loanTermMonths = purchasingPower.effectiveLoanTermYears * 12;

  const years: WealthComparisonYear[] = [];
  for (let year = 1; year <= 10; year++) {
    const months = year * 12;
    const homeValue = answers.targetHomePrice * Math.pow(1 + answers.expectedAppreciationPct, year);
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

  const affordableHomeValueYear10 = calculateAffordableHomeValueYear10(answers, purchasingPower);

  return {
    years,
    estimatedMonthlyRent,
    installmentForTargetHome,
    loanForTargetHome,
    affordableHomeValueYear10,
  };
}

/**
 * The year-10 home-value figure for the "10-Year Home Value" headline —
 * rooted at the SUGGESTED affordable home price (purchasingPower.maxHomePrice),
 * not the user's stated target home price. Pure appreciation compounding,
 * same formula as each `years` entry's homeValue; only the home price input
 * differs.
 */
export function calculateAffordableHomeValueYear10(
  answers: QuestionnaireAnswers,
  purchasingPower: PurchasingPowerResult,
): number {
  return purchasingPower.maxHomePrice * Math.pow(1 + answers.expectedAppreciationPct, 10);
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
  const wealthComparison = calculateWealthComparison(answers, assumptions, purchasingPower);
  const rentToOwn = calculateRentToOwn(answers, assumptions);
  const buyVsRentCashFlow = calculateBuyVsRentCashFlow(income, expenses, wealthComparison, rentToOwn);
  return {
    purchasingPower,
    actionPlan,
    readiness,
    advisoryNotices,
    buyVsRentCashFlow,
    wealthComparison,
    rentToOwn,
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
