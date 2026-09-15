import { ExperiencePage } from '../_components/experience-page';

// Copy from the Sep 15 2026 role interview. Home row tag: Excel · Python · Claude.
// Location: Chicago, IL (Hybrid).

const HERO_TITLE = 'Strategy leaders can practice';
const HERO_INTRO = 'Business analyst on the Strategy and Business Modeling team at BTS, the consultancy for the people side of strategy. I sit in discovery interviews with client stakeholders and co-create the design of each experience, build the business models and simulations behind it, facilitate and present them to client teams, and shape how AI shows up inside the room, from custom chatbots to workflow-mapping sessions, so leaders can see how their decisions move their business before they make them.';
const SECTION_HEADING = 'What I do';

const ITEMS = [
  {
    title: 'Discovery and experience design',
    body: 'Discovery interviews with client stakeholders to understand the strategy, the tradeoffs, and the decisions that actually move their business. That input becomes the design of the simulation experience, co-created with the client so the case, the dilemmas, and the results reflect what matters in their world rather than a generic exercise.',
    tags: ['Claude', 'Excel'],
  },
  {
    title: 'Simulation model builds',
    body: "The financial and business model underneath each simulation, built in Excel and VBA with Python where it helps, along with the participant-facing experience on BTS's Pulse platform. The job is to simplify a complex business into a realistic model with tradeoffs that matter, so a team's decisions ripple through revenue, margin, and cash as they would in the real company.",
    tags: ['Excel', 'VBA', 'Python', 'Pulse'],
  },
  {
    title: 'Facilitation and delivery',
    body: 'Delivering and presenting the finished experience to client teams, from front-line managers up to the C-suite, and facilitating the sessions where they run the business. Afterwards, analyzing the simulation data and bringing real-world insight back to the client, so the workshop ends with a clear picture of how the team thinks and where the strategy needs alignment.',
    tags: ['Pulse', 'Excel'],
  },
  {
    title: 'AI inside the experience',
    body: 'Building the AI layer of each experience, from bespoke chatbots and custom agents inside the simulation to live working sessions where client teams map their own workflows and build agents around them. Part of the work is training clients on the tools BTS leaves behind, so the tools keep paying off after the engagement ends.',
    tags: ['Claude', 'Python'],
  },
];

export default function BTSPage() {
  return (
    <ExperiencePage
      eyebrow="Sep 2026 to Present · BTS"
      title={HERO_TITLE}
      intro={HERO_INTRO}
      logo={{ src: '/bts-logo-white.svg', alt: 'BTS logo', maxWidth: 320 }}
      heroImage={{ src: '/bts-hero.jpg', alt: 'Leadership team in a dim workshop room facing a lit simulation dashboard', objectPosition: '42% center' }}
      sectionHeading={SECTION_HEADING}
      items={ITEMS}
    />
  );
}
