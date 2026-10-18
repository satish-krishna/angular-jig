// The primitives in libs/ui whose component takes a consumer-supplied class and
// applies it to an element INSIDE its own template instead of its host. One
// list, in one place, read by seal/no-class-on-forwarding-primitive and pinned
// to libs/ui by harness/gate/forwarding-primitives.test.mjs, which fails when a
// component forwards a class input inward and is missing here (or is listed
// here and no longer does). A new primitive cannot silently escape the rule.
//
// The key is the element selector. `inputs` are the template-facing names (the
// alias when there is one) of every input that forwards a class inward: `class`
// where a component aliases its class input, a named input such as
// `sidebarContainerClass` where it does not. `use` says what to reach for
// instead. Only components can forward: a directive has no template.
export interface ForwardingPrimitive {
  readonly inputs: readonly string[];
  readonly use: string;
}

export const FORWARDING_PRIMITIVES: Readonly<Record<string, ForwardingPrimitive>> = {
  // `class` feeds the inner <button brnSelectTrigger>.
  'hlm-select-trigger': {
    inputs: ['class'],
    use: 'its `width` ("fit" | "full"), `size` ("default" | "sm") and `buttonId` inputs',
  },
  // `class` feeds the inner <brn-switch>.
  'hlm-switch': { inputs: ['class'], use: 'its `size` input' },
  // `sidebarContainerClass` feeds the inner data-slot="sidebar-container" div.
  'hlm-sidebar': {
    inputs: ['sidebarContainerClass'],
    use: 'its `side`, `variant` and `collapsible` inputs',
  },
  // `tabListClass` feeds the inner tab list; `paginationButtonClass` both paginator buttons.
  'hlm-paginated-tabs-list': {
    inputs: ['tabListClass', 'paginationButtonClass'],
    use: 'the primitive as it is (no input takes a class from outside)',
  },
};
