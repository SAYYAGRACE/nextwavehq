import type { NewsArticle } from "./cms";

type Item =
  | { k: "h2" | "h3" | "p" | "quote" | "code"; t: string }
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

type CodeBlock = { _type: "codeBlock"; _key: string; code: string };

function toPortableText(items: Item[]): (PTBlock | CodeBlock)[] {
  const out: (PTBlock | CodeBlock)[] = [];
  items.forEach((item, bi) => {
    const bk = `b${bi}`;
    if (item.k === "code") {
      out.push({ _type: "codeBlock", _key: bk, code: item.t });
    } else if (item.k === "h2" || item.k === "h3" || item.k === "p" || item.k === "quote") {
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

export const NTRI_ARTICLE_SLUG = "introducing-the-nextwave-readiness-index";

const NTRI_CONTENT: Item[] = [
  {
    k: "p",
    t: "Today we are publishing the Nextwave School Tech Readiness Index (NTRI) — a public, evidence-based measure of how ready schools in Kaduna State are to teach and use technology. It is built so that schools, funders, government and parents can finally see the reality on the ground, school by school, and act on it.",
  },
  { k: "h2", t: "Why we built the index" },
  {
    k: "p",
    t: "Northern Nigeria's tech education crisis is well documented — but documentation is not the same as measurement. Without a shared, comparable baseline, support becomes guesswork: computers are donated to schools that cannot power them, while schools with working labs are overlooked. The NTRI replaces guesswork with a consistent, inspectable score.",
  },
  {
    k: "quote",
    t: "You cannot fix what you cannot measure. We built the index so every school, and everyone who wants to help it, is working from the same facts.",
  },
  { k: "h2", t: "Six pillars, one score" },
  {
    k: "p",
    t: "Every school is scored across six weighted pillars, each graded on written level descriptors from 0 to 4 and combined into a total out of 100:",
  },
  {
    k: "ul",
    items: [
      "**Power & Infrastructure** — grid reliability, backup power and a secure equipment room.",
      "**Devices & Labs** — devices per student, functionality and lab access.",
      "**Connectivity** — on-site internet, measured speed and who can get online.",
      "**Curriculum & Teachers** — ICT on the timetable, teacher digital skills and trained ICT staff.",
      "**Student Capability** — sampled baseline digital-literacy and aptitude tests.",
      "**Leadership & Sustainability** — a written ICT plan, maintenance budget and safeguarding policy.",
    ],
  },
  { k: "h2", t: "How the scoring works" },
  {
    k: "ol",
    items: [
      "**Two independent assessors** visit and score each school separately.",
      "Where scores differ by more than one point, assessors **reconcile with a written note** before submission.",
      "**Evidence is graded** — observed, measured, documentary or self-reported — and self-reported evidence is capped at 2 of 4 points so it can never score as highly as a verified result.",
      "The school gets a secure link to **review the result** and request corrections within 14 days.",
      "Results are published **only with the school's consent**, and a school can ask to be removed at any time.",
    ],
  },
  { k: "h2", t: "What it is not" },
  {
    k: "ul",
    items: [
      "It is **not a ranking or a league table**. Schools are never compared against one another on the public site.",
      "It is **not a judgement of individual teachers or students**. Student capability is sampled and reported only as an aggregate.",
      "It is **not for sale**, and it cannot be paid to be influenced. Published results are the school's, not ours.",
    ],
  },
  { k: "h2", t: "Privacy comes first" },
  {
    k: "p",
    t: "Student data is the most sensitive part of this work, so we treat it that way. Capability is measured through sampled tests and reported only as an aggregate for the whole school — no names, no individual results and no identifiable photos of minors are ever stored or published. Consent is recorded, LGAs with fewer than five assessed schools are not scored, and declined schools never appear.",
  },
  {
    k: "p",
    t: "You can explore the published profiles, the tier distribution and the gaps by pillar and LGA on the [Nextwave Readiness Index](/readiness) page, and read exactly how each score is produced in the [methodology](/readiness/methodology).",
  },
  { k: "h2", t: "What's next" },
  {
    k: "p",
    t: "This is the first cohort. Over the coming cycles we will extend coverage to every LGA in Kaduna State, re-assess schools annually so progress is tracked on a consistent rubric, and connect schools to the partners who can close their biggest gaps first. Any school can request a free assessment, and any funder can sponsor the pillar where it is needed most.",
  },
];

export const NTRI_ARTICLE: NewsArticle = {
  _id: `local-${NTRI_ARTICLE_SLUG}`,
  title: "Introducing the Nextwave School Tech Readiness Index (NTRI)",
  slug: NTRI_ARTICLE_SLUG,
  excerpt:
    "A public, evidence-based index of how ready schools in Kaduna State are to teach and use technology — scored on six pillars by independent assessors and published only with each school's consent.",
  category: "Readiness",
  publishedAt: "2026-10-17T00:00:00Z",
  image: null,
  pdfUrl: null,
  body: toPortableText(NTRI_CONTENT),
};

const VALUE_GAP_DIAGRAM = `+-----------------------------------------------------------------------------------+
|                           THE COMMUNITY ADOPTION MODEL                            |
+-----------------------------------------------------------------------------------+
|  [ Traditional Obstacle ]  ==>  Perception of tech as abstract, luxury, or risky  |
|                                                                                   |
|  [ Strategic Touchpoint ]  ==>  Target parent gatherings (PTA, Awards, Ceremonies)|
|                                                                                   |
|  [ Behavioral Catalyst ]   ==>  Live demonstrations by diverse, local youth       |
|                                                                                   |
|  [ Psychological Driver ]  ==>  Social proof + Aspirational Fear Of Missing Out   |
|                                                                                   |
|  [ Clear Call to Action ]  ==>  Accessible entry points for every student         |
|                                                                                   |
|  [ Desired Outcome ]       ==>  Shift to perceiving tech as an imperative skill   |
+-----------------------------------------------------------------------------------+`;

export const VALUE_GAP_SLUG = "bridging-the-value-gap";

const VALUE_GAP_CONTENT: Item[] = [
  {
    k: "ul",
    items: [
      "**Publication:** Nextwave Media Desk",
      "**Series:** Perspectives in Educational Innovation & Community Growth",
      "**Date:** October 2026",
    ],
  },
  { k: "h2", t: "Executive Summary" },
  {
    k: "p",
    t: "Across developing markets and socioeconomically conservative communities, technology training often encounters a subtle yet powerful barrier: **perception**. While mainstream commentary celebrates digital literacy as an essential life skill, many parents in low-resource environments continue to view technical education as an auxiliary luxury, an unnecessary financial expense, or even a distraction from traditional, immediate income-generating activities.",
  },
  {
    k: "p",
    t: "In a recent executive Q&A, the Head of Marketing at **Nextwave Infotech** articulated a pragmatic, community-anchored strategy to address this mindset gap: triggering positive behavioral shifts by showcasing practical, youth-led achievements directly within established socio-educational touchpoints.",
  },
  {
    k: "p",
    t: "This analysis examines the root causes of skepticism toward edtech in developing regions, evaluates the psychological drivers of parental decision-making, and outlines a structured framework for converting community skepticism into active engagement.",
  },
  { k: "h2", t: 'The Anatomy of Skepticism: Why Tech is Seen as a "Luxury"' },
  {
    k: "p",
    t: "In many under-resourced regions, parental reluctance to invest in tech education is rarely rooted in apathy. Rather, it stems from systemic socioeconomic realities and a lack of visible Return on Investment (ROI):",
  },
  {
    k: "ol",
    items: [
      "**Immediate Survival vs. Deferred Utility:** When family budgets are tightly constrained, educational investments are judged by their immediate or guaranteed economic return. Traditional vocational pathways or core academic subjects offer familiar, proven trajectories. By contrast, abstract concepts like software development or digital design can appear distant and uncertain.",
      "**Infrastructure and Access Deficits:** As edtech adoption studies across developing regions highlight, barriers such as intermittent power supply, high data costs, and device scarcity reinforce the belief that technology belongs exclusively to affluent urban centers.",
      "**The Digital Knowledge Gap Among Parents:** Parental mediation research shows that when caregivers lack digital exposure themselves, they feel anxious or disconnected from digital learning environments. Without direct visibility into how digital skills translate to upward economic mobility, technology remains classified as recreation or entertainment rather than an essential skill.",
    ],
  },
  { k: "h2", t: "Key Insight: The Nextwave Infotech Perspective" },
  { k: "p", t: "When asked during an interview:" },
  {
    k: "quote",
    t: "How do you market tech education in communities where many families still see it as a luxury or a waste of time?",
  },
  {
    k: "p",
    t: "The **Head of Marketing at Nextwave Infotech** offered the following perspective:",
  },
  {
    k: "quote",
    t: "Good question. And honestly, one worth asking, as it is something that is widespread in this community. While the recognition of tech as a field worthy of acquiring a skill and delving into is admittedly rising in other parts of the country, it is rather slow in this part.",
  },
  {
    k: "quote",
    t: "I think the answer is pretty simple. But of course, easier said than done. I personally think that the easiest, fastest and surest way to convince parents of otherwise is to show them kids, of varying ages and backgrounds, excelling in tech, because one thing is sure: no parent wants their kid to be left behind... and as such, FOMO (Fear Of Missing Out) has to be installed in them.",
  },
  {
    k: "quote",
    t: "How can this be done, you may ask? Well, one could start from school. Seize every opportunity that requires parents to come to their children's schools — PTA meetings, award and prize presentation events — and invite a group of tech-savvy children from an academy to showcase something, anything! And let's not forget the CTA! 'Join us! There's something in tech for every single one of you/your children' — boom! FOMO, the desire to have the kid catch up and, ultimately, well... progress.",
  },
  { k: "quote", t: "It may be slow, yes, but... motion is still motion." },
  { k: "quote", t: "Thank you!" },
  { k: "h2", t: "Strategic Analysis: Leveraging Social Proof & Behavioral Nudges" },
  {
    k: "p",
    t: "The core strategy outlined by Nextwave Infotech aligns closely with established behavioral economics and community marketing frameworks:",
  },
  { k: "code", t: VALUE_GAP_DIAGRAM },
  { k: "h3", t: "1. In-Person Social Proof over Abstract Advertising" },
  {
    k: "p",
    t: 'Abstract claims about "future-proofing careers" rarely convert skeptical audiences. Seeing peers — children from similar backgrounds and age groups — actively running code, creating interactive projects, or solving practical problems delivers undeniable social proof. It reframes technical mastery from an unattainable luxury into a tangible, achievable reality.',
  },
  { k: "h3", t: "2. Capitalizing on High-Intent Touchpoints (PTA & School Events)" },
  {
    k: "p",
    t: "Rather than attempting to build new marketing channels from scratch, leveraging existing institutional rhythms — such as Parent-Teacher Association (PTA) meetings and prize-giving days — places the demonstration directly within an environment where parental focus on educational progress is already heightened.",
  },
  { k: "h3", t: '3. Constructive "FOMO" as an Educational Catalyst' },
  {
    k: "p",
    t: 'In community dynamics, parental motivation is heavily tied to social mobility and collective peer standards. When parents observe other children acquiring practical technological capabilities, the psychological dynamic shifts from "Why should my child waste time on computers?" to "Is my child falling behind?" This constructive sense of missing out catalyzes action.',
  },
  { k: "h2", t: "Implementation Blueprint for Community-Based EdTech Marketing" },
  {
    k: "p",
    t: "To translate this insight into scalable field operations, edtech organizations and community outreach initiatives can implement a three-tiered tactical framework:",
  },
  { k: "h3", t: "1. Peer Showcase Modules (The Demonstration Stage)" },
  {
    k: "ul",
    items: [
      "Structure 5-to-10-minute live demonstrations during community gatherings.",
      "Highlight students building simple, functional tools — for example, local language learning apps, automated garden watering triggers, or basic websites for community businesses.",
    ],
  },
  { k: "h3", t: "2. Demystified Call to Action (The Accessibility Stage)" },
  {
    k: "ul",
    items: [
      "Remove entry friction by offering tiered, modular programs suitable for different skill levels and budgets.",
      "Provide immediate next steps at the event, such as beginner workshops and hands-on weekend trial sessions.",
    ],
  },
  { k: "h3", t: "3. Sustained Momentum & Incremental Progress" },
  {
    k: "ul",
    items: [
      "Recognize that community mindset shifts occur gradually through repeated positive reinforcement.",
      "Track localized adoption metrics and showcase long-term student success stories to validate community investment.",
    ],
  },
  { k: "h2", t: "Conclusion" },
  {
    k: "p",
    t: "Changing long-held perceptions about technology education does not require aggressive sales pitches; it requires context-aware visibility. By embedding tangible student demonstrations into trusted community spaces, Nextwave Infotech highlights a pragmatic model for bridging the digital divide — one parent, one demonstration, and one milestone at a time.",
  },
  {
    k: "p",
    t: "As noted by Nextwave's leadership, systemic change in emerging edtech markets requires patience and steady execution:",
  },
  { k: "quote", t: "It may be slow, yes, but... motion is still motion." },
  { k: "p", t: "Published by **Nextwave Media Desk** | Insight & Analysis Unit." },
];

export const VALUE_GAP_ARTICLE: NewsArticle = {
  _id: `local-${VALUE_GAP_SLUG}`,
  title:
    'Bridging the Value Gap: Reframing Tech Education from "Luxury" to Necessity in Emerging Communities',
  slug: VALUE_GAP_SLUG,
  excerpt:
    "A recent executive Q&A with Nextwave Infotech's Head of Marketing explores why many families in emerging communities still treat tech education as a luxury — and outlines a community-anchored, social-proof-driven framework for shifting that perception.",
  category: "Perspectives",
  publishedAt: "2026-10-19T00:00:00Z",
  image: null,
  pdfUrl: null,
  body: toPortableText(VALUE_GAP_CONTENT),
};

/** Local (in-repo) articles merged into the CMS article list. */
export const LOCAL_ARTICLES: NewsArticle[] = [VALUE_GAP_ARTICLE, NTRI_ARTICLE, LOCAL_ARTICLE];
