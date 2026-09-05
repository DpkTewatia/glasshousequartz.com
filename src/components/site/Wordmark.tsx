/**
 * Typographic wordmark.
 *
 * The existing logo is a white dragon on transparency, which disappears on a
 * white ground. A set wordmark reads at every size, needs no image request,
 * and stays crisp on any display — the dragon can return as a favicon or on
 * dark surfaces without changing this component.
 */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="text-[1.0625rem] font-medium uppercase tracking-[0.22em] text-ink">
        Glasshouse
      </span>
      <span className="mt-[3px] text-[0.5625rem] uppercase tracking-[0.44em] text-ink-400">
        Quartz
      </span>
    </span>
  );
}
