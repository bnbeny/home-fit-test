import type { Translations } from "./types";

export const en: Translations = {
  header: {
    eyebrow: "YOUR DREAM HOME STARTS HERE!",
    title: "Smart Home Budget Calculator",
    subtitle:
      "Tell us a little about your income, savings, and dream home. We'll help you find a budget that feels right, see how ready you are, and plan your next step.",
  },

  footer: {
    note: "Home Ready gives you an estimate, not a mortgage application. Your data stays on your device — nothing is sent anywhere.",
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
    incomeRequired: "Please enter your monthly income to continue.",
    priceRequired: "Please enter a timeline to continue.",
  },

  income: {
    displayModeLabel: "Enter income as",
    displayModeMonthly: "Monthly",
    displayModeAnnual: "Annual",
    primary: "Primary income",
    primaryHelp:
      "Your take-home pay from your main job. If you have a co-borrower, enter their income separately below.",
    additional: "Additional income",
    additionalHelp:
      "Any other steady income you earn — side jobs, freelance work, or rental income. If you have a co-borrower, enter theirs separately below.",
    bonus: "Annual bonus",
    bonusHelp:
      "Your yearly bonus, if you get one — banks usually count only part of it when deciding how much to lend. (There's no separate field yet for a co-borrower's bonus.)",
    coBorrowerSectionLabel: "Co-borrower (optional)",
    coBorrower: "Co-borrower income",
    coBorrowerHelp:
      "If you're buying together, your co-borrower's regular monthly income. We count it the same as your own.",
  },

  debt: {
    homeLoan: "Existing home loan payment",
    homeLoanHelp:
      "Your monthly payment on a home loan you already have, if any. Enter your co-borrower's separately below.",
    otherDebt: "Other loan payments",
    otherDebtHelp:
      "Car loans, credit cards, personal loans — any other fixed monthly payments of your own. Enter your co-borrower's separately below.",
    coBorrowerSectionLabel: "Co-borrower (optional)",
    coBorrowerDebt: "Co-borrower debt",
    coBorrowerDebtHelp:
      "Your co-borrower's home loan, car loan, credit cards, or any other fixed monthly payments.",
  },

  expenses: {
    livingExpenses: "Monthly living expenses",
    livingExpensesHelp:
      "Food, utilities, transport, and other everyday costs — not including rent. Include both you and your co-borrower's expenses, if you have one.",
    annualLumpSum: "Annual lump-sum expenses",
    annualLumpSumHelp:
      "Insurance premiums and other yearly costs — we'll spread these evenly across 12 months. Include both you and your co-borrower's costs, if you have one.",
    isRentingQuestion: "Are you currently renting?",
    rent: "Monthly rent",
    rentHelp: "We keep this separate from your other living expenses.",
  },

  savings: {
    totalSavings: "Total current savings",
    totalSavingsHelp:
      "All the savings you have right now, including money set aside for other goals. Include your co-borrower's savings too if you're pooling funds.",
    downPayment: "Available for a down payment",
    downPaymentHelp:
      "The cash you'd actually put toward the home, after keeping your emergency fund untouched. Combine yours and your co-borrower's contribution if applying together.",
  },

  aboutYou: {
    age: "Your age",
    ageHelp: "This won't change any of your numbers — it's just extra context for how a lender may view your application.",
    employmentType: "Employment type",
    employmentTypeHelp:
      "This won't change any of your numbers — it's just extra context for how a lender may view your application.",
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
    timeline: "When do you want to buy?",
    timelineHelp: (years) => `About ${years} year(s) from now.`,
    monthsUnit: (months) => `${months} mo`,
    purchasePurpose: "Why are you buying this home?",
    purchasePurposeHelp: "This won't change any of your numbers — it's just extra context for your plan.",
    purchasePurposeOptions: {
      "live-in": "Live in long-term",
      investment: "Investment / Resale",
    },
  },

  results: {
    heading: "Your results",
    editAnswers: "Edit answers",

    readiness: {
      eyebrow: "Your target home readiness score",
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
      title: "The home budget that fits you",
      homeBudget: "Recommended home budget",
      homeBudgetCaption: "Estimated from your income, debt, and repayment ability, assuming the standard 10% minimum down payment.",
      installment: "Recommended monthly installment",
      perMonth: (formattedAmount) => `${formattedAmount}/mo`,
      installmentTenureNote: (years) => `over a ${years}-year loan tenure.`,
      targetPriceLabel: "Your target home price",
      targetPriceHelp: "Try adjusting your target price to see how far it is from your recommended budget — and what you'd need to plan for.",
      zoneBarLabel: "Where does your target home price land?",
      targetPricePrefix: "Price you've set:",
      safeUpTo: (formatted) => `Comfortable up to ${formatted}`,
      stretchUpTo: (low, high) => `Tight ${low}–${high}`,
      riskAbove: (formatted) => `Risk above ${formatted}`,
      installmentRationale: {
        dsrBinding: (dsr) =>
          `Based on your income and debt, we estimate the installment shouldn't exceed ${dsr}/month,`,
        budgetBinding: (budget) =>
          `Based on your income and debt, we estimate the installment shouldn't exceed ${budget}/month,`,
        comfortBinding: (comfortable, _nextCeiling) =>
          `Based on your income and debt, we estimate the installment shouldn't exceed ${comfortable}/month,`,
      },
    },

    advisoryNotices: {
      eyebrow: "Worth flagging",
      title: "A few things to keep in mind",
      note: "These won't change the numbers above, but they're real things a lender will weigh — worth being upfront about.",
      items: {
        "negative-cash-flow": (formattedAmount) =>
          `Right now, your monthly expenses are about ${formattedAmount} more than your income — the numbers below may look better than they really are until this is sorted out.`,
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
            `The extra purchasing power you'd need to reach a home price of ${formattedPrice}, based on your current financial capacity.`,
        },
        downPayment: {
          label: "Down payment gap",
          detail: "The extra cash you'd need to cover the minimum down payment for this price.",
        },
        transactionFees: {
          label: "Transaction fees",
          detail: "Estimated transfer and registration fees — extra cash to have ready on top of your down payment.",
        },
      },
      planLabel: "The plan",
      planItems: {
        homePrice: {
          label: "Close the home price gap",
          ready: "Good news — you already have enough purchasing power for this price.",
          action: (formattedAdditional, formattedTotal) =>
            `Boost your monthly installment capacity by about ${formattedAdditional} (to about ${formattedTotal} total) — through higher income, lower debt, or a longer loan term.`,
        },
        downPayment: {
          label: "Complete your down payment",
          ready: "You've already saved enough for the minimum down payment.",
          action: (formattedAmount) => `Save ${formattedAmount} more to reach the minimum down payment for this price.`,
        },
        transactionFees: {
          label: "Prepare for transaction fees",
          action: (formattedAmount) => `Set aside about ${formattedAmount} for transfer and registration fees — on top of your down payment.`,
        },
      },
      additionalOptionLabel: "Additional option",
      suggestions: {
        overRiskBudget: (formattedAmount) => [
          `This home price is about ${formattedAmount} above your Stretch Budget — the top of your recommended range.`,
          "Try a nearby neighborhood, a smaller unit, or a longer loan term to bring the monthly payment down.",
        ],
        stretchZone: [
          "This home price is in the stretch zone — doable, but leaves little room for rate hikes or surprise costs.",
          "A slightly lower price would give you more breathing room.",
        ],
      },
      rto: {
        gapItems: {
          homePrice: {
            label: "Home price gap (same check as Buy)",
            detail: (formattedPrice) =>
              `The extra purchasing power you'd need to reach a home price of ${formattedPrice}, based on your current financial capacity — same as the check for Buy.`,
          },
          contractFee: {
            label: "Upfront contract fee gap",
            detail: "The extra cash you'd need to cover the Rent-to-Own contract fee, due when you sign.",
          },
          monthlyShortfall: {
            label: "Monthly shortfall (first 3 years)",
            detail: "How much more you'd need each month to cover the Rent-to-Own payment in Years 1–3, before it switches to a mortgage.",
          },
        },
        planItems: {
          contractFee: {
            label: "Complete your contract fee",
            ready: "You already have enough to cover the contract fee.",
            action: (formattedGap, months) =>
              `Save ${formattedGap} more. At your current saving rate, that's about ${months} month(s).`,
            notAchievable:
              "You haven't set a monthly saving amount, so this gap won't close by itself — set even a small saving goal to get a realistic timeline.",
          },
          monthlyShortfall: {
            label: "Close the monthly shortfall",
            action: (formattedShortfall) =>
              `You'd be about ${formattedShortfall} short each month during the first 3 years. Consider a lower home price, higher income, or less existing debt.`,
          },
        },
      },
      rent: {
        gapItems: {
          rentalDeposit: {
            label: "Rental deposit gap",
            detail: "The extra cash you'd need for the 2-month rental deposit.",
          },
          monthlyShortfall: {
            label: "Monthly shortfall",
            detail: "How much more you'd need each month to cover the rent for this home.",
          },
        },
        planItems: {
          rentalDeposit: {
            label: "Prepare for the rental deposit",
            ready: (formattedRequired) => `Set aside ${formattedRequired} for the 2-month deposit — you've already saved enough.`,
            action: (formattedRequired, formattedGap, months) =>
              `Set aside ${formattedRequired} for the 2-month deposit. Save ${formattedGap} more — about ${months} month(s) at your current saving rate.`,
            notAchievable: (formattedRequired, formattedGap) =>
              `Set aside ${formattedRequired} for the 2-month deposit. You still need ${formattedGap} more, but haven't set a monthly saving amount — set even a small goal to get a realistic timeline.`,
          },
          monthlyShortfall: {
            label: "Close the monthly shortfall",
            action: (formattedShortfall) =>
              `You'd be about ${formattedShortfall} short each month. Consider a lower rent budget, higher income, or less existing debt.`,
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
          `Assuming ${basisLabel} of ${formattedPrice} grows ${formattedAppreciationPct} a year for 10 years.`,
      },

      comparisonTitle: "Compare rent, rent-to-own, and buy",
      selectHint: "Tap an option to see its gap & plan below.",
      optionColumnLabel: "Option",
      selectedBadge: "Selected",
      scenarioRent: "Rent",
      scenarioRentToOwn: "Rent-to-Own",
      scenarioBuy: "Buy",
      scenarioNotes: {
        rent: "The most flexible option — low commitment, and easy to change plans as life changes.",
        rentToOwn: "A step-by-step path to owning a home — live in it now while you prepare to buy.",
        buy: "Own the home right away and start building long-term equity.",
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
          `For the first 3 years. After that, it switches to an estimated ${amount}/month mortgage payment.`,
        remainingLabel: "Remaining monthly income",
        remainingPctCaption: (pct) => `${pct} of your income`,
        totalPaidLabel: "Total paid over 10 years",
        capitalValueLabel: "Capital value",
        capitalValueYes: (formattedAmount) => `Builds an estimated ${formattedAmount} in capital value after 10 years.`,
        capitalValueNo: "Renting builds no capital value.",
        tooltips: {
          initialPayment:
            "The one-time cash you'd need upfront — a down payment and fees for Buy, a contract fee for Rent-to-Own, or a deposit and advance rent for Rent.",
          monthlyPayment: "Your ongoing monthly housing cost — a mortgage installment, a Rent-to-Own payment, or rent.",
          remaining:
            "What's left of your monthly income — combined with your co-borrower's, if you added one — after debt, living expenses, and this option's housing payment. Bonus isn't included, since it's not guaranteed every month.",
          totalPaid: "The total you'd pay toward housing over 10 years, including any one-time upfront cost.",
          capitalValue: "How much property value or equity you'd have built up by year 10, if any.",
        },
      },
      nonFinancial: {
        title: "Non-Financial",
        flexibilityLabel: "Flexibility",
        barrierToEntryLabel: "What it takes to start",
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
        "These are estimates based on standard lending assumptions — not financial advice. Please confirm your actual eligibility with a lender.",
      buyAssumptions: (tenureYears, interestPct, dsrPct, feePct) =>
        `Buy figures assume a ${tenureYears}-year loan term, ${interestPct} annual interest, a ${dsrPct} debt-service limit, and about ${feePct} for transfer and mortgage-registration fees — typical terms for a Thai mortgage pre-qualification. Your bank's actual offer may differ.`,
      rentAndRtoAssumptions: (yieldPct, rtoMarkupPct, rtoFeePct) =>
        `Rent is estimated from a typical rental yield of about ${yieldPct} of the home price per year. Rent-to-Own assumes a contract price about ${rtoMarkupPct} above the home price, plus a one-time contract fee of about ${rtoFeePct}, due at signing.`,
      growthAssumption: (appreciationPct) =>
        `We assume home values grow ${appreciationPct} a year by default — a market estimate based on typical long-run growth for Thai residential property.`,
      governmentSchemes:
        "Thailand periodically offers first-home mortgage schemes and lower-rate promotions — check current offers from banks like GHB, GSB, and commercial lenders before locking in a rate.",
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
