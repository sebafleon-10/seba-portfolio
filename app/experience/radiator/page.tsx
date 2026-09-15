import { ExperiencePage } from '../_components/experience-page';

// Copy from the Sep 15 2026 role interview. Home row tag: Python · Excel · Qlik.
// Location: Chicago, IL (Remote).

const HERO_TITLE = 'What a delivery really costs';
const HERO_INTRO = "Data and analytics consultant for a four-location 1-800 Radiator & A/C franchise group in Texas and Louisiana, working directly with the owner. I built the group's first delivery cost-to-serve model, reconciled every carrier cost stream against primary billing, rebuilt cost-per-stop economics to explain why one warehouse ran far more expensive than another, and turned the analysis into a monthly pipeline the owner now runs himself, giving the business a close on delivery costs it never had before.";
const SECTION_HEADING = 'What I built';

const ITEMS = [
  {
    title: 'Delivery cost-to-serve model',
    body: 'A cost-per-order delivery P&L in Excel, fed by Python from POS data, Qlik exports, and UPS and DoorDash billing files, covering more than 6,000 delivery orders a month across four warehouses. It gave the owner warehouse-, carrier-, and order-level cost to serve for the first time, built to answer his question of whether own-truck delivery was overpriced.',
    tags: ['Python', 'Excel', 'Qlik'],
  },
  {
    title: 'Carrier billing reconciliation',
    body: 'Every cost stream checked against primary sources. I reconciled DoorDash billing to the franchise statements to the cent, caught duplicate rows inflating reported gig-delivery spend, and found billing corrections, largely dimensional surcharges on radiators, running at 23% of UPS spend. I also forecast the monthly DoorDash true-up before the statement arrived, and the statement confirmed it.',
    tags: ['Python', 'Excel'],
  },
  {
    title: 'Cost-per-stop density analysis',
    body: 'A four-year weekly stop panel across five delivery channels, rebuilt to explain a 1.7x per-stop cost gap between two warehouses. The gap came down to route density, not spend, which reframed a sustained budget overrun as volume growth at improving unit cost and gave the owner staffing and density counterfactuals to weigh driver headcount against service level.',
    tags: ['Python', 'Excel'],
  },
  {
    title: 'Repeatable monthly pipeline',
    body: 'The analysis productionized into a monthly pipeline with an exceptions engine and a replay harness that rebuilds any month byte-identical from source files, July replayed in 42 seconds. The franchise had no monthly close on delivery before. One walkthrough session was enough for the owner to run the close independently each month.',
    tags: ['Python', 'Excel', 'Claude Code'],
  },
];

export default function RadiatorPage() {
  return (
    <ExperiencePage
      eyebrow="Jun 2026 to Aug 2026 · 1‑800 Radiator & A/C"
      title={HERO_TITLE}
      intro={HERO_INTRO}
      logo={{
        src: '/radiator-logo.png',
        alt: '1-800 Radiator & A/C logo',
        maxWidth: 250,
        // The badge carries small type, so the hero mark runs taller than the
        // 28px default; 40px is 139px wide, still under the 250px source.
        style: { filter: 'grayscale(1) brightness(1.35) contrast(1.1)', height: 40 },
      }}
      heroImage={{ src: '/radiator-hero.jpg', alt: 'Delivery van at a parts warehouse loading dock at night', objectPosition: '58% center' }}
      sectionHeading={SECTION_HEADING}
      items={ITEMS}
    />
  );
}
