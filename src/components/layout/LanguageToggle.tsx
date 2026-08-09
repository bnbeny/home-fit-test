import { useLanguage } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/types";

const OPTIONS: { value: Language; label: string; name: string }[] = [
  { value: "en", label: "EN", name: "English" },
  { value: "th", label: "ไทย", name: "ไทย" },
];

/** Top-right language switch. Both options are always visible and clickable
 *  (rather than one button that silently flips) so the current language is
 *  never ambiguous at a glance. */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="absolute right-4 top-4 inline-flex rounded-full bg-white/10 p-1 backdrop-blur-sm sm:right-6 sm:top-6"
      role="radiogroup"
      aria-label="Language"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.name}
            onClick={() => setLanguage(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              selected ? "bg-white text-brand-navy" : "text-white/70 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
