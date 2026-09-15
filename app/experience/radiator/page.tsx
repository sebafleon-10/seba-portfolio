import { ExperiencePage } from '../_components/experience-page';

// PLACEHOLDER PAGE. Every string below prefixed PLACEHOLDER is waiting on the
// real copy from the 1-800 Radiator role interview. Replace them all, then
// check the logo asset in public/ is a real PNG or SVG (white on transparent).

const HERO_TITLE = 'PLACEHOLDER: four to six word title';
const HERO_INTRO = 'PLACEHOLDER: 60 to 80 word first-person intro naming the role and the four themes below, ending on the outcome for the business.';
const SECTION_HEADING = 'What I did';

const ITEMS = [
  {
    title: 'PLACEHOLDER: Deliverable one',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
  },
  {
    title: 'PLACEHOLDER: Deliverable two',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
  },
  {
    title: 'PLACEHOLDER: Deliverable three',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
  },
  {
    title: 'PLACEHOLDER: Deliverable four',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
  },
];

export default function RadiatorPage() {
  return (
    <ExperiencePage
      eyebrow="PLACEHOLDER: Mon 2026 to Mon 2026 · 1-800 Radiator"
      title={HERO_TITLE}
      intro={HERO_INTRO}
      logo={{ src: '/radiator-logo.png', alt: '1-800 Radiator logo' }}
      sectionHeading={SECTION_HEADING}
      items={ITEMS}
    />
  );
}
