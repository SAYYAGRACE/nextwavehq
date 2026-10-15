type AuroraProps = {
  className?: string;
};

/**
 * A single, calm ambient wash. Kept deliberately restrained — one soft gradient
 * instead of stacked blur orbs — so it reads as depth, not decoration.
 */
export function Aurora({ className = "" }: AuroraProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute left-1/2 top-0 h-[80vh] w-[130vw] -translate-x-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-purple)_16%,transparent),transparent)]" />
    </div>
  );
}
