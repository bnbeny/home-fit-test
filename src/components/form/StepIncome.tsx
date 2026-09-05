import { useState } from "react";
import { SliderField } from "../ui/SliderField";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

type DisplayMode = "monthly" | "annual";

/** Compact Monthly/Annual pill pair, sized to sit inline next to a field's
 *  own label (SliderField's labelAdornment slot) rather than as its own
 *  full-width row — same selected/unselected visual language as
 *  SegmentedControl, just smaller. */
function UnitToggle({
  mode,
  onChange,
  monthlyLabel,
  annualLabel,
  ariaLabel,
}: {
  mode: DisplayMode;
  onChange: (mode: DisplayMode) => void;
  monthlyLabel: string;
  annualLabel: string;
  ariaLabel: string;
}) {
  const pillClass = (selected: boolean) =>
    `rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
      selected ? "bg-brand-blue text-white shadow-sm" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <div className="inline-flex rounded-md bg-surface-sunken p-0.5" role="radiogroup" aria-label={ariaLabel}>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "monthly"}
        onClick={() => onChange("monthly")}
        className={pillClass(mode === "monthly")}
      >
        {monthlyLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "annual"}
        onClick={() => onChange("annual")}
        className={pillClass(mode === "annual")}
      >
        {annualLabel}
      </button>
    </div>
  );
}

/** Monthly/Annual is a display-only toggle, local to this component —
 *  QuestionnaireAnswers always stores primaryIncomeMonthly and
 *  additionalIncomeMonthly as monthly THB, regardless of which unit the
 *  user is currently viewing/editing them in. Primary and Additional each
 *  get their own independent toggle, since one may be naturally quoted
 *  monthly (a salary) and the other annually (a lump-sum rental payout). */
function IncomeAmountField({
  label,
  helperText,
  monthlyValue,
  onChangeMonthly,
  monthlyMax,
  annualMax,
  monthlyStep,
  annualStep,
  displayModeLabel,
  displayModeMonthly,
  displayModeAnnual,
}: {
  label: string;
  helperText: string;
  monthlyValue: number;
  onChangeMonthly: (monthlyValue: number) => void;
  monthlyMax: number;
  annualMax: number;
  monthlyStep: number;
  annualStep: number;
  displayModeLabel: string;
  displayModeMonthly: string;
  displayModeAnnual: string;
}) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("monthly");
  const isAnnual = displayMode === "annual";
  const toDisplay = (v: number) => (isAnnual ? v * 12 : v);
  const fromDisplay = (v: number) => (isAnnual ? v / 12 : v);

  return (
    <SliderField
      label={label}
      labelAdornment={
        <UnitToggle
          mode={displayMode}
          onChange={setDisplayMode}
          monthlyLabel={displayModeMonthly}
          annualLabel={displayModeAnnual}
          ariaLabel={displayModeLabel}
        />
      }
      value={toDisplay(monthlyValue)}
      onChange={(v) => onChangeMonthly(fromDisplay(v))}
      min={0}
      max={isAnnual ? annualMax : monthlyMax}
      step={isAnnual ? annualStep : monthlyStep}
      format={formatTHB}
      helperText={helperText}
    />
  );
}

export function StepIncome({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  const copy = t.income;

  return (
    <div className="space-y-6">
      <IncomeAmountField
        label={copy.primary}
        helperText={copy.primaryHelp}
        monthlyValue={answers.primaryIncomeMonthly}
        onChangeMonthly={(v) => onUpdate({ primaryIncomeMonthly: v })}
        monthlyMax={1_000_000}
        annualMax={12_000_000}
        monthlyStep={1_000}
        annualStep={12_000}
        displayModeLabel={copy.displayModeLabel}
        displayModeMonthly={copy.displayModeMonthly}
        displayModeAnnual={copy.displayModeAnnual}
      />
      <IncomeAmountField
        label={copy.additional}
        helperText={copy.additionalHelp}
        monthlyValue={answers.additionalIncomeMonthly}
        onChangeMonthly={(v) => onUpdate({ additionalIncomeMonthly: v })}
        monthlyMax={300_000}
        annualMax={3_600_000}
        monthlyStep={1_000}
        annualStep={12_000}
        displayModeLabel={copy.displayModeLabel}
        displayModeMonthly={copy.displayModeMonthly}
        displayModeAnnual={copy.displayModeAnnual}
      />
      <SliderField
        label={copy.bonus}
        value={answers.bonusAnnual}
        onChange={(v) => onUpdate({ bonusAnnual: v })}
        min={0}
        max={3_000_000}
        step={1_000}
        format={formatTHB}
        helperText={copy.bonusHelp}
      />

      {/* Set off by a divider — a co-borrower's income is a different
          person's money, not another "your own income" field, so it reads
          as its own section rather than a fourth item in the list above. */}
      <div className="border-t border-black/10 pt-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {copy.coBorrowerSectionLabel}
        </p>
        <IncomeAmountField
          label={copy.coBorrower}
          helperText={copy.coBorrowerHelp}
          monthlyValue={answers.coBorrowerIncomeMonthly}
          onChangeMonthly={(v) => onUpdate({ coBorrowerIncomeMonthly: v })}
          monthlyMax={1_000_000}
          annualMax={12_000_000}
          monthlyStep={1_000}
          annualStep={12_000}
          displayModeLabel={copy.displayModeLabel}
          displayModeMonthly={copy.displayModeMonthly}
          displayModeAnnual={copy.displayModeAnnual}
        />
      </div>
    </div>
  );
}
