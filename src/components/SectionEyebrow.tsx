export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-6 bg-brand-purple/60" aria-hidden />
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        {children}
      </span>
    </div>
  );
}
