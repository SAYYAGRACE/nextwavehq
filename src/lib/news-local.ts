import type { NewsArticle } from "./cms";

type Item =
  | { k: "h2" | "h3" | "p" | "quote"; t: string }
  | { k: "ul" | "ol"; items: string[] }
  | { k: "stat"; rows: [string, string][] };

export type { Item };

type PTSpan = { _type: "span"; _key: string; text: string; marks: string[] };
type PTMarkDef = { _type: "link"; _key: string; href: string };
type PTBlock = {
  _type: "block";
  _key: string;
  style: string;
  listItem?: string;
  level?: number;
  children: PTSpan[];
  markDefs: PTMarkDef[];
};

/** Tokenize **bold** and [text](url) into Portable Text spans + link markDefs. */
function spansFromText(
  text: string,
  blockKey: string,
): { children: PTSpan[]; markDefs: PTMarkDef[] } {
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  const children: PTSpan[] = [];
  const markDefs: PTMarkDef[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      children.push({
        _type: "span",
        _key: `${blockKey}s${i++}`,
        text: text.slice(last, m.index),
        marks: [],
      });
    }
    const tok = m[0];
    if (tok.startsWith("**")) {
      children.push({
        _type: "span",
        _key: `${blockKey}s${i++}`,
        text: tok.slice(2, -2),
        marks: ["strong"],
      });
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      const defKey = `${blockKey}m${markDefs.length}`;
      markDefs.push({ _type: "link", _key: defKey, href: lm[2] });
      children.push({ _type: "span", _key: `${blockKey}s${i++}`, text: lm[1], marks: [defKey] });
    }
    last = m.index + tok.length;
  }
  if (last < text.length) {
    children.push({ _type: "span", _key: `${blockKey}s${i++}`, text: text.slice(last), marks: [] });
  }
  return { children, markDefs };
}

function ptBlock(
  blockKey: string,
  style: string,
  text: string,
  opts?: { listItem?: string; level?: number },
): PTBlock {
  const { children, markDefs } = spansFromText(text, blockKey);
  return {
    _type: "block",
    _key: blockKey,
    style,
    ...(opts?.listItem ? { listItem: opts.listItem, level: opts.level ?? 1 } : {}),
    children,
    markDefs,
  };
}

function toPortableText(items: Item[]): PTBlock[] {
  const out: PTBlock[] = [];
  items.forEach((item, bi) => {
    const bk = `b${bi}`;
    if (item.k === "h2" || item.k === "h3" || item.k === "p" || item.k === "quote") {
      const style = item.k === "quote" ? "blockquote" : item.k;
      out.push(ptBlock(bk, style, item.t));
    } else if (item.k === "ul" || item.k === "ol") {
      item.items.forEach((txt, j) => {
        out.push(ptBlock(`${bk}_${j}`, "normal", txt, { listItem: item.k }));
      });
    } else if (item.k === "stat") {
      item.rows.forEach(([label, value], j) => {
        out.push(ptBlock(`${bk}_${j}`, "normal", `**${label}:** ${value}`, { listItem: "bullet" }));
      });
    }
  });
  return out;
}

export const ARTICLE_BYLINE = "By NextWave Media Desk";

export const CONTENT: Item[] = [
  {
    k: "p",
    t: "Across the secondary and post-secondary classrooms of Northern Nigeria, a profound disconnect is quietly unfolding. While global economies pivot around artificial intelligence, cloud infrastructure, and software engineering, millions of students across the region are moving through an educational system that remains almost entirely analog.",
  },
  {
    k: "p",
    t: "In a searing assessment of the region's educational landscape, **Muhammad Khalifa**, Chairman and Chief Executive Officer of NextWave Infotech, warned that Northern Nigeria's approach to technology education is failing its youth. Rather than equipping the next generation with actionable digital skills, schools are graduating students who are completely unaware of modern software systems, severely under-skilled, and fundamentally unprepared for the 21st-century workforce.",
  },
  {
    k: "quote",
    t: "Let us skip the diplomatic language and look at the actual reality on the ground. We are facing an unprecedented crisis of digital unpreparedness. Across many schools in Northern Nigeria, what we call 'computer education' is fundamentally a theoretical exercise conducted on chalkboards. We have millions of young people who graduate secondary school without ever having turned on a laptop, typed on a keyboard, or written a single line of executable code.",
  },
  { k: "h2", t: "The Hard Numbers Behind the Divide" },
  {
    k: "p",
    t: "This digital deficit is not a matter of subjective opinion—it is an empirical reality documented across multiple national and international data points. According to the United Nations Children's Fund (UNICEF) Multiple Indicator Cluster Surveys (MICS), **only about 7% of Nigerian youth aged 15 to 24 possess foundational ICT skills**—such as manipulating a basic spreadsheet, creating digital presentations, or writing simple computer programs.",
  },
  {
    k: "stat",
    rows: [
      ["Nigerian youth (15–24) with basic ICT skills (UNICEF/MICS)", "~7%"],
      ["Share of national out-of-school children located in the North", ">60%"],
      ["North-East out-of-school rate (highest regional average)", "33%"],
      ["Northern adolescent girls owning a mobile device", "~18%"],
    ],
  },
  {
    k: "p",
    t: "When isolated regionally, the statistics reflect a structural crisis. Northern Nigeria accounts for over 60% of the country's out-of-school children, with the North-East recording an out-of-school rate of roughly 33%. Furthermore, UNICEF's MICS evaluation indicates that only 18% of adolescent girls in the region own a mobile phone, drastically limiting informal digital learning opportunities.",
  },
  {
    k: "quote",
    t: "When over 90% of your youth population lacks basic tech competency, you do not have a temporary skill gap. You have systemic digital disenfranchisement.",
  },
  { k: "h2", t: "The Anatomy of a Systemic Failure" },
  {
    k: "p",
    t: "According to the NextWave Infotech CEO, the failure of technological education across northern schools stems from three interconnected structural breakdowns:",
  },
  { k: "h3", t: '1. The Illusion of "Computer Studies"' },
  {
    k: "p",
    t: "In most public secondary institutions, technology education exists strictly on paper. Students write examinations testing their ability to memorize hardware definitions or draw computer components on paper without ever interacting with a physical machine.",
  },
  {
    k: "p",
    t: "At NextWave Infotech, when we evaluate candidates for technical roles—even those holding university degrees in Computer Science—we regularly encounter graduates who cannot perform standard technical tasks. They can write down the definition of an algorithm because that is how they were evaluated. But place them in front of a development environment, ask them to query a database, or set up a local network, and they are completely stranded.",
  },
  {
    k: "ul",
    items: [
      "**Traditional classroom model:** theoretical definitions, rote memorization of hardware, paper-and-pencil exams.",
      "**Real-world tech demand:** practical software engineering, cloud and database administration, hands-on problem solving.",
      "**The gap between the two:** a generation trained to describe technology rather than to build with it.",
    ],
  },
  { k: "h3", t: "2. Acute Infrastructure Collapse" },
  {
    k: "p",
    t: "Practical digital education requires consistent power and internet connectivity—two resources in severe short supply across the region. Over 80% of rural and suburban public schools in Northern Nigeria lack reliable access to the electrical grid. Where computer laboratories exist on paper, they frequently sit locked, filled with obsolete, dust-covered hardware that lacks the power supply needed to run.",
  },
  { k: "h3", t: "3. Educator Capability Deficit" },
  {
    k: "p",
    t: "A major barrier to reform lies within the teaching corps itself. Most educators assigned to teach computer studies in primary and secondary schools suffer from severe digital illiteracy themselves. Relying on outdated syllabi from two decades ago, teachers lack access to continuous technical training, leaving them unable to impart modern technical competencies to their students.",
  },
  { k: "h2", t: "The Socio-Economic Cost of Inaction" },
  {
    k: "p",
    t: "The long-term ramifications of this educational vacuum extend far beyond individual career prospects; they threaten the stability of the broader regional economy.",
  },
  {
    k: "p",
    t: "When regional schools fail to cultivate digital talent, local tech ventures and corporate entities are forced to source software engineers, data analysts, and network specialists from outside the region or abroad. This dynamic drives capital flight away from the North and deepens local economic stagnation.",
  },
  {
    k: "p",
    t: "Moreover, in a region with a rapidly growing youth demographic, failing to provide market-relevant technical education creates widespread unemployability. As Khalifa noted, a vast population of idled youth lacking 21st-century economic opportunities creates fertile ground for social disenfranchisement and civil instability. Resolving the tech education crisis is, therefore, a core national security imperative.",
  },
  { k: "h2", t: "NextWave Infotech's Framework for Reform" },
  {
    k: "p",
    t: "Addressing a structural crisis of this magnitude requires moving beyond cosmetic fixes, such as sporadic desktop computer donations. Khalifa and the leadership team at NextWave Infotech advocate for a targeted three-point structural overhaul of technology instruction across the North:",
  },
  {
    k: "ol",
    items: [
      "**Mandate practical evaluation:** Examination standards must be overhauled. Students should no longer pass computer studies by writing theoretical essays; at least 70% of assessment grades must be based on practical performance on live software systems.",
      "**Institutionalize teacher upskilling:** Establish mandatory, continuous digital certification bootcamps for primary and secondary educators before they enter the classroom.",
      "**Build public-private pipelines:** State education boards must form direct alliances with tech firms like NextWave Infotech to design up-to-date curricula, establish technical apprenticeships, and mentor students long before graduation.",
    ],
  },
  { k: "h2", t: "Looking Ahead" },
  {
    k: "p",
    t: "Northern Nigeria possesses an enormous reservoir of young, ambitious potential. However, as Muhammad Khalifa points out, raw talent without honest, practical education cannot drive economic development.",
  },
  {
    k: "p",
    t: "If Northern Nigeria is to participate meaningfully in the global tech ecosystem, policymakers, educators, and industry leaders must confront the present reality with candor and take immediate, structural action to rebuild tech education from the ground up.",
  },
  {
    k: "p",
    t: "To gain further context on the national digital literacy gap referenced by Muhammad Khalifa, watch this report detailing official UNICEF MICS findings: [UNICEF Report Reveals Only 7% of Nigerian Youth Have ICT Skills](https://www.youtube.com/watch?v=8qrURwoP9_c).",
  },
];

export const LOCAL_ARTICLE_SLUG = "modernizing-theoretical-illiteracy";

export const LOCAL_ARTICLE: NewsArticle = {
  _id: "local-modernizing-theoretical-illiteracy",
  title:
    '"We Are Modernizing Theoretical Illiteracy": How Northern Nigeria\u2019s Technological Education Deficit Threatens Its Future',
  slug: LOCAL_ARTICLE_SLUG,
  excerpt:
    "NextWave Infotech CEO Muhammad Khalifa warns that Northern Nigeria's theoretical approach to computer education is graduating youth with no practical digital skills — and sets out a three-point plan to fix it.",
  category: "Education",
  publishedAt: "2026-10-16T00:00:00Z",
  image: null,
  pdfUrl: "/downloads/modernizing-theoretical-illiteracy.pdf",
  body: toPortableText(CONTENT),
};
