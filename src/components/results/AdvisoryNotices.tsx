import { Card } from "../ui/Card";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { AdvisoryNotice } from "../../types/finance";
import type { Translations } from "../../i18n/types";

interface AdvisoryNoticesProps {
  notices: AdvisoryNotice[];
}

function renderNotice(
  notice: AdvisoryNotice,
  items: Translations["results"]["advisoryNotices"]["items"],
): string {
  const entry = items[notice.key];
  return typeof entry === "function" ? entry(formatTHB(notice.amountTHB ?? 0)) : entry;
}

/** Credit-profile flags and a pre-housing cash-flow shortfall — advisory
 *  only, by design (see getAdvisoryNotices in lib/calculations.ts). Nothing
 *  here changes a number elsewhere on the page; the icon/tone/copy all
 *  reinforce that this is "worth discussing," not "you failed a check." */
export function AdvisoryNotices({ notices }: AdvisoryNoticesProps) {
  const { t } = useLanguage();
  const copy = t.results.advisoryNotices;

  if (notices.length === 0) return null;

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title}>
      <ul className="space-y-3">
        {notices.map((notice) => (
          <li key={notice.key} className="flex gap-2.5 rounded-lg bg-surface-sunken p-4 text-sm text-ink">
            <span className="mt-0.5 shrink-0 text-brand-mandarin" aria-hidden="true">
              ⚠
            </span>
            <span>{renderNotice(notice, copy.items)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-muted">{copy.note}</p>
    </Card>
  );
}
