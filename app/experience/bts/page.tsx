import { ExperiencePage } from '../_components/experience-page';

// PLACEHOLDER PAGE. Every string below prefixed PLACEHOLDER is waiting on the
// real copy from the BTS Consulting role interview. Replace them all, then
// check the logo asset in public/ is a real PNG or SVG (white on transparent).

const HERO_TITLE = 'PLACEHOLDER: four to six word title';
const HERO_INTRO = 'PLACEHOLDER: 60 to 80 word first-person intro naming the role and the four themes below, ending on the outcome for the business.';
const SECTION_HEADING = 'What I do';

const ITEMS = [
  {
    title: 'PLACEHOLDER: Deliverable one',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
    tags: ['PLACEHOLDER'],
  },
  {
    title: 'PLACEHOLDER: Deliverable two',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
    tags: ['PLACEHOLDER'],
  },
  {
    title: 'PLACEHOLDER: Deliverable three',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
    tags: ['PLACEHOLDER'],
  },
  {
    title: 'PLACEHOLDER: Deliverable four',
    body: 'PLACEHOLDER: 40 to 60 words on one concrete deliverable, with a number, who used it, and what changed.',
    tags: ['PLACEHOLDER'],
  },
];

export default function BTSPage() {
  return (
    <ExperiencePage
      eyebrow="PLACEHOLDER: Mon 2026 to Present · BTS Consulting"
      title={HERO_TITLE}
      intro={HERO_INTRO}
      logo={{ src: '/bts-logo.png', alt: 'BTS Consulting logo' }}
      sectionHeading={SECTION_HEADING}
      items={ITEMS}
    />
  );
}
