import { useEffect, useRef, useState } from "react";

/** The (i) glyph itself — purely decorative where it's used bare, or wrapped
 *  as the click target inside InfoTooltip below where there's a real
 *  explanation to show. */
export function InfoDot({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 text-ink-muted/60 ${className}`}
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v4.5" strokeLinecap="round" />
      <circle cx="10" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Click/tap-to-open explanation popover for an (i) icon — deliberately
 *  click-triggered rather than hover, since hover has no equivalent on touch
 *  devices, and the icon is often inside a clickable container elsewhere on
 *  the page (stopPropagation keeps opening the popover from also triggering
 *  that container's own click handler). Closes on an outside pointerdown,
 *  Escape, or toggling the icon again. Shared by BuyVsRentComparison and
 *  BudgetZoneBar so both use one tooltip contract instead of two. */
export function InfoTooltip({
  text,
  align = "left",
  placement = "bottom",
}: {
  text: string;
  /** Only meaningful for placement "top"/"bottom" — which side of the icon
   *  the popover's own edge lines up with. */
  align?: "left" | "right";
  /** "bottom" (default) opens the popover below the icon, "top" above it.
   *  "start" instead flies the popover out to the side (left of the icon),
   *  vertically centered on it — for an icon with little room above or
   *  below (e.g. a label floating just above a chart/bar, with more UI
   *  directly underneath that "top"/"bottom" would run straight into). */
  placement?: "top" | "bottom" | "start";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      >
        <InfoDot />
      </button>
      {isOpen && (
        <span
          role="tooltip"
          className={`absolute z-20 w-60 max-w-[80vw] whitespace-normal rounded-lg border border-black/10 bg-white p-3 text-left text-xs font-normal normal-case leading-snug tracking-normal text-ink shadow-lg ${
            placement === "start"
              ? "right-full top-1/2 mr-1.5 -translate-y-1/2"
              : placement === "top"
                ? `bottom-full mb-1.5 ${align === "right" ? "right-0" : "left-0"}`
                : `top-full mt-1.5 ${align === "right" ? "right-0" : "left-0"}`
          }`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
