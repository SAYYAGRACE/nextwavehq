"use client";

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, MapPin, CalendarDays, Building2, GraduationCap } from "lucide-react";
import { TierBadge } from "./charts";
import { TIERS } from "@/lib/readiness/rubric";
import type { SchoolWithAssessment } from "@/lib/readiness/types";

type Props = {
  records: SchoolWithAssessment[];
  options: { lgas: string[]; types: string[]; levels: string[]; years: number[] };
};

const selectClass =
  "rounded-lg border border-hairline bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-purple/60";

export function SchoolDirectory({ records, options }: Props) {
  const [search, setSearch] = useState("");
  const [lga, setLga] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [tier, setTier] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = records.filter((r) => {
      if (lga && r.school.lga !== lga) return false;
      if (type && r.school.type !== type) return false;
      if (level && r.school.level !== level) return false;
      if (tier && r.assessment.tier !== tier) return false;
      if (year && String(new Date(r.assessment.assessmentDate).getFullYear()) !== year)
        return false;
      if (q && !`${r.school.name} ${r.school.lga} ${r.school.ward ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "lga")
        return (
          a.school.lga.localeCompare(b.school.lga) || a.school.name.localeCompare(b.school.name)
        );
      if (sort === "recent")
        return b.assessment.assessmentDate.localeCompare(a.assessment.assessmentDate);
      return a.school.name.localeCompare(b.school.name);
    });
    return list;
  }, [records, search, lga, type, level, tier, year, sort]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search schools</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school, LGA or ward"
            className={`${selectClass} w-full pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">Filter by LGA</span>
          <select
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">All LGAs</option>
            {options.lgas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by school type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">All types</option>
            {options.types.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by level</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">All levels</option>
            {options.levels.map((l) => (
              <option key={l} value={l}>
                {l[0].toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">All tiers</option>
            {TIERS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by year</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">All years</option>
            {options.years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort schools</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="name">Sort: Name</option>
            <option value="lga">Sort: LGA</option>
            <option value="recent">Sort: Most recently assessed</option>
          </select>
        </label>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "school" : "schools"} shown
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-hairline bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {lga ? `No schools published yet for ${lga}.` : "No schools match these filters."}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link
              key={r.school.id}
              to="/readiness/$slug"
              params={{ slug: r.school.slug }}
              className="group rounded-2xl border border-hairline bg-white/[0.02] p-5 transition-all hover:border-brand-purple/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-snug text-white group-hover:text-brand-glow">
                  {r.school.name}
                </h3>
                <TierBadge tier={r.assessment.tier} />
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {r.school.lga}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {cap(r.school.type)} · {cap(r.school.level)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(r.assessment.assessmentDate)}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-white">{r.assessment.totalScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <GraduationCap className="h-5 w-5 text-brand-glow/60" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
