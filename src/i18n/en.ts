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
    stepLabels: ["Income", "Debt", "Expenses", "Savings", "About You", "Home Goals"],
    back: "Back",
    next: "Next",
    seeResults: "See my results",
    incomeRequired: "Enter your monthly salary to continue.",
    priceRequired: "Enter a target home price to continue.",
  },

  income: {
    salary: "Monthly income",
    salaryHelp:
      "Take-home pay plus any other steady monthly income — side income, freelance work, rental income, or a co-borrower's contribution.",
    bonus: "Annual bonus",
    bonusHelp:
      "Total bonus received per year, if any — banks typically count only part of this toward what they'll lend.",
  },

  debt: {
    homeLoan: "Existing home loan payment",
    homeLoanHelp: "Monthly payment on a home loan you already have, if any.",
    otherDebt: "Other loan payments",
    otherDebtHelp: "Car loan, credit cards, personal loans — anything else with a fixed monthly payment.",
  },

  expenses: {
    livingExpenses: "Monthly living expenses",
    livingExpensesHelp: "Food, utilities, transport, and other regular costs — not including rent.",
    annualLumpSum: "Annual lump-sum expenses",
    annualLumpSumHelp:
      "Insurance premiums, car insurance, and other yearly costs — we'll spread this across 12 months.",
    isRentingQuestion: "Are you currently renting?",
    rent: "Monthly rent",
    rentHelp: "Kept separate from your other living expenses.",
  },

  savings: {
    totalSavings: "Total current savings",
    totalSavingsHelp: "All savings, including money earmarked for other goals.",
    downPayment: "Available for a down payment",
    downPaymentHelp:
      "Cash you'd actually put toward the home, after keeping an emergency fund untouched.",
    maxInstallment: "Maximum comfortable monthly installment",
    maxInstallmentHelp:
      "What you personally want to cap the mortgage payment at — this can be lower than what a bank would approve.",
  },

  aboutYou: {
    age: "Your age",
    ageHelp: "Used to work out the maximum loan term a bank would typically offer you.",
    employmentType: "Employment type",
    employmentTypeHelp:
      "Doesn't change the numbers on your results page — it's just context for how a lender may view your application.",
    employmentTypeOptions: {
      salaried: "Salaried Employee",
      "business-owner": "Business Owner / Freelancer",
    },
  },

  homeGoals: {
    targetPrice: "Price of your target home",
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
    appreciationNote: (formattedPct) =>
      `We use a default expected annual home appreciation of ${formattedPct} — a market-based assumption used to simplify this experience, based on typical long-run growth for Thai residential property.`,
    loanTenureNote: (years, age, maxAge) =>
      `Based on your age (${age}) and a common maximum age of ${maxAge} at loan maturity, we've calculated an estimated loan tenure of ${years} years for you automatically.`,
    assumptionsNote:
      "We'll estimate your loan using a standard 6% annual interest rate, a 40% debt-service ceiling, and an estimated 2% for transfer and mortgage registration fees — typical assumptions for a Thai mortgage pre-qualification. Your bank's actual offer may vary.",
  },

  results: {
    heading: "Your results",
    editAnswers: "Edit answers",
    disclaimer:
      "Estimates only, based on standard debt-service, budget, and lending assumptions — not financial advice. Confirm your actual eligibility with a lender.",

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
      homeBudget: "Estimated home budget",
      homeBudgetCaption: {
        "loan-capacity": "Capped by how much loan your recommended installment can support.",
        "equity-requirement":
          "Capped by your available cash relative to the required down payment — not your loan capacity.",
        "insufficient-closing-cash":
          "You don't have any cash available yet for a down payment — build this up before a home budget applies.",
      },
      installment: "Recommended monthly installment",
      perMonth: (formattedAmount) => `${formattedAmount}/mo`,
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
      gapLabel: "The gap",
      gapReady: "Your down payment is fully covered — you're not short on cash for this goal.",
      gapShort: (formattedGap) =>
        `You are currently short ${formattedGap} for your down payment and transaction costs.`,
      planLabel: "The plan",
      planReady: "You can start the home search and pre-approval process now.",
      planNoSavingCapacity:
        "Set a monthly saving target — even a modest one — to turn this gap into a concrete timeline.",
      planWithSaving: (formattedAmount, months) =>
        `If you save ${formattedAmount} per month, you'll be ready to buy in ${months} month(s)`,
      planWithSavingYears: (years) => ` (about ${years} years)`,
      planBehindSchedule: (months, formattedAmount) =>
        `At your current saving rate, you'll need about ${months} more month(s) than planned. Increasing your monthly savings by ${formattedAmount} or delaying your target purchase date would close the gap.`,
      alternativesLabel: "Alternative options",
      suggestions: {
        overRiskBudget: (formattedAmount) =>
          `Your target home is about ${formattedAmount} above your Stretch Budget — the top of your recommended range — consider nearby neighborhoods, a smaller unit, or a longer loan term to lower the monthly installment.`,
        stretchZone:
          "Your target home sits in the stretch zone — it's reachable, but leaves little room for rate increases or surprise costs. A slightly lower price point would add breathing room.",
        noSavingPlan:
          "You haven't allocated a monthly saving amount, so the cash gap won't close on its own — set even a modest monthly saving target to get a realistic timeline.",
        comfortLimited:
          "Your comfortable payment ceiling is lower than your bank/budget ceiling — that's a healthy safety margin, not a weakness, and keeps room for rate changes.",
        lowEmergencyCushion: (formattedAmount) =>
          `After closing costs, you'd have less than 3 months of expenses in reserve — consider building your emergency fund up by about ${formattedAmount} before or alongside saving for the home.`,
      },
      keepInMindLabel: "Keep in mind",
      keepInMindText:
        "Government first-home mortgage schemes and lower interest-rate promotions run periodically in Thailand — check current offers from banks like GHB, GSB, and commercial lenders before locking in a rate.",
    },

    buyVsRent: {
      eyebrow: "Buy vs rent",
      title: "How buying and renting compare",

      valueHighlight: {
        eyebrow: "10-year home value",
        todayLabel: "Estimated home budget",
        futureLabel: "In 10 years",
        growthNote: (formattedPrice, formattedAppreciationPct) =>
          `Based on your suggested home budget of ${formattedPrice}, growing at ${formattedAppreciationPct} expected annual appreciation over 10 years.`,
        rentNote:
          "Renting builds no home equity or property value — that's the trade-off for its flexibility. Swipe ahead to Buy to see what your suggested budget could grow into over 10 years.",
        rentToOwnNote: (formattedPaidDown) =>
          `Part of every Rent-to-Own payment counts toward the home's price. After 3 years, about ${formattedPaidDown} would be paid down toward ownership.`,
      },

      comparisonTitle: "Compare rent, rent-to-own, and buy",
      swipeHint: "Swipe or drag to switch options",
      scenarioRent: "Rent",
      scenarioRentToOwn: "Rent-to-Own",
      scenarioBuy: "Buy",
      scenarioNotes: {
        rent: "Keeps your cash flexible and easier to redirect toward other goals.",
        rentToOwn:
          "Lets you live in the home while gradually preparing for ownership — a middle path between renting and buying right away.",
        buy: "Builds long-term home equity and gives you stable, predictable housing.",
      },
      housingPaymentLabels: {
        rent: "Monthly rent",
        rentToOwn: "Rent-to-Own payment",
        buy: "Mortgage payment",
      },
      metrics: {
        remainingLabel: "Money left over each month",
        remainingPctCaption: (pct) => `${pct} of your income`,
        cushionStatusLabels: {
          comfortable: "Comfortable",
          moderate: "Tight",
          "high-risk": "High Risk",
        },
        income: "Monthly income",
        remainingExplanation: {
          infoLabel: "Why this number",
          noExpenses: "You have no regular monthly costs, so all of your income is available each month.",
          shortfall: (formattedShortfall, topFactorLabel, topFactorPct) =>
            `Your monthly costs are about ${formattedShortfall} more than your income. ${topFactorLabel} is the biggest reason, taking up ${topFactorPct} of your income.`,
          shortfallWithSecond: (formattedShortfall, topFactorLabel, topFactorPct, secondFactorLabel, secondFactorPct) =>
            `Your monthly costs are about ${formattedShortfall} more than your income. ${topFactorLabel} (${topFactorPct}) and ${secondFactorLabel} (${secondFactorPct}) together are the biggest reasons.`,
          tight: (topFactorLabel, topFactorPct) =>
            `${topFactorLabel} takes up the largest share of your income at ${topFactorPct}, leaving less room to spare each month.`,
          tightWithSecond: (topFactorLabel, topFactorPct, secondFactorLabel, secondFactorPct) =>
            `${topFactorLabel} (${topFactorPct}) and ${secondFactorLabel} (${secondFactorPct}) together take up most of your income, leaving less room to spare each month.`,
          comfortable: (topFactorLabel, remainingPct) =>
            `Even after ${topFactorLabel}, your largest monthly cost, ${remainingPct} of your income is left over — a comfortable cushion.`,
        },
      },
      allocation: {
        title: "Where this money goes",
        livingExpenses: "Living expenses",
        debt: "Existing debt",
      },
      previousCard: "Show previous option",
      nextCard: "Show next option",

      recommendation: {
        eyebrow: "What this means for you",
        rentSummary: (formattedPayment) =>
          `Rent: more flexibility and typically the lowest monthly commitment — about ${formattedPayment}/month, with no long-term obligation.`,
        rentToOwnSummary: (formattedPayment) =>
          `Rent-to-Own: a gradual path toward ownership with lower upfront costs than buying — about ${formattedPayment}/month, with part of each payment building toward the home's price.`,
        buySummary: (formattedPayment) =>
          `Buy: immediate ownership and long-term home equity — about ${formattedPayment}/month, building equity from day one.`,
      },

      rentEstimateNote: (formattedYield, formattedRent) =>
        `We estimate rent using a ${formattedYield} average rental return on your target home price — about ${formattedRent}/month.`,
      rentToOwnEstimateNote: (formattedContractFee, formattedMarkupPct) =>
        `We estimate Rent-to-Own using a contract price ${formattedMarkupPct} above your target home price, plus a one-time contract fee of about ${formattedContractFee} due at signing.`,
    },
  },
};
