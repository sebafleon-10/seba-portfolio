import { ExperiencePage } from '../_components/experience-page';

// Moved from /work/ghost-fc on Sep 13 2026 (next.config.ts redirects the
// old URL). Copy is unchanged from the Sep 12 rewrite.

const HERO_TITLE = 'The data behind the club';
const HERO_INTRO = "Data analyst for Chicago Ghost FC, the semi-pro side I also play for. I built the club's front-office analytics from the ground up: sponsorship prospecting, social media pipelines, match-day KPI dashboards, and conference benchmarking that turned raw data into decisions the club could act on.";
const SECTION_HEADING = 'What I built';

const ITEMS = [
  {
    title: 'Sponsorship-intelligence command center',
    body: 'A tool the front office runs to discover local businesses, enrich each one through an agentic web-search loop, score it against a 100-point sponsorship-fit rubric across six dimensions, and auto-draft personalized outreach emails. It surfaced 329 qualified prospects across multiple business categories.',
  },
  {
    title: 'Ranking evaluation and match-day KPIs',
    body: 'An evaluation harness with a hand-labeled gold set, rank correlation, and top-15 precision to validate and tune ranking quality, plus match-day KPI dashboards guiding marketing, sponsorship, and revenue decisions.',
  },
  {
    title: 'Social analytics pipelines',
    body: "Python pipelines collecting post-level engagement across the club's TikTok and Instagram accounts, more than 700 posts, replacing manual tracking with repeatable reporting.",
  },
  {
    title: 'Conference benchmarking',
    body: 'Content performance benchmarked against MWPL conference rivals to identify which content types and posting patterns drive reach and follower growth, translated into recommendations for non-technical stakeholders.',
  },
];

export default function GhostFCPage() {
  return (
    <ExperiencePage
      eyebrow="Jan 2026 to Aug 2026 · Chicago Ghost FC"
      title={HERO_TITLE}
      intro={HERO_INTRO}
      logo={{ src: '/ghost-fc-logo.png', alt: 'Chicago Ghost FC crest' }}
      sectionHeading={SECTION_HEADING}
      items={ITEMS}
    />
  );
}
