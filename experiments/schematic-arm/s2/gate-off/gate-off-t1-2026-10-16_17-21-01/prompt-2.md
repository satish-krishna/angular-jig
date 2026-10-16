Implement the following now, by editing files in this repository. Do the work directly: create and edit the files, run the generators or commands you need, and make the application build. Do not reply with only a plan, a design, or a description of what you would do. The task is done when the code is written and the app builds.

You are building one stage of the Hero Ops Console, a kitchen-sink Tour of Heroes. The conformance target is `prototype/capstone-build-spec.md`: read it first. It carries the low-fidelity layout, the theme palette, the icon scheme, the component map, and the build guidelines. Build to its intent and decisions, not to pixels. `prototype/tour-of-heroes.html` is a colour-and-mood reference ONLY; it is known non-responsive and its CSS and layout mechanics must not be copied.

Earlier stages of this build may already have run. Read the current state of `src/` before you write, and extend what is there rather than replacing it.

Before you finish, build the app with `ng build` and confirm it compiles. Do not start a dev server (`ng serve` or `npm start`); a one-off build is all that is needed, and a dev server would hang.

## This stage: the hero domain and its data

Build the domain the rest of the console reads from, under `src/app/domain/`.

- A `Hero` model carrying the fields the build spec's roster and detail screens need: id, name, alias, power class, power index (0-100), status, clearance tier, mission count, success rate.
- A `HeroService` holding the example roster from the build spec's content section as in-memory signal state, with lookup by id and an update path. There is no backend. Mark it plainly as example data.
- A zod schema for the hero edit form, beside the form as `<feature>.schema.ts`, exporting the schema and `export type HeroModel = z.infer<typeof schema>`. Field labels ride on the schema via `.meta()`.

Do not build any screen in this stage.
