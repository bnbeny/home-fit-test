import type { Translations } from "./types";

export const th: Translations = {
  header: {
    eyebrow: "Home Ready",
    title: "เครื่องคำนวณงบบ้านอัจฉริยะ",
    subtitle:
      "ตอบคำถามสั้น ๆ เกี่ยวกับรายได้ เงินออม และเป้าหมายของคุณ เพื่อดูว่าคุณพร้อมซื้อบ้านที่ต้องการแค่ไหน พร้อมขั้นตอนต่อไปที่ควรทำ",
  },

  footer: {
    note: "Home Ready เป็นเครื่องมือประเมินเบื้องต้น ไม่ใช่การยื่นขอสินเชื่อจริง ข้อมูลของคุณจะไม่ถูกส่งออกจากเบราว์เซอร์",
  },

  common: {
    yes: "ใช่",
    no: "ไม่ใช่",
  },

  form: {
    stepLabels: ["รายได้", "หนี้สิน", "ค่าใช้จ่าย", "เงินออม", "เกี่ยวกับคุณ", "เป้าหมายบ้าน"],
    back: "ย้อนกลับ",
    next: "ถัดไป",
    seeResults: "ดูผลลัพธ์ของฉัน",
    incomeRequired: "กรุณากรอกเงินเดือนก่อนดำเนินการต่อ",
    priceRequired: "กรุณากรอกราคาบ้านเป้าหมายก่อนดำเนินการต่อ",
  },

  income: {
    salary: "รายได้ต่อเดือน",
    salaryHelp: "รายได้สุทธิ บวกกับรายได้ประจำอื่น ๆ — รายได้เสริม งานฟรีแลนซ์ รายได้จากค่าเช่า หรือรายได้ของผู้กู้ร่วม",
    bonus: "โบนัสต่อปี",
    bonusHelp: "โบนัสรวมที่ได้รับต่อปี ถ้ามี — ธนาคารมักนับเพียงบางส่วนของยอดนี้เป็นรายได้ที่ใช้พิจารณาสินเชื่อ",
  },

  debt: {
    homeLoan: "ค่างวดสินเชื่อบ้านที่มีอยู่",
    homeLoanHelp: "ค่างวดต่อเดือนของสินเชื่อบ้านที่คุณมีอยู่แล้ว ถ้ามี",
    otherDebt: "ค่างวดหนี้สินอื่น ๆ",
    otherDebtHelp: "ค่างวดรถยนต์ บัตรเครดิต สินเชื่อส่วนบุคคล — อะไรก็ตามที่มีค่างวดคงที่ต่อเดือน",
  },

  expenses: {
    livingExpenses: "ค่าใช้จ่ายในการดำรงชีพต่อเดือน",
    livingExpensesHelp: "ค่าอาหาร สาธารณูปโภค ค่าเดินทาง และค่าใช้จ่ายประจำอื่น ๆ — ไม่รวมค่าเช่า",
    annualLumpSum: "ค่าใช้จ่ายก้อนใหญ่รายปี",
    annualLumpSumHelp: "เบี้ยประกันชีวิต ประกันรถยนต์ และค่าใช้จ่ายรายปีอื่น ๆ — เราจะเฉลี่ยให้ตลอด 12 เดือน",
    isRentingQuestion: "ปัจจุบันคุณเช่าที่อยู่อาศัยอยู่หรือไม่",
    rent: "ค่าเช่าต่อเดือน",
    rentHelp: "แยกต่างหากจากค่าใช้จ่ายในการดำรงชีพอื่น ๆ",
  },

  savings: {
    totalSavings: "เงินออมทั้งหมดในปัจจุบัน",
    totalSavingsHelp: "เงินออมทั้งหมด รวมถึงเงินที่กันไว้สำหรับเป้าหมายอื่น",
    downPayment: "เงินที่พร้อมใช้เป็นเงินดาวน์",
    downPaymentHelp: "เงินสดที่คุณจะนำมาใช้ซื้อบ้านจริง โดยไม่แตะเงินสำรองฉุกเฉิน",
    maxInstallment: "ค่างวดผ่อนต่อเดือนสูงสุดที่รับได้",
    maxInstallmentHelp:
      "จำนวนเงินสูงสุดที่คุณต้องการจ่ายค่างวดบ้าน ซึ่งอาจต่ำกว่าวงเงินที่ธนาคารอนุมัติได้",
  },

  aboutYou: {
    age: "อายุของคุณ",
    ageHelp: "ใช้คำนวณระยะเวลาผ่อนสูงสุดที่ธนาคารมักจะเสนอให้คุณ",
    employmentType: "ประเภทการประกอบอาชีพ",
    employmentTypeHelp: "ไม่ส่งผลต่อตัวเลขในหน้าผลลัพธ์ของคุณ — เป็นเพียงข้อมูลประกอบมุมมองของสถาบันการเงินต่อใบสมัครของคุณ",
    employmentTypeOptions: {
      salaried: "พนักงานประจำ (มีเงินเดือน)",
      "business-owner": "เจ้าของธุรกิจ / ฟรีแลนซ์",
    },
  },

  homeGoals: {
    targetPrice: "ราคาบ้านเป้าหมายของคุณ",
    timeline: "ระยะเวลาที่ต้องการซื้อ",
    timelineHelp: (years) => `ประมาณ ${years} ปีนับจากนี้`,
    monthsUnit: (months) => `${months} เดือน`,
    purchasePurpose: "เป้าหมายหลักของคุณในการซื้อบ้านหลังนี้คืออะไร",
    purchasePurposeHelp: "ไม่ส่งผลต่อตัวเลขในหน้าผลลัพธ์ของคุณ — เป็นเพียงข้อมูลประกอบแผนของคุณ",
    purchasePurposeOptions: {
      "live-in": "อยู่อาศัยระยะยาว",
      investment: "ลงทุน / ซื้อเพื่อขายต่อ",
    },
    appreciationNote: (formattedPct) =>
      `เราใช้อัตราการเพิ่มมูลค่าบ้านต่อปีที่คาดการณ์เป็นค่าเริ่มต้นที่ ${formattedPct} — สมมติฐานอิงตลาดที่ช่วยให้ขั้นตอนนี้ง่ายขึ้น โดยอิงจากอัตราเติบโตทั่วไปในระยะยาวของอสังหาริมทรัพย์ที่พักอาศัยในไทย`,
    loanTenureNote: (years, age, maxAge, timelineYears) =>
      `จากอายุของคุณ (${age} ปี) ระยะเวลาที่คุณวางแผนจะซื้อ (${timelineYears} ปี) และเกณฑ์อายุสูงสุด ณ วันที่หนี้ครบกำหนดที่ ${maxAge} ปี เราได้คำนวณระยะเวลาผ่อนโดยประมาณให้คุณโดยอัตโนมัติที่ ${years} ปี`,
    assumptionsNote:
      "เราจะประเมินวงเงินกู้โดยใช้อัตราดอกเบี้ย 6% ต่อปี เพดานภาระหนี้ต่อรายได้ (DSR) ที่ 40% และค่าธรรมเนียมโอน/จดจำนองโดยประมาณ 2% ซึ่งเป็นสมมติฐานทั่วไปสำหรับการพิจารณาสินเชื่อบ้านเบื้องต้นในไทย วงเงินจริงที่ธนาคารเสนออาจแตกต่างกันไป",
  },

  results: {
    heading: "ผลลัพธ์ของคุณ",
    editAnswers: "แก้ไขคำตอบ",
    disclaimer:
      "เป็นเพียงตัวเลขประมาณการ โดยอิงจากสมมติฐานมาตรฐานด้านภาระหนี้ต่อรายได้ งบประมาณ และการปล่อยสินเชื่อ ไม่ใช่คำแนะนำทางการเงิน โปรดตรวจสอบคุณสมบัติที่แท้จริงกับสถาบันการเงิน",

    readiness: {
      eyebrow: "คะแนนความพร้อมซื้อบ้าน",
      statusLabels: {
        ready: "พร้อมแล้ว",
        "almost-ready": "เกือบพร้อม",
        "not-ready": "ยังไม่พร้อม",
      },
      archetypeLabels: {
        "rent-for-now": "เช่าไปก่อน",
        "early-preparation": "เริ่มเตรียมตัว",
        "emerging-buyer": "ผู้ซื้อที่กำลังมาแรง",
        "near-ready": "ใกล้พร้อมแล้ว",
        "buy-now": "ซื้อได้เลย",
      },
    },

    purchasingPower: {
      eyebrow: "กำลังซื้อของคุณ",
      title: "สิ่งที่คุณสามารถซื้อได้",
      homeBudget: "งบประมาณบ้านโดยประมาณ",
      homeBudgetCaption: "อิงจากวงเงินกู้ที่ค่างวดที่แนะนำของคุณรองรับได้ บวกเงินดาวน์ที่คุณมี",
      installment: "ค่างวดต่อเดือนที่แนะนำ",
      perMonth: (formattedAmount) => `${formattedAmount} ต่อเดือน`,
      loanTenure: "ระยะเวลาผ่อนชำระ",
      loanTenureValue: (years) => `${years} ปี`,
      loanTenureCaption: (age, maxAge, timelineYears) =>
        `คำนวณอัตโนมัติจากอายุของคุณ (${age} ปี) ระยะเวลาที่วางแผนจะซื้อ (${timelineYears} ปี) และอายุสูงสุด ${maxAge} ปี ณ วันที่หนี้ครบกำหนด`,
      zoneBarLabel: "ตำแหน่งราคาบ้านเป้าหมายของคุณ",
      yourTarget: (formattedPrice) => `เป้าหมายของคุณ: ${formattedPrice}`,
      safeUpTo: (formatted) => `ปลอดภัยไม่เกิน ${formatted}`,
      stretchUpTo: (formatted) => `ตึงมือไม่เกิน ${formatted}`,
      riskAbove: (formatted) => `เสี่ยงหากเกิน ${formatted}`,
      installmentRationale: {
        dsrBinding: (dsr) =>
          `นี่คือเพดานภาระหนี้ต่อรายได้ (DSR) มาตรฐานของธนาคารที่ ${dsr} ต่อเดือน โดยพิจารณาจากรายได้และภาระหนี้ที่มีอยู่ของคุณ`,
        budgetBinding: (budget) =>
          `นี่คือจำนวนเงินที่เหลือจริงในงบประมาณต่อเดือนของคุณหลังหักค่าใช้จ่ายและหนี้สิน — ${budget} ต่อเดือน — ซึ่งตึงกว่าเพดานมาตรฐานของธนาคาร`,
        comfortBinding: (comfortable, nextCeiling) =>
          `เราใช้เพดานค่างวดที่คุณสบายใจที่ ${comfortable} เป็นฐานในการแนะนำนี้ เพื่อรักษาความยืดหยุ่นทางการเงินของคุณ ในขณะที่เพดานจากธนาคาร/งบประมาณของคุณเอื้อให้ได้สูงสุดถึง ${nextCeiling} ต่อเดือน`,
      },
    },

    advisoryNotices: {
      eyebrow: "ข้อควรพิจารณา",
      title: "ข้อสังเกตเพิ่มเติม",
      note: "รายการเหล่านี้จะไม่เปลี่ยนแปลงตัวเลขด้านบน แต่เป็นปัจจัยจริงที่สถาบันการเงินจะนำไปพิจารณา จึงควรปรึกษาโดยตรง",
      items: {
        "negative-cash-flow": (formattedAmount) =>
          `จากข้อมูลที่คุณให้ไว้ ภาระค่าใช้จ่ายรายเดือนของคุณสูงกว่ารายได้อยู่ประมาณ ${formattedAmount} — ตัวเลขด้านล่างอาจดูดีเกินจริงจนกว่าจะแก้ไขจุดนี้ได้`,
      },
    },

    gapAndPlan: {
      eyebrow: "ช่องว่างและแผนการ",
      title: "แผนเฉพาะบุคคลของคุณ",
      gapLabel: "ช่องว่าง",
      gapReady: "ราคาบ้านเป้าหมายของคุณอยู่ในงบประมาณบ้านโดยประมาณแล้ว",
      gapShort: (formattedGap, formattedTarget) =>
        `คุณยังขาดอีก ${formattedGap} เพื่อให้ถึงราคาบ้านเป้าหมาย ${formattedTarget} โดยคำนวณจากความสามารถในการกู้และเงินดาวน์ที่มี`,
      planLabel: "แผนการ",
      planReady: "คุณสามารถเริ่มมองหาบ้านและยื่นขอสินเชื่อเบื้องต้นได้เลย",
      planOptionDownPayment: (formattedAmount) =>
        `ออมเงินดาวน์เพิ่มอีก ${formattedAmount} จากที่มีอยู่แล้ว เพื่อให้ถึงราคานี้โดยไม่ต้องเปลี่ยนค่างวดต่อเดือน`,
      planOptionInstallment: (formattedAdditional, formattedTotal) =>
        `หรือเพิ่มความสามารถผ่อนต่อเดือนอีกประมาณ ${formattedAdditional} (รวมเป็นประมาณ ${formattedTotal}) — ผ่านการเพิ่มรายได้ ลดหนี้สินที่มีอยู่ หรือขยายระยะเวลากู้ — เพื่อให้กู้ได้ตามวงเงินที่ราคานี้ต้องการ`,
      transactionFeeNoteLabel: "ค่าธรรมเนียมที่ต้องเผื่อ",
      transactionFeeNote: (formattedFeeAtAffordable, formattedAffordablePrice, formattedFeeAtTarget, formattedTargetPrice) =>
        `นอกจากเงินดาวน์ อย่าลืมเผื่อค่าธรรมเนียมโอน+จดจำนอง (ประมาณ 2% ของราคาบ้าน) ด้วย — ประมาณ ${formattedFeeAtAffordable} ที่งบประมาณบ้านโดยประมาณของคุณ (${formattedAffordablePrice}) หรือประมาณ ${formattedFeeAtTarget} ที่ราคาบ้านเป้าหมาย (${formattedTargetPrice})`,
      alternativesLabel: "ทางเลือกอื่น",
      suggestions: {
        overRiskBudget: (formattedAmount) => [
          `บ้านเป้าหมายของคุณสูงกว่างบตึงมือ (Stretch Budget) ซึ่งเป็นเพดานบนของช่วงงบที่แนะนำ ประมาณ ${formattedAmount}`,
          "ลองพิจารณาทำเลใกล้เคียง บ้านขนาดเล็กลง หรือขยายระยะเวลาผ่อนเพื่อลดค่างวดต่อเดือน",
        ],
        stretchZone: [
          "บ้านเป้าหมายของคุณอยู่ในโซนตึงมือ — ยังพอไหว แต่แทบไม่มีพื้นที่เผื่อหากดอกเบี้ยขึ้นหรือมีค่าใช้จ่ายไม่คาดคิด",
          "ลองพิจารณาราคาที่ต่ำลงเล็กน้อยเพื่อให้หายใจได้คล่องขึ้น",
        ],
        noSavingPlan:
          "คุณยังไม่ได้กำหนดจำนวนเงินออมต่อเดือน ทำให้เงินสดที่ยังขาดสำหรับเงินดาวน์และค่าใช้จ่ายวันโอนจะไม่ค่อยๆ ลดลงเอง ลองตั้งเป้าหมายการออมแม้เพียงเล็กน้อยเพื่อให้ได้ระยะเวลาที่เป็นจริง",
        comfortLimited:
          "เพดานค่างวดที่คุณสบายใจต่ำกว่าเพดานจากธนาคาร/งบประมาณของคุณ นี่คือส่วนต่างเพื่อความปลอดภัยที่ดี ไม่ใช่จุดอ่อน และช่วยเผื่อไว้หากดอกเบี้ยเปลี่ยนแปลง",
        lowEmergencyCushion: (formattedAmount) =>
          `หลังหักค่าใช้จ่ายวันโอนกรรมสิทธิ์แล้ว คุณจะเหลือเงินสำรองฉุกเฉินไม่ถึง 3 เดือนของค่าใช้จ่าย ลองเพิ่มเงินสำรองฉุกเฉินอีกประมาณ ${formattedAmount} ก่อนหรือควบคู่ไปกับการออมเงินเพื่อซื้อบ้าน`,
      },
      keepInMindLabel: "ข้อควรรู้เพิ่มเติม",
      keepInMindText:
        "โครงการสินเชื่อบ้านหลังแรกจากภาครัฐและโปรโมชันดอกเบี้ยพิเศษมีออกมาเป็นระยะในประเทศไทย ลองตรวจสอบข้อเสนอปัจจุบันจากธนาคาร เช่น ธอส. (GHB) ออมสิน (GSB) และธนาคารพาณิชย์อื่น ๆ ก่อนตัดสินใจเลือกอัตราดอกเบี้ย",
    },

    buyVsRent: {
      eyebrow: "ซื้อ vs เช่า",
      title: "เปรียบเทียบการซื้อและการเช่า",

      basisToggle: {
        label: "เปรียบเทียบโดยอิงจาก",
        budgetOption: (formattedPrice) => `งบประมาณบ้านของคุณ (${formattedPrice})`,
        targetOption: (formattedPrice) => `ราคาบ้านเป้าหมายของคุณ (${formattedPrice})`,
      },

      valueHighlight: {
        eyebrow: "มูลค่าบ้านใน 10 ปี",
        todayLabelBudget: "งบประมาณบ้านโดยประมาณ",
        todayLabelTarget: "ราคาบ้านเป้าหมายของคุณ",
        futureLabel: "ในอีก 10 ปี",
        basisLabelBudget: "งบประมาณบ้านที่แนะนำของคุณ",
        basisLabelTarget: "ราคาบ้านเป้าหมายของคุณ",
        growthNote: (formattedPrice, formattedAppreciationPct, basisLabel) =>
          `คำนวณจาก${basisLabel}ที่ ${formattedPrice} โดยสมมติให้มูลค่าเพิ่มขึ้นปีละ ${formattedAppreciationPct} ซึ่งเป็นค่าประมาณทั่วไปในระยะยาว`,
        rentNote:
          "การเช่าไม่ได้สร้างส่วนของเจ้าของบ้านหรือมูลค่าทรัพย์สินใด ๆ ให้คุณ — นี่คือสิ่งที่แลกมากับความยืดหยุ่นของการเช่า ปัดไปทางตัวเลือกซื้อเพื่อดูว่าราคาที่แสดงด้านบนจะเติบโตเป็นเท่าไหร่ในอีก 10 ปี",
        rentToOwnNote: (formattedPaidDown) =>
          `เงินที่จ่ายในแบบเช่าเพื่อซื้อบางส่วนจะถูกนับเข้าเป็นมูลค่าบ้าน — หลังจาก 3 ปี คุณจะผ่อนชำระไปแล้วประมาณ ${formattedPaidDown} ซึ่งนับเป็นส่วนหนึ่งของการเป็นเจ้าของบ้าน`,
      },

      comparisonTitle: "เทียบเช่า เช่าเพื่อซื้อ และซื้อ",
      swipeHint: "ปัดหรือลากเพื่อสลับตัวเลือก",
      scenarioRent: "เช่า",
      scenarioRentToOwn: "เช่าเพื่อซื้อ",
      scenarioBuy: "ซื้อ",
      scenarioNotes: {
        rent: "รักษาสภาพคล่องของเงินสด ปรับเปลี่ยนไปใช้เป้าหมายอื่นได้ง่ายกว่า",
        rentToOwn: "ให้คุณได้อยู่อาศัยในบ้านไปพร้อมกับเตรียมตัวเป็นเจ้าของบ้านทีละขั้น — ทางเลือกกึ่งกลางระหว่างการเช่ากับการซื้อทันที",
        buy: "สร้างส่วนของเจ้าของบ้านในระยะยาว พร้อมที่อยู่อาศัยที่มั่นคงและคาดการณ์ได้",
      },
      housingPaymentLabels: {
        rent: "ค่าเช่าต่อเดือน",
        rentToOwn: "ค่างวดเช่าเพื่อซื้อ",
        buy: "ค่างวดผ่อนบ้าน",
      },
      metrics: {
        remainingLabel: "เงินคงเหลือต่อเดือน",
        remainingPctCaption: (pct) => `คิดเป็น ${pct} ของรายได้คุณ`,
        cushionStatusLabels: {
          comfortable: "สบาย ๆ",
          moderate: "ตึงมือ",
          "high-risk": "เสี่ยงสูง",
        },
        income: "รายได้ต่อเดือน",
        remainingExplanation: {
          infoLabel: "ทำไมถึงเป็นตัวเลขนี้",
          noExpenses: "คุณไม่มีค่าใช้จ่ายประจำเลย รายได้ทั้งหมดของคุณจึงเหลือใช้ได้ในแต่ละเดือน",
          shortfall: (formattedShortfall, topFactorLabel, topFactorPct) =>
            `ค่าใช้จ่ายต่อเดือนของคุณสูงกว่ารายได้ประมาณ ${formattedShortfall} โดย${topFactorLabel}เป็นสาเหตุหลัก คิดเป็น ${topFactorPct} ของรายได้คุณ`,
          shortfallWithSecond: (formattedShortfall, topFactorLabel, topFactorPct, secondFactorLabel, secondFactorPct) =>
            `ค่าใช้จ่ายต่อเดือนของคุณสูงกว่ารายได้ประมาณ ${formattedShortfall} โดย${topFactorLabel} (${topFactorPct}) และ${secondFactorLabel} (${secondFactorPct}) เป็นสาเหตุหลักรวมกัน`,
          tight: (topFactorLabel, topFactorPct) =>
            `${topFactorLabel}คิดเป็นสัดส่วนที่ใหญ่ที่สุดของรายได้คุณที่ ${topFactorPct} ทำให้เหลือพื้นที่ในงบประมาณน้อยลงในแต่ละเดือน`,
          tightWithSecond: (topFactorLabel, topFactorPct, secondFactorLabel, secondFactorPct) =>
            `${topFactorLabel} (${topFactorPct}) และ${secondFactorLabel} (${secondFactorPct}) รวมกันคิดเป็นสัดส่วนส่วนใหญ่ของรายได้คุณ ทำให้เหลือพื้นที่ในงบประมาณน้อยลงในแต่ละเดือน`,
          comfortable: (topFactorLabel, remainingPct) =>
            `แม้จะหักค่าใช้จ่ายที่มากที่สุดอย่าง${topFactorLabel}แล้ว คุณก็ยังเหลือรายได้ ${remainingPct} ในแต่ละเดือน — ถือว่าสบาย ๆ`,
        },
      },
      allocation: {
        title: "เงินก้อนนี้ไปไหนบ้าง",
        livingExpenses: "ค่าใช้จ่ายในการดำรงชีพ",
        debt: "หนี้สินที่มีอยู่",
      },
      previousCard: "ดูตัวเลือกก่อนหน้า",
      nextCard: "ดูตัวเลือกถัดไป",

      recommendation: {
        eyebrow: "สรุปสำหรับคุณ",
        rentSummary: (formattedPayment) =>
          `เช่า: ยืดหยุ่นกว่า และโดยทั่วไปมีภาระผูกพันต่อเดือนต่ำที่สุด — ประมาณ ${formattedPayment} ต่อเดือน โดยไม่มีข้อผูกมัดระยะยาว`,
        rentToOwnSummary: (formattedPayment) =>
          `เช่าเพื่อซื้อ: ทางสู่การเป็นเจ้าของบ้านแบบค่อยเป็นค่อยไป มีภาระก้อนแรกต่ำกว่าการซื้อ — ประมาณ ${formattedPayment} ต่อเดือน โดยแต่ละงวดจะถูกนับเป็นส่วนหนึ่งของมูลค่าบ้าน`,
        buySummary: (formattedPayment) =>
          `ซื้อ: เป็นเจ้าของทันทีและสร้างส่วนของเจ้าของบ้านในระยะยาว — ประมาณ ${formattedPayment} ต่อเดือน โดยเริ่มสร้างส่วนของเจ้าของบ้านตั้งแต่วันแรก`,
      },

      rentEstimateNote: (formattedYield, formattedRent, basisLabel) =>
        `เราประมาณค่าเช่าจากอัตราผลตอบแทนค่าเช่าเฉลี่ย ${formattedYield} ของ${basisLabel}: ประมาณ ${formattedRent} ต่อเดือน`,
      rentToOwnEstimateNote: (formattedContractFee, formattedMarkupPct, basisLabel) =>
        `เราประมาณค่าเช่าเพื่อซื้อโดยใช้ราคาสัญญาที่สูงกว่า${basisLabel} ${formattedMarkupPct} บวกค่าทำสัญญาแบบจ่ายครั้งเดียวประมาณ ${formattedContractFee} ในวันทำสัญญา`,
    },
  },

  master: {
    toggleLabel: "Master",
    title: "โหมด Master",
    subtitle: "ปรับสมมติฐานใดก็ได้ แล้วดูผลลัพธ์ทั้งหมดเปลี่ยนแบบเรียลไทม์",
    assumptionsTitle: "สมมติฐาน",
    answersTitle: "คำตอบของคุณ",
    resultsTitle: "ผลลัพธ์",
    resetButton: "รีเซ็ตเป็นค่าเริ่มต้น",
    closeButton: "ปิด",
    assumptionLabels: {
      debtServiceRatio: "อัตราส่วนภาระหนี้ต่อรายได้ (DSR)",
      annualInterestRate: "อัตราดอกเบี้ยต่อปี",
      downPaymentRate: "อัตราเงินดาวน์ขั้นต่ำ",
      safeBudgetMultiplier: "ตัวคูณงบประมาณที่ปลอดภัย",
      stretchBudgetMultiplier: "ตัวคูณงบประมาณสูงสุด",
      riskZoneMultiplier: "ตัวคูณเขตความเสี่ยง",
    },
  },
};
