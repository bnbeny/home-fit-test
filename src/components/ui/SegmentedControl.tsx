interface SegmentedControlProps<T extends string | number> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  helperText?: string;
}

export function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
  helperText,
}: SegmentedControlProps<T>) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
      <div className="inline-flex rounded-lg bg-surface-sunken p-1" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {helperText && <p className="mt-2 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
}
