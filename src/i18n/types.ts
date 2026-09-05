import type {
  AdvisoryNoticeKey,
  ArchetypeKey,
  CashFlowRiskLevel,
  EmploymentType,
  GapPlanScenario,
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
    /** Order: About You, Home Goals, Income, Debt, Expenses, Savings. */
    stepLabels: [string, string, string, string, string, string];
    back: string;
    next: string;
    seeResults: string;
    incomeRequired: string;
    priceRequired: string;
  };

  income: {
    /** Toggle governing every slider below: whether the entered amounts are
     *  monthly or annual. Display-only — always converted to/from monthly
     *  before reaching QuestionnaireAnswers (see StepIncome). */
    displayModeLabel: string;
    displayModeMonthly: string;
    displayModeAnnual: string;
    primary: string;
    primaryHelp: string;
    additional: string;
    additionalHelp: string;
    bonus: string;
    bonusHelp: string;
    /** Section heading set off by a divider (see StepIncome) — keeps the
     *  co-borrower field visually distinct from the applicant's own income
     *  above, so it doesn't read as another "your own income" field. */
    coBorrowerSectionLabel: string;
    /** Optional — a co-borrower's regular monthly income, counted at full
     *  weight (see QuestionnaireAnswers.coBorrowerIncomeMonthly). */
    coBorrower: string;
    coBorrowerHelp: string;
  };

  debt: {
    homeLoan: string;
    homeLoanHelp: string;
    otherDebt: string;
    otherDebtHelp: string;
    /** Section heading set off by a divider (see StepDebt) — same treatment
     *  as income.coBorrowerSectionLabel, for the same reason: a co-borrower's
     *  debt is a different person's obligation, not another "your own debt"
     *  field. */
    coBorrowerSectionLabel: string;
    /** Optional — a co-borrower's own existing debt (see
     *  QuestionnaireAnswers.coBorrowerDebtMonthly). */
    coBorrowerDebt: string;
    coBorrowerDebtHelp: string;
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
  };

  aboutYou: {
    age: string;
    ageHelp: string;
    employmentType: string;
    employmentTypeHelp: string;
    employmentTypeOptions: Record<EmploymentType, string>;
  };

  homeGoals: {
    timeline: string;
    timelineHelp: (years: string) => string;
    monthsUnit: (months: number) => string;
    purchasePurpose: string;
    purchasePurposeHelp: string;
    purchasePurposeOptions: Record<HomePurchasePurpose, string>;
  };

  results: {
    heading: string;
    editAnswers: string;

    readiness: {
      eyebrow: string;
      statusLabels: Record<ReadinessStatus, string>;
      archetypeLabels: Record<ArchetypeKey, string>;
    };

    purchasingPower: {
      eyebrow: string;
      title: string;
      /** Recommended Home Price — a pure purchasing-power figure (income,
       *  debt, loan capacity, available down-payment cash), shown as the
       *  fixed benchmark alongside the user's adjustable Target Home Price. */
      homeBudget: string;
      homeBudgetCaption: string;
      installment: string;
      perMonth: (formattedAmount: string) => string;
      /** Static note under the installment stat — every Buy calculation
       *  assumes BUY_LOAN_TENURE_YEARS (30), so this is no longer a
       *  variable, age-derived figure worth its own stat tile. */
      installmentTenureNote: (years: number) => string;
      /** Label + helper for the adjustable "Your Target Home Price"
       *  slider/input, which replaced the (removed) form-step slider — see
       *  ResultsDashboard, which owns this live value. */
      targetPriceLabel: string;
      targetPriceHelp: string;
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
      /** Which scenario's gap/plan is currently shown — selected by
       *  clicking a card in the Rent/RTO/Buy comparison above, not by a
       *  control here (see GapAndPlan.tsx and BuyVsRentComparison.tsx). */
      scenarioLabels: Record<GapPlanScenario, string>;
      /** Subtitle naming the active scenario next to the section title,
       *  e.g. "Buy". */
      showingLabel: (scenarioLabel: string) => string;
      /** "The gap" card eyebrow — one consolidated card listing all three
       *  upfront gaps below, always shown side by side (never summed into
       *  one number, since they measure different constraints and may
       *  overlap — see calculateBuyGapNarrative). */
      gapLabel: string;
      gapItems: {
        homePrice: {
          label: string;
          /** formattedPrice names whichever basis (Recommended Home Price
           *  or Target Home Price) is currently selected. Reads correctly
           *  at ฿0 too ("the additional ... needed" is simply none). */
          detail: (formattedPrice: string) => string;
        };
        downPayment: {
          label: string;
          detail: string;
        };
        transactionFees: {
          label: string;
          detail: string;
        };
      };
      /** "The plan" card — one bullet per gapItems entry above, each
       *  independently switching between its `ready` copy (nothing to do)
       *  and its `action` copy (the lever + amount), since a home price
       *  price gap and a down payment gap can close independently of one
       *  another. */
      planLabel: string;
      planItems: {
        homePrice: {
          label: string;
          ready: string;
          /** additionalMonthlyInstallmentNeeded, requiredMonthlyInstallmentForTarget. */
          action: (formattedAdditional: string, formattedTotal: string) => string;
        };
        downPayment: {
          label: string;
          ready: string;
          /** remainingDownPayment. */
          action: (formattedAmount: string) => string;
        };
        transactionFees: {
          label: string;
          /** transactionCostEstimate — always an action (there's no "ready"
           *  state for a cost you must simply set aside). */
          action: (formattedAmount: string) => string;
        };
      };
      /** Heading above downsizeSuggestion — kept visually secondary to the
       *  three main plan bullets above (see GapAndPlan.tsx). */
      additionalOptionLabel: string;
      suggestions: {
        /** [fact, suggestion] — two separate bullet points (the gap itself,
         *  then what to do about it), rather than one combined sentence. */
        overRiskBudget: (formattedAmount: string) => [string, string];
        stretchZone: [string, string];
      };
      /** RTO tab content. Three DISTINCT concepts, deliberately kept visually
       *  and conceptually separate (see RtoContent in GapAndPlan.tsx):
       *    1. homePrice — the shared Buy/RTO affordability benchmark (Buy's
       *       OWN priceGap/homePriceBasis from calculateBuyGapNarrative,
       *       reused verbatim, including the Additional Option/
       *       downsizeSuggestion — Buy and RTO share one financial-
       *       eligibility ceiling, see RtoGapPlanResult's docstring). GAP
       *       card only — informational context, not a row in THE PLAN:
       *       there is no RTO-specific lever that closes it (closing it
       *       means more loan capacity, which is Buy's own action, shown
       *       under the Buy tab).
       *    2. contractFee — RTO's own upfront-cash row (the RTO parallel to
       *       Buy's down payment gap), from RtoGapPlanResult.
       *    3. monthlyShortfall — RTO's own Years 1-3 payment-feasibility
       *       row, from RtoGapPlanResult.hasMonthlyShortfall/
       *       monthlyShortfallTHB (computed from the household's cash flow
       *       against RTO's actual monthly payment — see
       *       calculateRtoGapPlan — never Buy's installment math). Same
       *       "only shown when there's an actual shortfall" convention as
       *       rent.gapItems/planItems.monthlyShortfall below. */
      rto: {
        gapItems: {
          /** Amount/detail come from Buy's own calculateBuyGapNarrative
           *  (priceGap, homePriceBasis) — not a separate RTO calculation. */
          homePrice: { label: string; detail: (formattedPrice: string) => string };
          contractFee: { label: string; detail: string };
          /** Only rendered when hasMonthlyShortfall — a healthy monthly
           *  cushion isn't a "gap" (same convention as rent.gapItems
           *  .monthlyShortfall). */
          monthlyShortfall: { label: string; detail: string };
        };
        planItems: {
          contractFee: {
            label: string;
            /** Shown when isContractFeeGapClosed. */
            ready: string;
            /** Shown when monthsToCloseContractFeeGap is a number. */
            action: (formattedGap: string, months: number) => string;
            /** Shown instead of `action` when monthsToCloseContractFeeGap is
             *  null (the household's saving capacity is $0/mo against a real
             *  gap). */
            notAchievable: string;
          };
          /** Only rendered alongside gapItems.monthlyShortfall. */
          monthlyShortfall: {
            label: string;
            action: (formattedShortfall: string) => string;
          };
        };
      };
      /** Rent tab content — no bank approval and no minimum-equity
       *  requirement like Buy, but renting does have a real upfront cash
       *  requirement (the 2-month deposit — see RentGapPlanResult), plus the
       *  same ongoing monthly-affordability question every option has. No
       *  additional option (there's no downsize-style lever this app models
       *  for rent). */
      rent: {
        gapItems: {
          /** Always shown, like Buy's/RTO's own required-cash rows — ฿0
           *  reads fine ("you already have enough"). */
          rentalDeposit: { label: string; detail: string };
          /** Only rendered when hasMonthlyShortfall — a healthy monthly
           *  cushion isn't a "gap," so it's never shown just to pad the
           *  card out to match Buy/RTO's row count. */
          monthlyShortfall: { label: string; detail: string };
        };
        planItems: {
          rentalDeposit: {
            label: string;
            /** Shown when isRentalDepositReady. */
            ready: (formattedRequired: string) => string;
            /** Shown when there's a gap and monthsToCloseRentalDepositGap
             *  is a number. */
            action: (formattedRequired: string, formattedGap: string, months: number) => string;
            /** Shown instead of `action` when monthsToCloseRentalDepositGap
             *  is null (the household's saving capacity is $0/mo against a
             *  real gap). */
            notAchievable: (formattedRequired: string, formattedGap: string) => string;
          };
          /** Only rendered alongside gapItems.monthlyShortfall. */
          monthlyShortfall: {
            label: string;
            action: (formattedShortfall: string) => string;
          };
        };
      };
    };

    buyVsRent: {
      eyebrow: string;
      title: string;

      /** Toggle governing every number in this section: whichever home
       *  price basis is selected (Recommended Home Price, or the user's
       *  adjustable Target Home Price) is what the value highlight, the
       *  three comparison cards, and the footnotes all get computed from —
       *  see BuyVsRentOption. Gap & Plan is NOT affected by this toggle; it
       *  always stays anchored to the target price (see GapAndPlan.tsx). */
      basisToggle: {
        label: string;
        budgetOption: (formattedPrice: string) => string;
        targetOption: (formattedPrice: string) => string;
      };

      /** Section 1 — the page's primary visual focus: the selected basis
       *  price today vs. its estimated value at year 10. IDENTICAL whether
       *  Buy or RTO is selected — a home's market value depends on the home
       *  itself, not on how it's financed, so the RTO markup never inflates
       *  this figure (see RentToOwnResult.projectedHomeValueYear10THB).
       *  Hidden entirely for Rent — renting builds no equivalent asset, by
       *  definition. */
      valueHighlight: {
        eyebrow: string;
        /** Label above the "today" figure — depends on which basisToggle
         *  option is active, so it never says "Recommended Home Price"
         *  while actually showing the target price, or vice versa. */
        todayLabelBudget: string;
        todayLabelTarget: string;
        futureLabel: string;
        /** Lowercase noun phrases ("the recommended home price" / "your
         *  target home price") interpolated into growthNote below. */
        basisLabelBudget: string;
        basisLabelTarget: string;
        growthNote: (formattedPrice: string, formattedAppreciationPct: string, basisLabel: string) => string;
      };

      /** Section 2 — Rent, Rent-to-Own, and Buy shown side by side (a
       *  responsive grid: 3 columns on wider screens, stacked on mobile).
       *  Each card is clickable — selecting one is how the Gap & Plan
       *  section below chooses which scenario to narrate (see
       *  GapAndPlan.tsx). */
      comparisonTitle: string;
      /** Instructional caption above the cards. */
      selectHint: string;
      /** Top-left header cell of the desktop comparison table — labels the
       *  leftmost column, which holds every row's label. */
      optionColumnLabel: string;
      /** Badge shown on whichever card is currently selected. */
      selectedBadge: string;
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
      metrics: {
        cushionStatusLabels: Record<CashFlowRiskLevel, string>;
        /** Section title grouping the 5 metric rows below (Initial payment
         *  through Capital value), mirroring nonFinancial.title's role for
         *  the pillar rows. */
        sectionTitle: string;
        initialPaymentLabel: string;
        /** Per-scenario caption under the Initial Payment figure, naming
         *  what it actually is (down payment + fees / contract fee / 2
         *  months' rent). */
        initialPaymentCaptions: Record<"buy" | "rentToOwn" | "rent", string>;
        monthlyPaymentLabel: string;
        /** RTO-only caption under the Monthly Payment figure, explaining the
         *  two payment phases (see RentToOwnResult): the figure shown is the
         *  flat RTO payment during the 3-year contract, then this caption
         *  names the estimated mortgage installment (postTransitionMonthlyPaymentTHB,
         *  pre-formatted as THB) the household transitions to afterward. Not
         *  used for Buy/Rent — their monthly payment is a single flat figure
         *  for all 10 years, so no phase to explain. */
        rentToOwnMonthlyPaymentCaption: (formattedPostTransitionAmount: string) => string;
        remainingLabel: string;
        remainingPctCaption: (pct: string) => string;
        /** "Total paid over 10 years" — a pure cost figure (see
         *  CashFlowBreakdown.totalPaidOver10YearsTHB), deliberately never
         *  netted against Capital Value below so the two rows answer two
         *  different questions: money paid out vs. equity built. No
         *  standalone help caption — tooltips.totalPaid covers it. */
        totalPaidLabel: string;
        capitalValueLabel: string;
        /** No "Yes"/"No" wording — the ✓/✕ icon (rendered separately)
         *  already carries that signal; this text just names the actual
         *  built-up value in plain language. Used for both Buy and RTO —
         *  both are now genuine year-10 projections (see
         *  RentToOwnResult.projectedHomeValueYear10THB). */
        capitalValueYes: (formattedAmount: string) => string;
        capitalValueNo: string;
        /** Click/tap-to-open explanations for the (i) icon next to each of
         *  the 5 Financial Snapshot row labels — see InfoTooltip in
         *  BuyVsRentComparison.tsx. Generic, scenario-independent
         *  explanations of what each metric means (the per-scenario
         *  captions above already cover the scenario-specific detail). */
        tooltips: {
          initialPayment: string;
          monthlyPayment: string;
          remaining: string;
          totalPaid: string;
          capitalValue: string;
        };
      };
      /** Section 3 — non-financial pillars: short, neutral, per-scenario
       *  copy, not calculated from any number. */
      nonFinancial: {
        title: string;
        flexibilityLabel: string;
        barrierToEntryLabel: string;
        debtRiskLabel: string;
        pillars: Record<
          "rent" | "rentToOwn" | "buy",
          { flexibility: string; barrierToEntry: string; debtRisk: string }
        >;
        /** Click/tap-to-open explanations for the (i) icon next to each of
         *  the 3 Non-Financial row labels — same InfoTooltip pattern as
         *  metrics.tooltips above. Generic, scenario-independent
         *  explanations of what each pillar means (the per-scenario
         *  sentences in `pillars` above already cover the scenario-specific
         *  detail). No tooltip on the "Non-Financial" section title itself —
         *  that (i) icon was removed as purely decorative and confusing
         *  (it had no popup). */
        tooltips: {
          flexibility: string;
          barrierToEntry: string;
          debtRisk: string;
        };
      };

    };

    /** The one and only Notes section in the app — every assumption,
     *  disclaimer, and important context the calculations rely on,
     *  consolidated into a single list at the very bottom of the results
     *  page (see NotesSection.tsx). Previously scattered across the Home
     *  Goals form step (loanTenureNote/appreciationNote/assumptionsNote,
     *  now removed) and several results footnotes (rentEstimateNote,
     *  rentToOwnEstimateNote, gapAndPlan.keepInMindText, the standalone
     *  disclaimer — all now removed/merged here instead). */
    notes: {
      title: string;
      disclaimer: string;
      /** Merges the old loanTenureNote + assumptionsNote — every fixed
       *  lending assumption a Buy calculation uses, values interpolated
       *  live from BUY_LOAN_TENURE_YEARS and the active assumptions (so
       *  this stays accurate even when Master mode tunes them, unlike the
       *  old assumptionsNote which hardcoded "6%"/"40%"/"2%" as plain
       *  text regardless of the actual active values). */
      buyAssumptions: (tenureYears: number, interestPct: string, dsrPct: string, feePct: string) => string;
      /** Merges the old rentEstimateNote + rentToOwnEstimateNote, dropping
       *  the derived THB amounts (already shown live in the Financial
       *  Snapshot table) and keeping just the assumption rates themselves. */
      rentAndRtoAssumptions: (yieldPct: string, rtoMarkupPct: string, rtoFeePct: string) => string;
      /** The old homeGoals.appreciationNote. */
      growthAssumption: (appreciationPct: string) => string;
      /** The old gapAndPlan.keepInMindText — kept verbatim, just relocated. */
      governmentSchemes: string;
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
