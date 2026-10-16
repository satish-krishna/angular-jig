// The capstone build decomposition.
//
// This file is the reason the capstone comparison is worth anything: the stage
// list, the prompt files and their order are read from HERE by both conditions,
// so gate-off and gate-on provably drive the identical build. If the two
// conditions could decompose the work differently, the drift difference between
// them would be unattributable and the whole run would be noise.
//
// Why a sequence at all, rather than the single agent call Parts 1 through 5
// used: those measured one screen. The capstone is four routed screens, a
// persistent shell, twelve primitives, ViewModels, a schema-driven form and a
// theme switcher. Each stage is its own headless `claude --model haiku` process
// with its own context and its own result JSON, which is also what makes the
// per-subagent cost ledger possible: cost is summed from real numbers, never
// estimated.
//
// Each stage is deliberately a slice a real team would hand to one person, not
// an arbitrary token-budget split. Stage 6 exists because the first five run in
// separate processes with no memory of each other, so something has to reconcile
// them; that reconciliation stage is itself part of what the capstone measures.

export const STAGES = [
  { n: 1, name: 'shell', promptFile: 'stage-1-shell.md' },
  { n: 2, name: 'domain', promptFile: 'stage-2-domain.md' },
  { n: 3, name: 'dashboard', promptFile: 'stage-3-dashboard.md' },
  { n: 4, name: 'roster', promptFile: 'stage-4-roster.md' },
  { n: 5, name: 'detail', promptFile: 'stage-5-detail.md' },
  // The only stage that differs by condition, and only by the appended suffix
  // below. See responsive-spec.md on why the responsive gate is soft.
  { n: 6, name: 'integrate', promptFile: 'stage-6-integrate.md', responsiveGate: true },
];

// The Part 5 soft responsive gate, appended to the final stage in gate-on only.
// It is held here rather than in a second set of prompt files so that the two
// conditions demonstrably read the same bytes for everything else. Playwright
// needs a whole rendered app, so a per-edit hook is physically impossible; this
// gate is only as hard as the agent's willingness to run a command it was told
// to run, and responsive-spec.md states that asymmetry rather than hiding it.
export const RESPONSIVE_SUFFIX = `

After the app builds, run these two checks and fix what they report.

\`npm run check:boot\` renders every route in a real browser and fails on any uncaught runtime error. An application can compile cleanly, pass strictTemplates, pass every lint gate, and still throw the moment the browser assembles it: a missing provider, a primitive composed in the wrong structural position, an icon module resolved in the wrong injector. The compiler cannot see any of that. If this fails, read the error, fix the cause, and run it again. Do not remove the feature to silence it; a screen that does not render is not a screen that passes.

\`npm run check:responsive\` renders the console at 375px, 768px, and 1280px and fails if the page scrolls sideways, an element escapes the viewport, or an element clips its own content. If it fails, fix the layout so the screens reflow at narrow widths and run it again.

The task is done only when \`ng build\`, \`npm run check:boot\` and \`npm run check:responsive\` all pass.
`;

// Every screen is audited, not one slice: the capstone's claim is about a whole
// console, so measuring a single route would be measuring the easy part.
export const AUDIT_ROUTES = ['dashboard', 'roster', 'detail/11'];

// Anchor on body, per responsive-spec.md. The navigation drawer that the
// hidden-element exemption exists for is a SIBLING of the routed component, not
// a descendant, so anchoring on the routed host would quietly exclude the one
// element the exemption was written for.
export const AUDIT_ANCHOR = 'body';
