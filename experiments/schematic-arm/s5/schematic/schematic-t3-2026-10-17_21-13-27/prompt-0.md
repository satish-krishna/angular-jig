Write the slice spec for the Hero Ops Console's hero screens now, by creating one file in this repository. Do not build anything.

Read `prototype/capstone-build-spec.md` first. Its roster-table and hero-detail sections describe the two screens this spec feeds: the hero list and the hero edit form.

Read the spec schema at `schematics/slice/spec.schema.json`. It is the authority on the spec's shape, and a key it does not declare fails it.

Write exactly one file, `specs/hero.json`, describing the hero entity, its fields, and its list and form screens. Do not run any generator, do not write or edit any other file, and do not start a build or a dev server. A person reviews the spec before anything is generated from it.

The spec's `kinds` must list `entity`, `form` and `manage`: later stages generate each of them from this file.

The entity is `Hero` and its plural is `heroes`: later stages name the generated files and the roster screen after them.
