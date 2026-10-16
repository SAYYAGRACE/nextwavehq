export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-px w-8 rounded-full"
        style={{ background: "linear-gradient(90deg, var(--brand-blue), var(--brand-purple))" }}
        aria-hidden
      />
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        {children}
      </span>
    </div>
  );
}
