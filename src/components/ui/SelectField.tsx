import { useId } from "react";

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  helperText?: string;
}

/** Native dropdown, styled to match the app's other inputs — used for
 *  short, single-select questions like employment type or purchase purpose. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  helperText,
}: SelectFieldProps<T>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-black/10 bg-surface-sunken px-3 py-2 text-sm font-medium text-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <p className="mt-2 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
}
