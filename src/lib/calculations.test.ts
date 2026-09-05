import { describe, expect, it } from "vitest";
import {
  BUY_LOAN_TENURE_YEARS,
  calculateBuyGapNarrative,
  calculateIncomeProfile,
  calculatePurchasingPower,
  calculateRentToOwn,
  calculateWealthComparison,
  computeCalculatorResult,
  loanFactor,
  resolveExpenseProfile,
} from "./calculations";
import { DEFAULT_ANSWERS } from "./defaults";
import { DEFAULT_ASSUMPTIONS } from "../types/finance";
import type { QuestionnaireAnswers } from "../types/finance";

function withAnswers(overrides: Partial<QuestionnaireAnswers>): QuestionnaireAnswers {
  return { ...DEFAULT_ANSWERS, ...overrides };
}

describe("calculateRtoGapPlan (via computeCalculatorResult)", () => {
  it("relates the contract fee, available down payment, and contract fee gap consistently", () => {
    const answers = withAnswers({});
    const { rtoGapPlanByBudget: gapPlan } = computeCalculatorResult(answers);

    expect(gapPlan.availableDownPaymentTHB).toBe(answers.availableDownPayment);
    expect(gapPlan.rtoContractFeeGap).toBeCloseTo(
      Math.max(0, gapPlan.requiredRtoContractFee - gapPlan.availableDownPaymentTHB),
      6,
    );
    expect(gapPlan.isContractFeeGapClosed).toBe(gapPlan.rtoContractFeeGap === 0);
  });

  it("times the saving plan off the household's real monthly saving capacity", () => {
    const answers = withAnswers({});
    const income = calculateIncomeProfile(answers, DEFAULT_ASSUMPTIONS);
    const expenses = resolveExpenseProfile(answers, income);
    const { rtoGapPlanByBudget: gapPlan } = computeCalculatorResult(answers);

    expect(gapPlan.isContractFeeGapClosed).toBe(false);
    expect(expenses.monthlySavingCapacity).toBeGreaterThan(0);
    expect(gapPlan.monthsToCloseContractFeeGap).toBe(
      Math.ceil(gapPlan.rtoContractFeeGap / expenses.monthlySavingCapacity),
    );
  });

  it("returns null months-to-close when saving capacity is zero against a real gap", () => {
    // Fixed targetHomePrice (rather than the byBudget basis, which would
    // itself collapse toward ฿0 under expenses this large) keeps the
    // contract fee real and positive while still zeroing out saving
    // capacity, so isContractFeeGapClosed stays false and
    // monthsToCloseContractFeeGap hits its null branch specifically.
    const answers = withAnswers({
      targetHomePrice: 1_500_000,
      availableDownPayment: 0,
      monthlyLivingExpenses: 100_000,
    });
    const { rtoGapPlanByTarget: gapPlan } = computeCalculatorResult(answers);

    expect(gapPlan.requiredRtoContractFee).toBeGreaterThan(0);
    expect(gapPlan.isContractFeeGapClosed).toBe(false);
    expect(gapPlan.monthsToCloseContractFeeGap).toBeNull();
  });

  // RTO no longer computes its own "affordable home price" from RTO cash
  // flow (calculateRtoAffordablePrice was removed) — Buy and RTO now share
  // ONE financial-eligibility ceiling, purchasingPower.maxHomePrice. The
  // home-price-gap side of RTO's Gap & Plan is exercised via
  // calculateBuyGapNarrative directly, in the "shared Recommended Home
  // Price" tests below, rather than through computeCalculatorResult's
  // rtoGapPlanByBudget/ByTarget (which now only carries the RTO-specific
  // contract-fee and monthly-cushion figures — see RtoGapPlanResult).

  it("excludes annual bonus from the income used for Remaining Monthly Income", () => {
    // Fixed targetHomePrice (rather than the byBudget basis) so the RTO
    // price itself stays identical between the two scenarios — bonus does
    // legitimately grow bank-qualifying income (and so purchasingPower.
    // maxHomePrice) elsewhere in the app; isolating that lets this test
    // check only whether bonus leaks into Remaining Monthly Income's own
    // income figure, not a downstream home-price side effect.
    const withoutBonus = withAnswers({ bonusAnnual: 0, targetHomePrice: 1_940_000 });
    const withBonus = withAnswers({ bonusAnnual: 120_000, targetHomePrice: 1_940_000 });

    const resultWithoutBonus = computeCalculatorResult(withoutBonus);
    const resultWithBonus = computeCalculatorResult(withBonus);

    expect(resultWithBonus.rtoGapPlanByTarget.remainingMonthlyTHB).toBeCloseTo(
      resultWithoutBonus.rtoGapPlanByTarget.remainingMonthlyTHB,
      6,
    );
  });

  it("derives hasMonthlyShortfall/monthlyShortfallTHB from RTO's own monthly payment, not Buy's installment math", () => {
    const answers = withAnswers({ targetHomePrice: 1_940_000 });
    const result = computeCalculatorResult(answers);
    const { rtoGapPlanByTarget: gapPlan, buyVsRentByTarget } = result;

    expect(gapPlan.monthlyPaymentTHB).toBeCloseTo(buyVsRentByTarget.rentToOwn.monthlyPaymentTHB, 6);
    expect(gapPlan.hasMonthlyShortfall).toBe(buyVsRentByTarget.cashFlow.rentToOwn.remainingMonthly < 0);
    expect(gapPlan.monthlyShortfallTHB).toBeCloseTo(
      gapPlan.hasMonthlyShortfall ? Math.abs(buyVsRentByTarget.cashFlow.rentToOwn.remainingMonthly) : 0,
      6,
    );
  });

  it("reports a genuinely different monthly shortfall for RTO than Buy would have at the same home price, when their monthly payments differ", () => {
    const answers = withAnswers({ targetHomePrice: 1_940_000 });
    const result = computeCalculatorResult(answers);
    const { buyVsRentByTarget } = result;

    // RTO's monthly payment (a flat per-million rate on the marked-up RTO
    // contract price) and Buy's mortgage installment (amortized over
    // BUY_LOAN_TENURE_YEARS on the assumed minimum down payment) are
    // different financing mechanics — they need not, and generally will
    // not, produce the same monthly cash-flow shortfall/cushion.
    expect(buyVsRentByTarget.cashFlow.rentToOwn.housingPaymentMonthly).not.toBeCloseTo(
      buyVsRentByTarget.cashFlow.buy.housingPaymentMonthly,
      0,
    );
  });
});

describe("calculateBuyGapNarrative (shared Recommended Home Price for Buy and RTO)", () => {
  it("reports zero home price gap once homePriceBasis is within the shared Recommended Home Price", () => {
    const answers = withAnswers({});
    const { purchasingPower } = computeCalculatorResult(answers);
    const narrative = calculateBuyGapNarrative(
      purchasingPower.maxHomePrice,
      purchasingPower,
      DEFAULT_ASSUMPTIONS,
      answers.availableDownPayment,
    );

    expect(narrative.priceGap).toBe(0);
    expect(narrative.isPriceGapClosed).toBe(true);
  });

  it("reports the same home price gap for any basis above the shared Recommended Home Price, whichever financing option asks for it", () => {
    // RtoContent in GapAndPlan.tsx calls this exact function (not a second,
    // RTO-specific affordability calculation) for RTO's own "Home price
    // gap" row — this is what guarantees the two options can never disagree
    // on what "the recommended affordable home price" is.
    const answers = withAnswers({});
    const { purchasingPower } = computeCalculatorResult(answers);
    const basis = purchasingPower.maxHomePrice + 500_000;
    const narrative = calculateBuyGapNarrative(basis, purchasingPower, DEFAULT_ASSUMPTIONS, answers.availableDownPayment);

    expect(narrative.priceGap).toBeCloseTo(500_000, 6);
    expect(narrative.isPriceGapClosed).toBe(false);
  });
});

describe("calculateIncomeProfile (co-borrower income/debt symmetry)", () => {
  it("counts co-borrower income at the same full weight as additional income, unlike bonus", () => {
    const withoutCoBorrower = withAnswers({});
    const withCoBorrower = withAnswers({ coBorrowerIncomeMonthly: 20_000 });

    const base = calculateIncomeProfile(withoutCoBorrower, DEFAULT_ASSUMPTIONS);
    const withIncome = calculateIncomeProfile(withCoBorrower, DEFAULT_ASSUMPTIONS);

    // Full weight: +20,000 lands in both steadyMonthlyIncome AND
    // bankQualifyingMonthlyIncome verbatim — no variableIncomeWeight
    // discount, unlike bonusAnnual.
    expect(withIncome.steadyMonthlyIncome).toBeCloseTo(base.steadyMonthlyIncome + 20_000, 6);
    expect(withIncome.bankQualifyingMonthlyIncome).toBeCloseTo(
      base.bankQualifyingMonthlyIncome + 20_000,
      6,
    );
  });

  it("adds co-borrower debt to totalMonthlyDebt, symmetrically with co-borrower income", () => {
    const answers = withAnswers({ coBorrowerDebtMonthly: 5_000 });
    const income = calculateIncomeProfile(answers, DEFAULT_ASSUMPTIONS);
    const base = calculateIncomeProfile(withAnswers({}), DEFAULT_ASSUMPTIONS);

    expect(income.totalMonthlyDebt).toBeCloseTo(base.totalMonthlyDebt + 5_000, 6);
  });

  it("a co-borrower's income no longer inflates affordability for free — matching co-borrower debt pulls it back down", () => {
    // The original concern this feature fixes: counting a co-borrower's
    // income without their debt would overstate maxHomePrice. With both
    // counted, a co-borrower who earns 20,000/mo but also owes 20,000/mo in
    // debt service should land close to where they started, not strictly
    // better off.
    const incomeOnly = computeCalculatorResult(withAnswers({ coBorrowerIncomeMonthly: 20_000 }));
    const incomeAndDebt = computeCalculatorResult(
      withAnswers({ coBorrowerIncomeMonthly: 20_000, coBorrowerDebtMonthly: 20_000 }),
    );

    expect(incomeAndDebt.purchasingPower.maxHomePrice).toBeLessThan(
      incomeOnly.purchasingPower.maxHomePrice,
    );
  });
});

describe("calculatePurchasingPower (Recommended Home Price = pure affordability ceiling)", () => {
  it("computes maxHomePrice as loanCapacity / (1 - downPaymentRate)", () => {
    const answers = withAnswers({});
    const purchasingPower = calculatePurchasingPower(answers, DEFAULT_ASSUMPTIONS);

    expect(purchasingPower.maxHomePrice).toBeCloseTo(
      purchasingPower.loanCapacity / (1 - DEFAULT_ASSUMPTIONS.downPaymentRate),
      6,
    );
  });

  it("does not change when available down payment changes, holding income/debt fixed", () => {
    // The core property this model change is about: maxHomePrice represents
    // borrowing/repayment capacity only — today's cash on hand must never
    // move it, in either direction.
    const thin = calculatePurchasingPower(withAnswers({ availableDownPayment: 0 }), DEFAULT_ASSUMPTIONS);
    const flush = calculatePurchasingPower(
      withAnswers({ availableDownPayment: 5_000_000 }),
      DEFAULT_ASSUMPTIONS,
    );

    expect(flush.maxHomePrice).toBeCloseTo(thin.maxHomePrice, 6);
    expect(flush.loanCapacity).toBeCloseTo(thin.loanCapacity, 6);
  });

  it("keeps the Buy vs Rent comparison's Recommended-basis installment exactly equal to recommendedMonthlyInstallment", () => {
    // The consistency fix: byBudget's down payment amount must be the
    // assumed minimum (maxHomePrice * downPaymentRate), not the household's
    // real cash — otherwise this scenario's loan (and so its installment)
    // would silently diverge from the Purchasing Power card shown one
    // section up on the same page.
    const answers = withAnswers({});
    const result = computeCalculatorResult(answers);

    expect(result.buyVsRentByBudget.wealthComparison.installmentForTargetHome).toBeCloseTo(
      result.purchasingPower.recommendedMonthlyInstallment,
      6,
    );
    expect(result.buyVsRentByBudget.wealthComparison.loanForTargetHome).toBeCloseTo(
      result.purchasingPower.loanCapacity,
      6,
    );
  });

  it("Target-basis Buy loan/installment also uses the assumed minimum down payment, not real cash — same standard financing assumption as Recommended", () => {
    const thin = computeCalculatorResult(withAnswers({ targetHomePrice: 3_000_000, availableDownPayment: 0 }));
    const flush = computeCalculatorResult(
      withAnswers({ targetHomePrice: 3_000_000, availableDownPayment: 2_000_000 }),
    );

    // Real cash must not move byTarget's modeled loan/installment at all —
    // both scenarios assume the same minimum down payment rate regardless
    // of what the household actually has on hand.
    expect(flush.buyVsRentByTarget.wealthComparison.loanForTargetHome).toBeCloseTo(
      thin.buyVsRentByTarget.wealthComparison.loanForTargetHome,
      6,
    );
    expect(flush.buyVsRentByTarget.wealthComparison.installmentForTargetHome).toBeCloseTo(
      thin.buyVsRentByTarget.wealthComparison.installmentForTargetHome,
      6,
    );
    expect(thin.buyVsRentByTarget.wealthComparison.loanForTargetHome).toBeCloseTo(
      3_000_000 * (1 - DEFAULT_ASSUMPTIONS.downPaymentRate),
      6,
    );

    // The Down Payment Gap, meanwhile, DOES still depend on real cash — the
    // two questions (modeled loan vs. cash-readiness) stay independent.
    expect(thin.actionPlan.remainingDownPayment).toBeGreaterThan(flush.actionPlan.remainingDownPayment);
  });

  it("closes a home price gap with exactly the installment increase the new maxHomePrice formula implies", () => {
    // additionalMonthlyInstallmentNeeded must account for maxHomePrice's
    // loanCapacity/(1-downPaymentRate) construction — feeding
    // requiredMonthlyInstallmentForTarget back through that same formula
    // should land exactly on the target price, not merely reduce the gap.
    const answers = withAnswers({ targetHomePrice: 3_000_000 });
    const purchasingPower = calculatePurchasingPower(answers, DEFAULT_ASSUMPTIONS);
    const narrative = calculateBuyGapNarrative(
      answers.targetHomePrice,
      purchasingPower,
      DEFAULT_ASSUMPTIONS,
      answers.availableDownPayment,
    );

    const factor = loanFactor(BUY_LOAN_TENURE_YEARS, DEFAULT_ASSUMPTIONS.annualInterestRate);
    const impliedLoanCapacity = narrative.requiredMonthlyInstallmentForTarget * factor;
    const impliedMaxHomePrice = impliedLoanCapacity / (1 - DEFAULT_ASSUMPTIONS.downPaymentRate);

    expect(impliedMaxHomePrice).toBeCloseTo(answers.targetHomePrice, 0);
  });
});

describe("calculateWealthComparison (rent grows with property appreciation)", () => {
  const homePriceBasis = 3_000_000;
  const appreciationPct = 0.04;

  it("keeps the top-level Estimated Monthly Rent as today's snapshot, unaffected by the growth model", () => {
    const result = calculateWealthComparison(
      homePriceBasis,
      DEFAULT_ASSUMPTIONS,
      BUY_LOAN_TENURE_YEARS,
      appreciationPct,
    );

    expect(result.estimatedMonthlyRent).toBeCloseTo(
      (homePriceBasis * DEFAULT_ASSUMPTIONS.rentalYieldPct) / 12,
      6,
    );
  });

  it("year 1's cumulative rent equals exactly 12 * estimatedMonthlyRent, then grows in later years", () => {
    const result = calculateWealthComparison(
      homePriceBasis,
      DEFAULT_ASSUMPTIONS,
      BUY_LOAN_TENURE_YEARS,
      appreciationPct,
    );

    expect(result.years[0].totalRentPaid).toBeCloseTo(result.estimatedMonthlyRent * 12, 6);

    // Year 2's INCREMENT over year 1 must exceed year 1's own annual rent —
    // i.e. rent in year 2 is higher than rent in year 1, not flat.
    const year1Annual = result.years[0].totalRentPaid;
    const year2Increment = result.years[1].totalRentPaid - result.years[0].totalRentPaid;
    expect(year2Increment).toBeGreaterThan(year1Annual);
  });

  it("does NOT assume flat rent with appreciationPct = 0 (sanity: growth model degrades to flat correctly)", () => {
    const result = calculateWealthComparison(
      homePriceBasis,
      DEFAULT_ASSUMPTIONS,
      BUY_LOAN_TENURE_YEARS,
      0,
    );

    expect(result.years[9].totalRentPaid).toBeCloseTo(result.estimatedMonthlyRent * 120, 6);
  });

  it("Buy vs Rent's 10-year Rent total reads the wealth projection's growing total, not a flat multiply", () => {
    const answers = withAnswers({ targetHomePrice: homePriceBasis, expectedAppreciationPct: appreciationPct });
    const result = computeCalculatorResult(answers);
    const wealth = result.buyVsRentByTarget.wealthComparison;
    const yearTen = wealth.years[wealth.years.length - 1];

    expect(result.buyVsRentByTarget.cashFlow.rent.totalPaidOver10YearsTHB).toBeCloseTo(
      yearTen.totalRentPaid,
      6,
    );
    // The old (wrong) flat assumption would have been lower than the real,
    // growing-rent total whenever appreciation is positive.
    expect(result.buyVsRentByTarget.cashFlow.rent.totalPaidOver10YearsTHB).toBeGreaterThan(
      wealth.estimatedMonthlyRent * 120,
    );
  });

  it("leaves Buy's 10-year total flat (mortgage payment is genuinely fixed for all 10 years)", () => {
    const answers = withAnswers({ targetHomePrice: homePriceBasis, expectedAppreciationPct: appreciationPct });
    const result = computeCalculatorResult(answers);
    const { buy } = result.buyVsRentByTarget.cashFlow;

    expect(buy.totalPaidOver10YearsTHB).toBeCloseTo(
      buy.housingPaymentMonthly * 120 + buy.initialPaymentTHB,
      6,
    );
  });

  it("does NOT compute RTO's 10-year total as a flat monthlyPaymentTHB * 120 (RTO transitions to a mortgage at year 3)", () => {
    const answers = withAnswers({ targetHomePrice: homePriceBasis, expectedAppreciationPct: appreciationPct });
    const result = computeCalculatorResult(answers);
    const { rentToOwn } = result.buyVsRentByTarget.cashFlow;

    expect(rentToOwn.totalPaidOver10YearsTHB).not.toBeCloseTo(
      rentToOwn.housingPaymentMonthly * 120 + rentToOwn.initialPaymentTHB,
      6,
    );
  });
});

describe("calculateRentToOwn (3-year RTO pathway transitions to a normal mortgage)", () => {
  const homePriceBasis = 3_000_000;

  it("computes remainingPrincipalAfter3YearsTHB from rtoPriceTHB, not homePriceBasis", () => {
    const result = calculateRentToOwn(homePriceBasis, DEFAULT_ASSUMPTIONS, 0);

    expect(result.remainingPrincipalAfter3YearsTHB).toBeCloseTo(
      result.rtoPriceTHB - result.paidTowardPriceAfter3YearsTHB,
      6,
    );
  });

  it("computes postTransitionMonthlyPaymentTHB as a standard mortgage installment on the remaining principal", () => {
    const result = calculateRentToOwn(homePriceBasis, DEFAULT_ASSUMPTIONS, 0);
    const factor = loanFactor(BUY_LOAN_TENURE_YEARS, DEFAULT_ASSUMPTIONS.annualInterestRate);

    expect(result.postTransitionMonthlyPaymentTHB).toBeCloseTo(
      result.remainingPrincipalAfter3YearsTHB / factor,
      6,
    );
  });

  it("computes totalPaidOver10YearsTHB as contractFee + 3 years RTO + 7 years post-transition mortgage", () => {
    const result = calculateRentToOwn(homePriceBasis, DEFAULT_ASSUMPTIONS, 0);

    expect(result.totalPaidOver10YearsTHB).toBeCloseTo(
      result.contractFeeTHB + result.monthlyPaymentTHB * 36 + result.postTransitionMonthlyPaymentTHB * 84,
      6,
    );
  });

  it("does NOT equal contractFee + monthlyPaymentTHB * 120 (the old flat-RTO-for-10-years assumption)", () => {
    const result = calculateRentToOwn(homePriceBasis, DEFAULT_ASSUMPTIONS, 0);

    expect(result.totalPaidOver10YearsTHB).not.toBeCloseTo(
      result.contractFeeTHB + result.monthlyPaymentTHB * 120,
      6,
    );
  });
});
