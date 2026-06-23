export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-glow shadow-[0_0_8px_var(--brand-glow)]" />
      <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
        {children}
      </span>
    </div>
  );
}
