import { useLanguage } from "../../i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="px-4 py-8 text-center text-xs text-ink-muted">
      <p>{t.footer.note}</p>
    </footer>
  );
}
