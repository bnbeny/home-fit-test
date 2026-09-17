interface ActionStepProps {
  /** Position in the page's sequence of "what to do next" prompts (adjust
   *  the target price, choose a comparison basis, tap a card) — purely a
   *  display number, doesn't drive any ordering logic. */
  step: number;
  /** The action itself — bold and in the same blue across every instance,
   *  so it reads as "do this" wherever it appears on the page. */
  title: string;
  /** Optional supporting context, kept visually distinct (normal weight,
   *  neutral gray) so it never competes with the action for attention. */
  description?: string;
}

/** One consistent visual language for every actionable prompt on the
 *  Results page, so a user scanning the page can tell "do this" text apart
 *  from the explanatory text around it at a glance. */
export function ActionStep({ step, title, description }: ActionStepProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold leading-none text-white"
        aria-hidden="true"
      >
        {step}
      </span>
      <p className="text-sm leading-snug">
        <span className="font-semibold text-brand-blue">{title}</span>
        {description && <span className="text-ink-muted"> {description}</span>}
      </p>
    </div>
  );
}
