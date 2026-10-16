Implement the following now, by editing files in this repository. Do the work directly: create and edit the files, run the generators or commands you need, and make the application build. Do not reply with only a plan, a design, or a description of what you would do. The task is done when the code is written and the app builds.

You are building one stage of the Hero Ops Console, a kitchen-sink Tour of Heroes. The conformance target is `prototype/capstone-build-spec.md`: read it first. It carries the low-fidelity layout, the theme palette, the icon scheme, the component map, and the build guidelines. Build to its intent and decisions, not to pixels. `prototype/tour-of-heroes.html` is a colour-and-mood reference ONLY; it is known non-responsive and its CSS and layout mechanics must not be copied.

Earlier stages of this build may already have run. Read the current state of `src/` before you write, and extend what is there rather than replacing it.

Before you finish, build the app with `ng build` and confirm it compiles. Do not start a dev server (`ng serve` or `npm start`); a one-off build is all that is needed, and a dev server would hang.

## This stage: integrate and finish

Earlier stages built the shell, the domain, and the three screens separately. Bring them together into one working application.

- Make every navigation destination reachable and every route render its real screen, with no placeholders left.
- Make the screens actually read and write the shared domain state, so an edit on the detail screen is reflected on the dashboard and the roster.
- Fix anything the separate stages left inconsistent: duplicated models, a screen wired to its own copy of the data, a missing import, a dead link.
- Confirm the whole application builds.


After the app builds, run these two checks and fix what they report.

`npm run check:boot` renders every route in a real browser and fails on any uncaught runtime error. An application can compile cleanly, pass strictTemplates, pass every lint gate, and still throw the moment the browser assembles it: a missing provider, a primitive composed in the wrong structural position, an icon module resolved in the wrong injector. The compiler cannot see any of that. If this fails, read the error, fix the cause, and run it again. Do not remove the feature to silence it; a screen that does not render is not a screen that passes.

`npm run check:responsive` renders the console at 375px, 768px, and 1280px and fails if the page scrolls sideways, an element escapes the viewport, or an element clips its own content. If it fails, fix the layout so the screens reflow at narrow widths and run it again.

The task is done only when `ng build`, `npm run check:boot` and `npm run check:responsive` all pass.
