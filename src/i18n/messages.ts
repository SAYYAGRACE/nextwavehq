import type { Locale } from "./config";

type Dict = {
  nav: { about: string; projects: string; team: string; contact: string };
  footer: { tagline: string; location: string };
};

const en: Dict = {
  nav: { about: "About", projects: "Projects", team: "Team", contact: "Contact" },
  footer: {
    tagline:
      "A youth-led deep-tech movement bridging Africa's technological gap in AI, biotechnology, and digital health — originating from Northern Nigeria.",
    location: "Kaduna · Nigeria",
  },
};

const ha: Dict = {
  nav: { about: "", projects: "", team: "", contact: "" },
  footer: { tagline: "", location: "Kaduna · Nijeriya" },
};

export const DICTS: Record<Locale, Dict> = { en, ha };
