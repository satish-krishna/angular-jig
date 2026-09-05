Implement the following now, by editing files in this repository. Do the work directly: create and edit the files, run the generators or commands you need, and make the application build. Do not reply with only a plan, a design, or a description of what you would do. The task is done when the code is written and the app builds.

You are building one stage of the Hero Ops Console, a kitchen-sink Tour of Heroes. The conformance target is `prototype/capstone-build-spec.md`: read it first. It carries the low-fidelity layout, the theme palette, the icon scheme, the component map, and the build guidelines. Build to its intent and decisions, not to pixels. `prototype/tour-of-heroes.html` is a colour-and-mood reference ONLY; it is known non-responsive and its CSS and layout mechanics must not be copied.

Earlier stages of this build may already have run. Read the current state of `src/` before you write, and extend what is there rather than replacing it.

Before you finish, build the app with `ng build` and confirm it compiles. Do not start a dev server (`ng serve` or `npm start`); a one-off build is all that is needed, and a dev server would hang.

## This stage: the theme and the application shell

Apply the build spec's theme palette to the spartan CSS token blocks in `src/styles.css` (the `:root` and `:root.dark` blocks), mapping each role in the palette table onto spartan's own token. Keep the full `--sidebar*` token set.

Build the application shell in `src/app/app.ts` / `app.html`: the navigation rail, the top bar, and the routed content region, per the build spec's app-shell diagram.

- The navigation rail is `hlm-sidebar` and its parts. Install nothing; the primitives are already in `libs/ui`. Let the sidebar own its mobile off-canvas behaviour, and make sure the CLOSED drawer is genuinely hidden rather than parked off-screen.
- The top bar carries the breadcrumb, a search control, a notifications button, the theme toggle, and an account avatar.
- Build the theme switcher: toggle a `.dark` class on `<html>`, persist the choice, and respect `prefers-color-scheme` when the user has made no choice.
- Wire the six navigation destinations from the build spec into `src/app/app.routes.ts` as lazy routes: dashboard, roster, hero detail (`detail/:id`), recruit, threats, settings. Screens that later stages build can be minimal placeholders for now.
