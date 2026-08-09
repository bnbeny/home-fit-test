interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="mb-8 flex items-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-figure ${
                  isComplete
                    ? "bg-brand-mint text-brand-navy"
                    : isCurrent
                      ? "bg-brand-blue text-white"
                      : "bg-black/10 text-ink-muted"
                }`}
                aria-hidden="true"
              >
                {isComplete ? "✓" : index + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  isCurrent ? "text-ink" : "text-ink-muted"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px flex-1 ${isComplete ? "bg-brand-mint" : "bg-black/10"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
