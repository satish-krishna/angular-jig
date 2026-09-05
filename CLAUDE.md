You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## House frontend conventions

## Before you write spartan markup, ask the docs

The `spartan-ui` MCP server is configured and running. Use it. Reading a Helm file under `libs/ui/` tells you a component's SELECTOR and nothing about how it must be composed, and composition is where these primitives actually break.

- Before writing any `hlm-*` markup you have not written before, call the spartan MCP (`spartan_components_get`, `spartan_docs_get`) or read the matching `rules/*.md` in the `spartan` skill.
- Grepping `libs/ui/` is not a substitute. It gives you selectors, not required structure, and the difference is not cosmetic: `hlm-dialog-content` must sit on an `*hlmDialogPortal` template, because spartan supplies `BrnDialogRef` through that portal. Render it inline and it compiles, renders, and throws `NG0201` the moment the dialog opens.
- The same applies to icons. `NgIconsModule` is the legacy API and throws at bootstrap; the standalone `NgIcon` plus `provideIcons` is the current one.

This is not a style preference. Every fatal runtime defect this repo has measured came from composing a primitive from its source rather than its documentation.

- Follow the `house-style` skill (`.claude/skills/house-style`) for layout and stylesheets, on top of the SpartanNG (`spartan` skill) docs. In short: grid for regions, flex for inline runs, never nest flex to fake a grid; and in any hand-written component stylesheet, colors and lengths are design tokens (`var(--...)`), never raw hex or `px`.

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
