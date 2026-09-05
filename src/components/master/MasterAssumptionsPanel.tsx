import { Card } from "../ui/Card";
import { SliderField } from "../ui/SliderField";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_ASSUMPTIONS } from "../../types/finance";
import type { CalculationAssumptions } from "../../types/finance";

interface MasterAssumptionsPanelProps {
  assumptions: CalculationAssumptions;
  onChange: (patch: Partial<CalculationAssumptions>) => void;
  onReset: () => void;
}

const formatPct = (v: number) => `${v}%`;

/** The 6 core assumptions from the calculation audit (DEFAULT_ASSUMPTIONS in
 *  finance.ts) as live-editable percent sliders. Every field here is stored
 *  as a fraction (0.4 = 40%) but edited in whole percentage points, since
 *  that's how each one is documented and reasoned about. */
export function MasterAssumptionsPanel({
  assumptions,
  onChange,
  onReset,
}: MasterAssumptionsPanelProps) {
  const { t } = useLanguage();
  const labels = t.master.assumptionLabels;

  return (
    <Card title={t.master.assumptionsTitle}>
      <div className="space-y-6">
        <SliderField
          label={labels.debtServiceRatio}
          value={Math.round(assumptions.debtServiceRatio * 100)}
          onChange={(v) => onChange({ debtServiceRatio: v / 100 })}
          min={0}
          max={100}
          step={1}
          format={formatPct}
        />
        <SliderField
          label={labels.annualInterestRate}
          value={Math.round(assumptions.annualInterestRate * 1000) / 10}
          onChange={(v) => onChange({ annualInterestRate: v / 100 })}
          min={0}
          max={20}
          step={0.1}
          format={formatPct}
        />
        <SliderField
          label={labels.downPaymentRate}
          value={Math.round(assumptions.downPaymentRate * 100)}
          onChange={(v) => onChange({ downPaymentRate: v / 100 })}
          min={0}
          max={15}
          step={1}
          format={formatPct}
        />
        <SliderField
          label={labels.safeBudgetMultiplier}
          value={Math.round(assumptions.safeBudgetMultiplier * 100)}
          onChange={(v) => onChange({ safeBudgetMultiplier: v / 100 })}
          min={50}
          max={100}
          step={1}
          format={formatPct}
        />
        <SliderField
          label={labels.stretchBudgetMultiplier}
          value={Math.round(assumptions.stretchBudgetMultiplier * 100)}
          onChange={(v) => onChange({ stretchBudgetMultiplier: v / 100 })}
          min={50}
          max={150}
          step={1}
          format={formatPct}
        />
        <SliderField
          label={labels.riskZoneMultiplier}
          value={Math.round(assumptions.riskZoneMultiplier * 100)}
          onChange={(v) => onChange({ riskZoneMultiplier: v / 100 })}
          min={100}
          max={150}
          step={1}
          format={formatPct}
        />
      </div>

      <Button
        variant="secondary"
        className="mt-6 w-full"
        onClick={onReset}
        disabled={
          JSON.stringify(assumptions) === JSON.stringify(DEFAULT_ASSUMPTIONS)
        }
      >
        {t.master.resetButton}
      </Button>
    </Card>
  );
}
