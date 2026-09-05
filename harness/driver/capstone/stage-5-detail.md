Implement the following now, by editing files in this repository. Do the work directly: create and edit the files, run the generators or commands you need, and make the application build. Do not reply with only a plan, a design, or a description of what you would do. The task is done when the code is written and the app builds.

You are building one stage of the Hero Ops Console, a kitchen-sink Tour of Heroes. The conformance target is `prototype/capstone-build-spec.md`: read it first. It carries the low-fidelity layout, the theme palette, the icon scheme, the component map, and the build guidelines. Build to its intent and decisions, not to pixels. `prototype/tour-of-heroes.html` is a colour-and-mood reference ONLY; it is known non-responsive and its CSS and layout mechanics must not be copied.

Earlier stages of this build may already have run. Read the current state of `src/` before you write, and extend what is there rather than replacing it.

Before you finish, build the app with `ng build` and confirm it compiles. Do not start a dev server (`ng serve` or `npm start`); a one-off build is all that is needed, and a dev server would hang.

## This stage: the hero detail screen

Build the hero detail screen per the build spec's hero-detail diagram: the back link, the detail header with its actions, and the four tabbed panels (Overview, Powers, Missions, Edit).

Read the hero id from the `detail/:id` route parameter and load that hero from the existing domain service.

The Edit tab is the hero edit form, built from the zod schema an earlier stage created. Retiring a hero goes through a confirmation dialog.

Use the primitives the build spec's component map names for each region. Icons come from the build spec's icon scheme.
