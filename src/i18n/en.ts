import type { Translations } from "./types";

export const en: Translations = {
  header: {
    eyebrow: "Home Ready",
    title: "Smart Home Budget Calculator",
    subtitle:
      "Answer a few questions about your income, savings, and goals to see how ready you are to buy your target home — and exactly what to do next.",
  },

  footer: {
    note: "Home Ready is an estimation tool, not a mortgage application. No data leaves your browser.",
  },

  common: {
    yes: "Yes",
    no: "No",
  },

  form: {
    stepLabels: ["About You", "Home Goals", "Income", "Debt", "Expenses", "Savings"],
    back: "Back",
    next: "Next",
    seeResults: "See my results",
    incomeRequired: "Enter your monthly income to continue.",
    priceRequired: "Enter a timeline to continue.",
  },

  income: {
    displayModeLabel: "Enter income as",
    displayModeMonthly: "Monthly",
    displayModeAnnual: "Annual",
    primary: "Primary income",
    primaryHelp:
      "Take-home pay from your main job — not your co-borrower's; enter their income in the Co-borrower section below.",
    additional: "Additional income",
    additionalHelp:
      "Other steady income of your own — side income, freelance work, or rental income. Not your co-borrower's; enter theirs in the Co-borrower section below.",
    bonus: "Annual bonus",
    bonusHelp:
      "Your own bonus, if any — banks typically count only part of this toward what they'll lend. A co-borrower's bonus isn't captured separately in this calculator.",
    coBorrowerSectionLabel: "Co-borrower (optional)",
    coBorrower: "Co-borrower income",
    coBorrowerHelp:
      "A co-borrower's regular monthly income, if you're applying together. Counted the same as your own regular income.",
  },

  debt: {
    homeLoan: "Existing home loan payment",
    homeLoanHelp:
      "Monthly payment on a home loan you already have, if any — not your co-borrower's; enter theirs under Co-borrower debt below.",
    otherDebt: "Other loan payments",
    otherDebtHelp:
      "Car loan, credit cards, personal loans — anything else with a fixed monthly payment of your own. Not your co-borrower's; enter theirs under Co-borrower debt below.",
    coBorrowerSectionLabel: "Co-borrower (optional)",
    coBorrowerDebt: "Co-borrower debt",
    coBorrowerDebtHelp:
      "Home loan, car loan, credit cards, personal loans — anything with a fixed monthly payment, but for your co-borrower.",
  },

  expenses: {
    livingExpenses: "Monthly living expenses",
    livingExpensesHelp:
      "Food, utilities, transport, and other regular costs — not including rent. Include regular living expenses for both you and your co-borrower, if applicable.",
    annualLumpSum: "Annual lump-sum expenses",
    annualLumpSumHelp:
      "Insurance premiums, car insurance, and other yearly costs — we'll spread this across 12 months. Include yearly costs for both you and your co-borrower, if applicable.",
    isRentingQuestion: "Are you currently renting?",
    rent: "Monthly rent",
    rentHelp: "Kept separate from your other living expenses.",
  },

  savings: {
    totalSavings: "Total current savings",
    totalSavingsHelp:
      "All savings, including money earmarked for other goals. Include your co-borrower's savings too if you're pooling funds together.",
    downPayment: "Available for a down payment",
    downPaymentHelp:
      "Cash you'd actually put toward the home, after keeping an emergency fund untouched. Combine yours and your co-borrower's contribution if applying together.",
  },

  aboutYou: {
    age: "Your age",
    ageHelp: "Doesn't change the numbers on your results page — it's just context for how a lender may view your application.",
    employmentType: "Employment type",
    employmentTypeHelp:
      "Doesn't change the numbers on your results page — it's just context for how a lender may view your application.",
    employmentTypeOptions: {
      "government-state-enterprise": "Government / State Enterprise Employee",
      permanent: "Permanent Employee",
      "contract-temporary": "Contract / Temporary Employee",
      "business-owner": "Business Owner",
      "self-employed-freelancer": "Self-employed / Freelancer",
      "gig-commission": "Gig / Commission-based Worker",
      unemployed: "Not currently employed",
    },
  },

  homeGoals: {
    timeline: "Timeline to buy",
    timelineHelp: (years) => `About ${years} year(s) from now.`,
    monthsUnit: (months) => `${months} mo`,
    purchasePurpose: "What is your primary goal for buying this home?",
    purchasePurposeHelp:
      "Doesn't change the numbers on your results page — it's just context for your plan.",
    purchasePurposeOptions: {
      "live-in": "Live in long-term",
      investment: "Investment / Resale",
    },
  },

  results: {
    heading: "Your results",
    editAnswers: "Edit answers",

    readiness: {
      eyebrow: "Home readiness score",
      statusLabels: {
        ready: "Ready",
        "almost-ready": "Almost Ready",
        "not-ready": "Not Ready Yet",
      },
      archetypeLabels: {
        "rent-for-now": "Rent for Now",
        "early-preparation": "Early Preparation",
        "emerging-buyer": "Emerging Buyer",
        "near-ready": "Near Ready",
        "buy-now": "Buy Now",
      },
    },

    purchasingPower: {
      eyebrow: "Your purchasing power",
      title: "What you can afford",
      homeBudget: "Recommended home price",
      homeBudgetCaption:
        "Based on how much loan your recommended installment can support, plus your available down payment.",
      installment: "Recommended monthly installment",
      perMonth: (formattedAmount) => `${formattedAmount}/mo`,
      installmentTenureNote: (years) => `Based on a ${years}-year loan tenure.`,
      targetPriceLabel: "Your target home price",
      targetPriceHelp: "Drag to update your Gap, Plan, and comparison below.",
      zoneBarLabel: "Where your target home price falls",
      yourTarget: (formattedPrice) => `Your target: ${formattedPrice}`,
      safeUpTo: (formatted) => `Safe up to ${formatted}`,
      stretchUpTo: (formatted) => `Stretch up to ${formatted}`,
      riskAbove: (formatted) => `Risk zone above ${formatted}`,
      installmentRationale: {
        dsrBinding: (dsr) =>
          `This is the bank's standard debt-service limit of ${dsr}/month, based on your income and existing debt.`,
        budgetBinding: (budget) =>
          `This reflects what's realistically left in your monthly budget after living costs and debt — ${budget}/month — tighter than a bank's standard limit.`,
        comfortBinding: (comfortable, nextCeiling) =>
          `We've based this on your comfortable payment limit of ${comfortable} to help maintain financial flexibility. Your bank/budget ceiling would allow up to ${nextCeiling}/month.`,
      },
    },

    advisoryNotices: {
      eyebrow: "Worth flagging",
      title: "Advisory notices",
      note: "These don't change the numbers above — they're real factors a lender will weigh, so it's worth raising them directly.",
      items: {
        "negative-cash-flow": (formattedAmount) =>
          `Based on what you've told us, your monthly obligations currently exceed your income by about ${formattedAmount} — the numbers below may be optimistic until this is resolved.`,
      },
    },

    gapAndPlan: {
      eyebrow: "The gap & the plan",
      title: "Your personalized plan",
      scenarioLabels: {
        buy: "Buy",
        rto: "Rent-to-Own",
        rent: "Rent",
      },
      showingLabel: (scenarioLabel) => `Showing: ${scenarioLabel}`,
      gapLabel: "The gap",
      gapItems: {
        homePrice: {
          label: "Home price gap",
          detail: (formattedPrice) =>
            `The extra purchasing power you'd need to reach a home price of ${formattedPrice}, based on how much you can borrow plus the down payment you have available.`,
        },
        downPayment: {
          label: "Down payment gap",
          detail: "The extra cash you'd need to meet the minimum down payment required for this price.",
        },
        transactionFees: {
          label: "Transaction fees",
          detail: "Estimated transfer and registration costs — additional cash to prepare on top of your down payment.",
        },
      },
      planLabel: "The plan",
      planItems: {
        homePrice: {
          label: "Close the home price gap",
          ready: "You already have enough purchasing power for this price.",
          action: (formattedAdditional, formattedTotal) =>
            `Increase your monthly installment capacity by about ${formattedAdditional} (to about ${formattedTotal} total) — through higher income, lower existing debt, or a longer loan term.`,
        },
        downPayment: {
          label: "Complete your down payment",
          ready: "You already have enough saved for the minimum down payment.",
          action: (formattedAmount) => `Save an additional ${formattedAmount} to meet the minimum down payment for this price.`,
        },
        transactionFees: {
          label: "Prepare for transaction fees",
          action: (formattedAmount) => `Set aside about ${formattedAmount} for transfer and registration costs, separate from your down payment.`,
        },
      },
      additionalOptionLabel: "Additional option",
      suggestions: {
        overRiskBudget: (formattedAmount) => [
          `This home price is about ${formattedAmount} above your Stretch Budget — the top of your recommended range.`,
          "Consider nearby neighborhoods, a smaller unit, or a longer loan term to lower the monthly installment.",
        ],
        stretchZone: [
          "This home price sits in the stretch zone — it's reachable, but leaves little room for rate increases or surprise costs.",
          "A slightly lower price point would add breathing room.",
        ],
      },
      rto: {
        gapItems: {
          homePrice: {
            label: "Home price gap (shared eligibility check with Buy)",
            detail: (formattedPrice) =>
              `The extra purchasing power you'd need to reach a home price of ${formattedPrice}, based on your current financial capacity — the same check used for Buy.`,
          },
          contractFee: {
            label: "Upfront contract fee gap",
            detail: "The extra cash needed to cover the Rent-to-Own contract fee due at signing.",
          },
          monthlyShortfall: {
            label: "Monthly shortfall (during the 3-year RTO period)",
            detail: "How much more you'd need each month to afford the Rent-to-Own payment during Years 1–3, before transitioning to a mortgage.",
          },
        },
        planItems: {
          contractFee: {
            label: "Complete your contract fee",
            ready: "You already have enough available to cover the contract fee.",
            action: (formattedGap, months) =>
              `Save an additional ${formattedGap}. At your current saving rate, this would take about ${months} month(s).`,
            notAchievable:
              "You haven't set a monthly saving amount, so this gap won't close on its own — set even a modest saving target to get a realistic timeline.",
          },
          monthlyShortfall: {
            label: "Close the monthly shortfall",
            action: (formattedShortfall) =>
              `You'd be about ${formattedShortfall} short each month during the 3-year RTO period. Consider a lower home price, higher income, or lower existing debt.`,
          },
        },
      },
      rent: {
        gapItems: {
          rentalDeposit: {
            label: "Rental deposit gap",
            detail: "The extra cash needed to cover the 2-month rental deposit.",
          },
          monthlyShortfall: {
            label: "Monthly shortfall",
            detail: "How much more you'd need each month to afford the rent for this home.",
          },
        },
        planItems: {
          rentalDeposit: {
            label: "Prepare for the rental deposit",
            ready: (formattedRequired) => `Set aside ${formattedRequired} for the 2-month deposit — you already have enough saved.`,
            action: (formattedRequired, formattedGap, months) =>
              `Set aside ${formattedRequired} for the 2-month deposit. Save an additional ${formattedGap} — at your current saving rate, this would take about ${months} month(s).`,
            notAchievable: (formattedRequired, formattedGap) =>
              `Set aside ${formattedRequired} for the 2-month deposit. You still need ${formattedGap} more, but haven't set a monthly saving amount — set even a modest saving target to get a realistic timeline.`,
          },
          monthlyShortfall: {
            label: "Close the monthly shortfall",
            action: (formattedShortfall) =>
              `You'd be about ${formattedShortfall} short each month. Consider a lower rent budget, higher income, or lower existing debt.`,
          },
        },
      },
    },

    buyVsRent: {
      eyebrow: "Buy vs rent",
      title: "How buying and renting compare",

      basisToggle: {
        label: "Compare based on",
        budgetOption: (formattedPrice) => `Recommended Home Price (${formattedPrice})`,
        targetOption: (formattedPrice) => `Your Target Home Price (${formattedPrice})`,
      },

      valueHighlight: {
        eyebrow: "10-year home value",
        todayLabelBudget: "Recommended home price",
        todayLabelTarget: "Your target price",
        futureLabel: "In 10 years",
        basisLabelBudget: "the recommended home price",
        basisLabelTarget: "your target home price",
        growthNote: (formattedPrice, formattedAppreciationPct, basisLabel) =>
          `Based on ${basisLabel} of ${formattedPrice}, growing at ${formattedAppreciationPct} expected annual capital growth over 10 years.`,
      },

      comparisonTitle: "Compare rent, rent-to-own, and buy",
      selectHint: "Tap an option to see its gap & plan below.",
      optionColumnLabel: "Option",
      selectedBadge: "Selected",
      scenarioRent: "Rent",
      scenarioRentToOwn: "Rent-to-Own",
      scenarioBuy: "Buy",
      scenarioNotes: {
        rent: "Offers the most flexibility, with less commitment and the freedom to adjust your housing plans as life changes.",
        rentToOwn: "Provides a gradual path toward homeownership, letting you live in the home while preparing to buy.",
        buy: "Provides immediate homeownership and the opportunity to build long-term home equity.",
      },
      metrics: {
        cushionStatusLabels: {
          comfortable: "Comfortable",
          moderate: "Tight",
          "high-risk": "High Risk",
        },
        sectionTitle: "Financial Snapshot",
        initialPaymentLabel: "Initial payment",
        initialPaymentCaptions: {
          buy: "Down payment + transaction fees",
          rentToOwn: "One-time contract fee",
          rent: "2 months' rent",
        },
        monthlyPaymentLabel: "Monthly payment",
        rentToOwnMonthlyPaymentCaption: (amount) =>
          `During the 3-year RTO period. After transitioning to normal home ownership, this adjusts to an estimated ${amount}/month mortgage payment.`,
        remainingLabel: "Remaining monthly income",
        remainingPctCaption: (pct) => `${pct} of your income`,
        totalPaidLabel: "Total paid over 10 years",
        capitalValueLabel: "Capital value",
        capitalValueYes: (formattedAmount) => `Builds an estimated capital value of ${formattedAmount} after 10 years.`,
        capitalValueNo: "Renting builds no capital value.",
        tooltips: {
          initialPayment:
            "The one-time cash due upfront to start this option — a down payment plus transaction fees for Buy, a contract fee for Rent-to-Own, or a security deposit and advance rent for Rent.",
          monthlyPayment: "The recurring monthly housing cost for this option — a mortgage installment, a Rent-to-Own payment, or rent.",
          remaining:
            "Your recurring monthly income — household income, combined with your co-borrower's, if you added one — after existing debt (including theirs), living expenses, and this option's housing payment. Annual bonus is excluded because it is not guaranteed monthly cash flow.",
          totalPaid: "The total amount you'd pay toward housing over 10 years, including the one-time upfront cost where it applies.",
          capitalValue: "How much property value or equity you'd have built up by year 10, if any.",
        },
      },
      nonFinancial: {
        title: "Non-Financial",
        flexibilityLabel: "Flexibility",
        barrierToEntryLabel: "Requirement to start",
        debtRiskLabel: "Debt / financial commitment",
        pillars: {
          rent: {
            flexibility: "Highest — easy to move or change plans anytime.",
            barrierToEntry: "Low — typically a deposit and 1-2 months' rent.",
            debtRisk: "None — no loan or long-term contract.",
          },
          rentToOwn: {
            flexibility: "Moderate — committed to the contract term, but no bank loan yet.",
            barrierToEntry: "Moderate — a one-time contract fee, plus provider approval.",
            debtRisk: "Low-moderate — a fixed contract payment, not a bank loan.",
          },
          buy: {
            flexibility: "Lowest — selling or moving takes time and cost.",
            barrierToEntry: "High — down payment, transaction fees, and bank loan approval.",
            debtRisk: "Highest — a long-term bank loan and mortgage obligation.",
          },
        },
        tooltips: {
          flexibility: "How easily you could move out or change plans if your circumstances change.",
          barrierToEntry: "What it takes to get started with this option — the upfront requirements and approvals involved.",
          debtRisk: "How much long-term financial obligation this option locks you into.",
        },
      },
    },

    notes: {
      title: "Notes",
      disclaimer:
        "Estimates only, based on standard debt-service, budget, and lending assumptions — not financial advice. Confirm your actual eligibility with a lender.",
      buyAssumptions: (tenureYears, interestPct, dsrPct, feePct) =>
        `Buy figures assume a ${tenureYears}-year loan tenure, a ${interestPct} annual interest rate, a ${dsrPct} debt-service ceiling, and about ${feePct} for transfer and mortgage-registration fees — typical terms for a Thai mortgage pre-qualification. Your bank's actual offer may vary.`,
      rentAndRtoAssumptions: (yieldPct, rtoMarkupPct, rtoFeePct) =>
        `Rent is estimated using a typical rental yield of about ${yieldPct} of the home price per year. Rent-to-Own assumes a contract price about ${rtoMarkupPct} above the home price, plus a one-time contract fee of about ${rtoFeePct}, due at signing.`,
      growthAssumption: (appreciationPct) =>
        `We assume a default annual capital growth of ${appreciationPct} for home values — a market-based estimate based on typical long-run growth for Thai residential property.`,
      governmentSchemes:
        "Government first-home mortgage schemes and lower interest-rate promotions run periodically in Thailand — check current offers from banks like GHB, GSB, and commercial lenders before locking in a rate.",
    },
  },

  master: {
    toggleLabel: "Master",
    title: "Master version",
    subtitle: "Tune any assumption and watch every result update live.",
    assumptionsTitle: "Assumptions",
    answersTitle: "Your answers",
    resultsTitle: "Results",
    resetButton: "Reset to defaults",
    closeButton: "Close",
    assumptionLabels: {
      debtServiceRatio: "Debt Service Ratio (DSR)",
      annualInterestRate: "Annual Interest Rate",
      downPaymentRate: "Down Payment Rate",
      safeBudgetMultiplier: "Safe Budget Multiplier",
      stretchBudgetMultiplier: "Stretch Budget Multiplier",
      riskZoneMultiplier: "Risk Zone Multiplier",
    },
  },
};
