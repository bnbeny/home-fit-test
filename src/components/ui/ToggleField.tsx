interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  trueLabel: string;
  falseLabel: string;
  helperText?: string;
}

/** Boolean Yes/No pill switch. Same visual language as SegmentedControl, but
 *  built for `boolean` directly rather than fighting that component's
 *  `T extends string | number` generic constraint. */
export function ToggleField({
  label,
  value,
  onChange,
  trueLabel,
  falseLabel,
  helperText,
}: ToggleFieldProps) {
  const pillClass = (selected: boolean) =>
    `rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
      selected ? "bg-brand-blue text-white shadow-sm" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
      <div className="inline-flex rounded-lg bg-surface-sunken p-1" role="radiogroup" aria-label={label}>
        <button
          type="button"
          role="radio"
          aria-checked={value}
          onClick={() => onChange(true)}
          className={pillClass(value)}
        >
          {trueLabel}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!value}
          onClick={() => onChange(false)}
          className={pillClass(!value)}
        >
          {falseLabel}
        </button>
      </div>
      {helperText && <p className="mt-2 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
}
