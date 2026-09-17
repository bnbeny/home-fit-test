import { STATUS_STYLES } from "./statusStyles";
import { useLanguage } from "../../i18n/LanguageContext";
import type { ReadinessResult } from "../../types/finance";

interface ReadinessScoreProps {
  readiness: ReadinessResult;
}

export function ReadinessScore({ readiness }: ReadinessScoreProps) {
  const { t } = useLanguage();
  const style = STATUS_STYLES[readiness.status];
  const statusLabel = t.results.readiness.statusLabels[readiness.status];

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-ink">{t.results.readiness.eyebrow}</h3>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {/* Hero figure: the one number this view leads with. */}
          <p className="hero-figure text-6xl font-bold leading-none text-ink">
            {readiness.readinessPercent}
            <span className="text-2xl font-semibold text-ink-muted">%</span>
          </p>
        </div>
        {/* Status never rides on color alone: icon + label travel with it. */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${style.text} ${style.border}`}
        >
          <span aria-hidden="true">{style.icon}</span>
          {statusLabel}
        </span>
      </div>

      {/* Meter: fill = status color, track = a lighter tint of the same hue. */}
      <div className="mt-5">
        <div
          className={`h-3 w-full overflow-hidden rounded-full ${style.bg}/15`}
          role="meter"
          aria-valuenow={readiness.readinessPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t.results.readiness.eyebrow}
        >
          <div
            className={`h-full rounded-full ${style.bg} transition-all`}
            style={{ width: `${readiness.readinessPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
