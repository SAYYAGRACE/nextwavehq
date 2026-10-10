import { TIERS_BY_KEY, type TierKey } from "@/lib/readiness/rubric";
import type { PillarAverage, TierDatum } from "@/lib/readiness/types";

export function TierBadge({ tier, size = "sm" }: { tier: TierKey | null; size?: "sm" | "lg" }) {
  if (!tier) return null;
  const t = TIERS_BY_KEY[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-[11px]"
      }`}
      style={{ backgroundColor: t.color, color: t.onColor }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: t.onColor, opacity: 0.6 }}
      />
      {t.label}
    </span>
  );
}

function tierTableAlternative(data: TierDatum[]) {
  return (
    <table className="sr-only">
      <caption>Tier distribution of assessed schools</caption>
      <thead>
        <tr>
          <th scope="col">Tier</th>
          <th scope="col">Schools</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.tier}>
            <th scope="row">{d.label}</th>
            <td>{d.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TierBarChart({ data }: { data: TierDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <figure className="w-full">
      <div
        className="flex items-end justify-between gap-3 h-44"
        role="img"
        aria-label={`Tier distribution: ${data.map((d) => `${d.label} ${d.count}`).join(", ")}`}
      >
        {data.map((d) => (
          <div key={d.tier} className="flex flex-1 flex-col items-center justify-end gap-2 h-full">
            <span className="text-sm font-semibold text-white">{d.count}</span>
            <div
              className="w-full rounded-t-md transition-[height] duration-700 ease-out"
              style={{
                height: `${Math.max(4, (d.count / max) * 80)}%`,
                backgroundColor: d.color,
                opacity: d.count === 0 ? 0.35 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3">
        {data.map((d) => (
          <div key={d.tier} className="flex-1 text-center">
            <span className="text-[11px] leading-tight text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
      {tierTableAlternative(data)}
    </figure>
  );
}

export function PillarBars({ data }: { data: PillarAverage[] }) {
  return (
    <figure className="space-y-4">
      {data.map((p) => (
        <div key={p.pillar}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-white">{p.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {p.percent}%{" "}
              <span className="text-xs">
                ({p.averagePoints}/{p.averageAvailable} pts)
              </span>
            </span>
          </div>
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
            role="img"
            aria-label={`${p.label}: ${p.percent} percent of available points`}
          >
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${p.percent}%`, background: "var(--gradient-brand)" }}
            />
          </div>
        </div>
      ))}
      <table className="sr-only">
        <caption>Average score by pillar</caption>
        <tbody>
          {data.map((p) => (
            <tr key={p.pillar}>
              <th scope="row">{p.label}</th>
              <td>{p.percent} percent</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function RadarChart({ data }: { data: PillarAverage[] }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 82;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, pct: number) => {
    const r = (radius * Math.max(0, Math.min(100, pct))) / 100;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };
  const rings = [25, 50, 75, 100];
  const polygon = data.map((d, i) => point(i, d.percent).join(",")).join(" ");
  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-64 w-64 max-w-full"
        role="img"
        aria-label={`Pillar profile: ${data.map((d) => `${d.label} ${d.percent} percent`).join(", ")}`}
      >
        {rings.map((r) => (
          <polygon
            key={r}
            points={data.map((_, i) => point(i, r).join(",")).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
          />
        ))}
        {data.map((_, i) => {
          const [x, y] = point(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}
        <polygon points={polygon} fill="url(#radarFill)" stroke="#a78bfa" strokeWidth={2} />
        <defs>
          <radialGradient id="radarFill">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        {data.map((d, i) => {
          const [x, y] = point(i, 100);
          const lx = cx + (radius + 20) * Math.cos(angle(i));
          const ly = cy + (radius + 20) * Math.sin(angle(i));
          return (
            <text
              key={d.pillar}
              x={lx}
              y={ly}
              textAnchor={lx > cx + 4 ? "start" : lx < cx - 4 ? "end" : "middle"}
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 9 }}
            >
              {shortLabel(d.label)}
            </text>
          );
          void x;
          void y;
        })}
      </svg>
      <table className="sr-only">
        <caption>Score by pillar</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.pillar}>
              <th scope="row">{d.label}</th>
              <td>{d.percent} percent</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function shortLabel(label: string): string {
  const map: Record<string, string> = {
    "Power & Infrastructure": "Power",
    "Devices & Labs": "Devices",
    Connectivity: "Internet",
    "Curriculum & Teachers": "Teaching",
    "Student Capability": "Students",
    "Leadership & Sustainability": "Leadership",
  };
  return map[label] ?? label;
}
