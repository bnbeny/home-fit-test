import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="relative bg-gradient-to-r from-brand-navy to-brand-blue px-4 py-10 text-white sm:py-14">
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
