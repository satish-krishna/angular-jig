// The primitives in libs/ui whose component takes the consumer's `class` and
// applies it to an element INSIDE its own template instead of its host. One
// list, in one place, read by seal/no-class-on-forwarding-primitive and pinned
// to libs/ui by harness/gate/forwarding-primitives.test.mjs, which fails when a
// component forwards `class` inward and is missing here (or is listed here and
// no longer forwards). A new primitive cannot silently escape the rule.
//
// Only components can forward: a directive has no template. Each entry names
// the inputs a consumer should reach for instead of a class.
export const FORWARDING_PRIMITIVES: Readonly<Record<string, { readonly use: string }>> = {
  // `class` lands on the inner <button brnSelectTrigger>.
  'hlm-select-trigger': { use: 'its `width` ("fit" | "full"), `size` ("default" | "sm") and `buttonId` inputs' },
  // `class` lands on the inner <brn-switch>.
  'hlm-switch': { use: 'its `size` input' },
};
