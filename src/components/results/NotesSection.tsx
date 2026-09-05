import { BUY_LOAN_TENURE_YEARS, formatPercent } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { CalculationAssumptions } from "../../types/finance";

interface NotesSectionProps {
  assumptions: CalculationAssumptions;
  appreciationPct: number;
}

/** The one and only Notes section in the app — every assumption,
 *  disclaimer, and important context the calculations rely on, in a single
 *  list at the very bottom of the results page. Values are interpolated
 *  live from the active assumptions rather than hardcoded, so this stays
 *  accurate even when Master mode tunes them. See Translations.results.notes
 *  for what this consolidates and replaces. */
export function NotesSection({ assumptions, appreciationPct }: NotesSectionProps) {
  const { t } = useLanguage();
  const copy = t.results.notes;

  const items = [
    copy.disclaimer,
    copy.buyAssumptions(
      BUY_LOAN_TENURE_YEARS,
      formatPercent(assumptions.annualInterestRate, 0),
      formatPercent(assumptions.debtServiceRatio, 0),
      formatPercent(assumptions.transactionCostRate, 0),
    ),
    copy.rentAndRtoAssumptions(
      formatPercent(assumptions.rentalYieldPct, 1),
      formatPercent(assumptions.rtoPriceMarkupRate, 0),
      formatPercent(assumptions.rtoContractFeeRate, 0),
    ),
    copy.growthAssumption(formatPercent(appreciationPct, 1)),
    copy.governmentSchemes,
  ];

  return (
    <div className="border-t border-black/10 pt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{copy.title}</p>
      <ul className="mt-3 list-disc space-y-2 pl-4 text-xs text-ink-muted">
        {items.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
