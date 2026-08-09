interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Formats the read-only value shown beside the label, e.g. "฿35,000". */
  format?: (value: number) => string;
  helperText?: string;
}

/**
 * Slider + editable number input, kept in sync. Sliders alone are fast but
 * imprecise for money; a lone number input is precise but slow to explore.
 * Pairing them covers both a "roughly drag to a number" user and a "I know
 * my exact salary" user.
 */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v) => v.toLocaleString("en-US"),
  helperText,
}: SliderFieldProps) {
  const clampToRange = (raw: number) => {
    if (Number.isNaN(raw)) return min;
    return Math.min(max, Math.max(min, raw));
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-ink">{label}</label>
        <input
          type="number"
          inputMode="numeric"
          className="tabular-figure w-32 rounded-lg border border-black/10 bg-surface-sunken px-2 py-1 text-right text-sm font-semibold text-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(clampToRange(Number(e.target.value)))}
          aria-label={`${label} (exact value)`}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-brand-blue"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {helperText && <p className="mt-2 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
}
