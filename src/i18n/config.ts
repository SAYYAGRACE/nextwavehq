export type Locale = "en" | "ha";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ha", label: "Hausa" },
];

export function resolveLocale(preferred?: string | null): Locale {
  if (!preferred) return DEFAULT_LOCALE;
  if (preferred.toLowerCase().startsWith("ha")) return "ha";
  return DEFAULT_LOCALE;
}
