import { useId, useState } from "react";
import { Card } from "../ui/Card";
import { StepIncome } from "../form/StepIncome";
import { StepDebt } from "../form/StepDebt";
import { StepExpenses } from "../form/StepExpenses";
import { StepSavings } from "../form/StepSavings";
import { StepAboutYou } from "../form/StepAboutYou";
import { StepHomeGoals } from "../form/StepHomeGoals";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface MasterAnswersPanelProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

/** Same 6 steps as the questionnaire wizard (QuestionnaireForm), in the same
 *  order as form.stepLabels — reused here as an accordion instead of a
 *  Back/Next flow, since every Step component is already just a controlled
 *  {answers, onUpdate} block with no internal navigation logic. */
const STEP_COMPONENTS = [
  StepAboutYou,
  StepHomeGoals,
  StepIncome,
  StepDebt,
  StepExpenses,
  StepSavings,
] as const;

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

export function MasterAnswersPanel({ answers, onUpdate }: MasterAnswersPanelProps) {
  const { t } = useLanguage();
  const stepLabels = t.form.stepLabels;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <Card title={t.master.answersTitle}>
      <div className="space-y-3">
        {stepLabels.map((label, index) => {
          const StepComponent = STEP_COMPONENTS[index];
          const isOpen = openIndex === index;
          const contentId = `${baseId}-${index}`;
          return (
            <div key={label} className="overflow-hidden rounded-lg border border-black/10">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </span>
                <ChevronIcon
                  className={`h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                id={contentId}
                role="region"
                aria-hidden={!isOpen}
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1">
                    <StepComponent answers={answers} onUpdate={onUpdate} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
