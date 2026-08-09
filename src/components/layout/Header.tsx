import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
  isMasterOpen: boolean;
  onToggleMaster: () => void;
}

export function Header({ isMasterOpen, onToggleMaster }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="relative bg-gradient-to-r from-brand-navy to-brand-blue px-4 py-10 text-white sm:py-14">
      <button
        type="button"
        onClick={onToggleMaster}
        aria-pressed={isMasterOpen}
        className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm transition-colors sm:left-6 sm:top-6 ${
          isMasterOpen ? "bg-white text-brand-navy" : "bg-white/10 text-white/70 hover:text-white"
        }`}
      >
        {t.master.toggleLabel}
      </button>
      <LanguageToggle />
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
          {t.header.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t.header.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">{t.header.subtitle}</p>
      </div>
    </header>
  );
}
