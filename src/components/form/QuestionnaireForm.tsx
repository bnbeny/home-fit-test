import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StepIndicator } from "./StepIndicator";
import { StepIncome } from "./StepIncome";
import { StepDebt } from "./StepDebt";
import { StepExpenses } from "./StepExpenses";
import { StepSavings } from "./StepSavings";
import { StepAboutYou } from "./StepAboutYou";
import { StepHomeGoals } from "./StepHomeGoals";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface QuestionnaireFormProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
  onSubmit: () => void;
}

const HOME_GOALS_STEP = 1;
const INCOME_STEP = 2;

/** A step is valid once its key inputs are non-zero — sliders always have a
 *  value, so this mainly guards against someone racing through with $0
 *  income or a $0 timeline, which would make every downstream ratio
 *  meaningless (division by zero, 0% readiness, etc). */
function isStepValid(step: number, answers: QuestionnaireAnswers): boolean {
  switch (step) {
    case INCOME_STEP:
      return (
        answers.primaryIncomeMonthly + answers.additionalIncomeMonthly + answers.bonusAnnual / 12 > 0
      );
    case HOME_GOALS_STEP:
      return answers.targetTimelineMonths > 0;
    default:
      return true;
  }
}

export function QuestionnaireForm({ answers, onUpdate, onSubmit }: QuestionnaireFormProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const stepLabels = t.form.stepLabels;
  const isLastStep = step === stepLabels.length - 1;
  const canAdvance = isStepValid(step, answers);

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      onSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <Card>
      <StepIndicator steps={stepLabels} currentIndex={step} />

      {step === 0 && <StepAboutYou answers={answers} onUpdate={onUpdate} />}
      {step === HOME_GOALS_STEP && <StepHomeGoals answers={answers} onUpdate={onUpdate} />}
      {step === INCOME_STEP && <StepIncome answers={answers} onUpdate={onUpdate} />}
      {step === 3 && <StepDebt answers={answers} onUpdate={onUpdate} />}
      {step === 4 && <StepExpenses answers={answers} onUpdate={onUpdate} />}
      {step === 5 && <StepSavings answers={answers} onUpdate={onUpdate} />}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {t.form.back}
        </Button>
        <Button type="button" onClick={handleNext} disabled={!canAdvance}>
          {isLastStep ? t.form.seeResults : t.form.next}
        </Button>
      </div>
      {!canAdvance && (
        <p className="mt-3 text-right text-xs text-brand-critical">
          {step === INCOME_STEP ? t.form.incomeRequired : t.form.priceRequired}
        </p>
      )}
    </Card>
  );
}
