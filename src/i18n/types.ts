import type {
  AdvisoryNoticeKey,
  ArchetypeKey,
  CashFlowRiskLevel,
  EmploymentType,
  HomePurchasePurpose,
  ReadinessStatus,
} from "../types/finance";

export type Language = "en" | "th";

/** Every user-facing string in the app, grouped by where it appears.
 *  Both `en` and `th` must satisfy this shape — a missing translation is a
 *  compile error, not a silently blank label. */
export interface Translations {
  header: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };

  footer: {
    note: string;
  };

  common: {
    yes: string;
    no: string;
  };

  form: {
    stepLabels: [string, string, string, string, string, string];
    back: string;
    next: string;
    seeResults: string;
    incomeRequired: string;
    priceRequired: string;
  };

  income: {
    salary: string;
    salaryHelp: string;
    bonus: string;
    bonusHelp: string;
  };

  debt: {
    homeLoan: string;
    homeLoanHelp: string;
    otherDebt: string;
    otherDebtHelp: string;
  };

  expenses: {
    livingExpenses: string;
    livingExpensesHelp: string;
    annualLumpSum: string;
    annualLumpSumHelp: string;
    isRentingQuestion: string;
    rent: string;
    rentHelp: string;
  };

  savings: {
    totalSavings: string;
    totalSavingsHelp: string;
    downPayment: string;
    downPaymentHelp: string;
    maxInstallment: string;
    maxInstallmentHelp: string;
  };

  aboutYou: {
    age: string;
    ageHelp: string;
    employmentType: string;
    employmentTypeHelp: string;
    employmentTypeOptions: Record<EmploymentType, string>;
  };

  homeGoals: {
    targetPrice: string;
    timeline: string;
    timelineHelp: (years: string) => string;
    monthsUnit: (months: number) => string;
    purchasePurpose: string;
    purchasePurposeHelp: string;
    purchasePurposeOptions: Record<HomePurchasePurpose, string>;
    /** Static remark explaining the fixed appreciation default, shown in
     *  place of the (removed) appreciation slider. */
    appreciationNote: (formattedPct: string) => string;
    /** Static remark explaining the auto-calculated loan tenure, shown in
     *  place of the (removed) loan-term picker. timelineYears is the
     *  ceil(targetTimelineMonths / 12) figure the age gets pushed forward by
     *  before checking the maturity cap — the loan originates at purchase,
     *  not today, so the timeline counts against the cap too. */
    loanTenureNote: (years: number, age: number, maxAge: number, timelineYears: number) => string;
    /** Static disclosure of the other fixed lending assumptions (interest
     *  rate, DSR, transaction costs) — previously shown on its own "Loan
     *  preferences" step, now folded into the last step of the form. */
    assumptionsNote: string;
  };

  results: {
    heading: string;
    editAnswers: string;
    disclaimer: string;

    readiness: {
      eyebrow: string;
      statusLabels: Record<ReadinessStatus, string>;
      archetypeLabels: Record<ArchetypeKey, string>;
    };

    purchasingPower: {
      eyebrow: string;
      title: string;
      /** Estimated max affordable home price — a pure purchasing-power
       *  figure (income, debt, loan capacity, available down-payment cash). */
      homeBudget: string;
      homeBudgetCaption: string;
      installment: string;
      perMonth: (formattedAmount: string) => string;
      /** Third stat tile — the loan tenor (term) actually usable after the
       *  age-based maturity cap, i.e. PurchasingPowerResult.effectiveLoanTermYears. */
      loanTenure: string;
      loanTenureValue: (years: number) => string;
      loanTenureCaption: (age: number, maxAge: number, timelineYears: number) => string;
      zoneBarLabel: string;
      yourTarget: (formattedPrice: string) => string;
      safeUpTo: (formatted: string) => string;
      stretchUpTo: (formatted: string) => string;
      riskAbove: (formatted: string) => string;
      /** One-sentence reason the recommended installment landed where it
       *  did — rendered directly under that stat's value. Three-way, since
       *  the bank DSR ceiling, the household budget ceiling, and the user's
       *  own comfort ceiling are all independently in play. */
      installmentRationale: {
        dsrBinding: (dsr: string) => string;
        budgetBinding: (budget: string) => string;
        comfortBinding: (comfortable: string, nextCeiling: string) => string;
      };
    };

    advisoryNotices: {
      eyebrow: string;
      title: string;
      note: string;
      items: Record<AdvisoryNoticeKey, string | ((formattedAmount: string) => string)>;
    };

    gapAndPlan: {
      eyebrow: string;
      title: string;
      gapLabel: string;
      /** Shown when purchasingPower.isPriceGapClosed is true. */
      gapReady: string;
      /** purchasingPower.priceGap framing: "does my loan-approved budget
       *  reach the target price," not a cash-at-closing question. */
      gapShort: (formattedGap: string, formattedTarget: string) => string;
      planLabel: string;
      /** Shown when purchasingPower.isPriceGapClosed is true. */
      planReady: string;
      /** Plan option 1 — additionalDownPaymentNeeded. */
      planOptionDownPayment: (formattedAmount: string) => string;
      /** Plan option 2 — additionalMonthlyInstallmentNeeded +
       *  requiredMonthlyInstallmentForTarget. */
      planOptionInstallment: (formattedAdditional: string, formattedTotal: string) => string;
      /** Always-shown reminder (not conditional, unlike the suggestions
       *  below) that transfer + mortgage-registration fees are a real cash
       *  cost on top of the down payment — shown at both the estimated
       *  home budget (maxHomePrice) and the target home price, since the
       *  actual fee depends on which price the buyer ends up at. */
      transactionFeeNoteLabel: string;
      transactionFeeNote: (
        formattedFeeAtAffordable: string,
        formattedAffordablePrice: string,
        formattedFeeAtTarget: string,
        formattedTargetPrice: string,
      ) => string;
      alternativesLabel: string;
      suggestions: {
        /** [fact, suggestion] — two separate bullet points (the gap itself,
         *  then what to do about it), rather than one combined sentence. */
        overRiskBudget: (formattedAmount: string) => [string, string];
        stretchZone: [string, string];
        noSavingPlan: string;
        comfortLimited: string;
        lowEmergencyCushion: (formattedAmount: string) => string;
      };
      keepInMindLabel: string;
      keepInMindText: string;
    };

    buyVsRent: {
      eyebrow: string;
      title: string;

      /** Toggle governing every number in this section: whichever home
       *  price basis is selected (the suggested home budget, or the user's
       *  stated target price) is what RTO, monthly cash flow, and the
       *  10-year value all get computed from — see BuyVsRentOption. */
      basisToggle: {
        label: string;
        budgetOption: (formattedPrice: string) => string;
        targetOption: (formattedPrice: string) => string;
      };

      /** Section 1 — the page's primary visual focus: the selected basis
       *  price vs. its estimated value after 10 years of compounding
       *  appreciation. A structural fact about buying, so this swaps out
       *  for `rentNote` / `rentToOwnNote` while a different slide is active
       *  — renting builds no equivalent asset, by definition, and
       *  Rent-to-Own builds toward ownership on its own (RTO-sourced)
       *  terms, so showing the buy-side value figure on those slides would
       *  misleadingly imply otherwise. (Deliberately no equity figure
       *  alongside the value: mixing a pure appreciation number with a
       *  loan-amortization-dependent one in the same headline was found
       *  confusing.) */
      valueHighlight: {
        eyebrow: string;
        /** Label above the "today" figure — depends on which basisToggle
         *  option is selected, so it never says "Estimated home budget"
         *  while actually showing the target price, or vice versa. */
        todayLabelBudget: string;
        todayLabelTarget: string;
        futureLabel: string;
        /** Lowercase noun phrases ("your suggested home budget" / "your
         *  target home price") interpolated into growthNote below. */
        basisLabelBudget: string;
        basisLabelTarget: string;
        growthNote: (formattedPrice: string, formattedAppreciationPct: string, basisLabel: string) => string;
        /** Shown in place of the value figures while the Rent slide is active. */
        rentNote: string;
        /** Shown in place of the value figures while the Rent-to-Own slide
         *  is active — the "path toward ownership" figure, sourced from
         *  RentToOwnResult.paidTowardPriceAfter3YearsTHB. */
        rentToOwnNote: (formattedPaidDown: string) => string;
      };

      /** Section 2 — one scenario at a time (Rent, Rent-to-Own, Buy),
       *  swiped/dragged between. Each slide is self-contained: housing
       *  payment, remaining cash flow, status badge, a supporting
       *  description, and a per-scenario income allocation bar (living
       *  expenses + debt are identical across all three scenarios; housing
       *  and remaining are the lines that actually differ — see
       *  CashFlowBreakdown). */
      comparisonTitle: string;
      swipeHint: string;
      scenarioRent: string;
      scenarioRentToOwn: string;
      scenarioBuy: string;
      /** One short, neutral sentence on each card naming that option's key
       *  benefit — not a verdict, just a plain-language cue. */
      scenarioNotes: {
        rent: string;
        rentToOwn: string;
        buy: string;
      };
      /** Per-scenario label for the housing-payment line/tile — "housing
       *  payment" reads oddly for a scenario that's literally rent, so each
       *  scenario names its own payment. */
      housingPaymentLabels: {
        rent: string;
        rentToOwn: string;
        buy: string;
      };
      metrics: {
        remainingLabel: string;
        remainingPctCaption: (pct: string) => string;
        cushionStatusLabels: Record<CashFlowRiskLevel, string>;
        income: string;
        /** Hover/focus popup on "Money left over each month" — dynamically
         *  names the actual biggest driver(s) behind that scenario's
         *  number, computed from the user's own income/housing/living/debt
         *  figures rather than a generic message. */
        remainingExplanation: {
          /** aria-label for the trigger. */
          infoLabel: string;
          /** No housing, living, or debt cost at all — a rare edge case. */
          noExpenses: string;
          shortfall: (formattedShortfall: string, topFactorLabel: string, topFactorPct: string) => string;
          shortfallWithSecond: (
            formattedShortfall: string,
            topFactorLabel: string,
            topFactorPct: string,
            secondFactorLabel: string,
            secondFactorPct: string,
          ) => string;
          tight: (topFactorLabel: string, topFactorPct: string) => string;
          tightWithSecond: (
            topFactorLabel: string,
            topFactorPct: string,
            secondFactorLabel: string,
            secondFactorPct: string,
          ) => string;
          comfortable: (topFactorLabel: string, remainingPct: string) => string;
        };
      };
      /** Per-scenario income breakdown: income at the center, its major
       *  outflows (living expenses, housing, debt) as supporting tiles. */
      allocation: {
        title: string;
        livingExpenses: string;
        debt: string;
      };
      previousCard: string;
      nextCard: string;

      /** Section 4 — neutral 3-way recap. Never frames any option as the
       *  "winner"; states each option's own key trade-off (grounded in that
       *  option's real monthly payment) and leaves the choice to the
       *  reader's own priorities. */
      recommendation: {
        eyebrow: string;
        rentSummary: (formattedPayment: string) => string;
        rentToOwnSummary: (formattedPayment: string) => string;
        buySummary: (formattedPayment: string) => string;
      };

      /** basisLabel: same lowercase noun phrase as valueHighlight.basisLabelBudget
       *  / basisLabelTarget — this footnote must name whichever basis is
       *  actually active, not hardcode "target home price". */
      rentEstimateNote: (formattedYield: string, formattedRent: string, basisLabel: string) => string;
      /** Footnote disclosing the Rent-to-Own assumptions, analogous to
       *  rentEstimateNote — sourced from RTO-Payment.xlsx. */
      rentToOwnEstimateNote: (formattedContractFee: string, formattedMarkupPct: string, basisLabel: string) => string;
    };
  };

  /** Admin/debug view — a live sandbox exposing the 6 core assumptions
   *  (DEFAULT_ASSUMPTIONS in finance.ts) as editable controls next to the
   *  full results dashboard, so a reviewer can see how tuning any single
   *  assumption ripples through every downstream number. Never alters the
   *  assumptions the normal questionnaire flow uses. */
  master: {
    /** Top-left header button that opens/closes this view. */
    toggleLabel: string;
    title: string;
    subtitle: string;
    assumptionsTitle: string;
    /** Title above the accordion of all 6 questionnaire steps (Income,
     *  Debt, Expenses, Savings, About You, Home Goals), reusing
     *  form.stepLabels for each section's own header. */
    answersTitle: string;
    resultsTitle: string;
    resetButton: string;
    closeButton: string;
    assumptionLabels: {
      debtServiceRatio: string;
      annualInterestRate: string;
      downPaymentRate: string;
      safeBudgetMultiplier: string;
      stretchBudgetMultiplier: string;
      riskZoneMultiplier: string;
    };
  };
}
