import { getTemplateParserServices } from '@angular-eslint/utils';

// Part 1, rule 2 (corrected): no appearance-override class on a primitive.
// Docs: spartan styling.md, "class is for layout only. Do not use it to override
// a component's own colors, typography, or internal padding." So layout and
// spacing classes on a primitive are fine; only appearance classes are flagged.
// Independent of the counter (own classifier, angular-eslint parser).
//
// The primitive sets below are exactly the vocabulary in ../../sealing-spec.md,
// "The vocabulary, as installed" - the full set of directives/elements
// installed in libs/ui at this capstone commit. `ng-icon` is deliberately
// excluded: it is an @ng-icons element, not a Helm primitive, and spartan's
// own rules/icons.md blesses appearance classes on it (e.g. a decorative
// icon's text color). Treating it as a primitive would fight that baseline
// doc, so icons get their own rule (rule 4) instead.
const PRIMITIVE_ATTRS = new Set([
  'hlmBtn',
  'hlmInput',
  'hlmTextarea',
  'hlmLabel',
  'hlmSeparator',
  'hlmSkeleton',
  'hlmBadge',
  'hlmTooltip',
  'hlmCard',
  'hlmCardHeader',
  'hlmCardFooter',
  'hlmCardTitle',
  'hlmCardDescription',
  'hlmCardContent',
  'hlmCardAction',
  'hlmTable',
  'hlmTableContainer',
  'hlmTHead',
  'hlmTBody',
  'hlmTFoot',
  'hlmTr',
  'hlmTh',
  'hlmTd',
  'hlmCaption',
  'hlmTableHeader',
  'hlmTableBody',
  'hlmTableFooter',
  'hlmTableRow',
  'hlmTableHead',
  'hlmTableCell',
  'hlmTableCaption',
  'hlmField',
  'hlmFieldContent',
  'hlmFieldDescription',
  'hlmFieldGroup',
  'hlmFieldLabel',
  'hlmFieldTitle',
  'hlmFieldSet',
  'hlmFieldLegend',
  'hlmSelect',
  'hlmSelectGroup',
  'hlmSelectLabel',
  'hlmSelectMultiple',
  'hlmSelectPlaceholder',
  'hlmSelectPortal',
  'hlmSelectSeparator',
  'hlmSelectValue',
  'hlmSelectValues',
  'hlmSelectValuesContent',
  'hlmSelectValueTemplate',
  'hlmDialogClose',
  'hlmDialogDescription',
  'hlmDialogFooter',
  'hlmDialogHeader',
  'hlmDialogOverlay',
  'hlmDialogPortal',
  'hlmDialogTitle',
  'hlmDialogTrigger',
  'hlmDialogTriggerFor',
  'hlmSheetClose',
  'hlmSheetDescription',
  'hlmSheetFooter',
  'hlmSheetHeader',
  'hlmSheetOverlay',
  'hlmSheetPortal',
  'hlmSheetTitle',
  'hlmSheetTrigger',
  'hlmTabs',
  'hlmTabsContent',
  'hlmTabsContentLazy',
  'hlmTabsList',
  'hlmTabsTrigger',
  'hlmAvatarBadge',
  'hlmAvatarFallback',
  'hlmAvatarGroup',
  'hlmAvatarGroupCount',
  'hlmAvatarImage',
  'hlmSwitchThumb',
  'hlmSidebarContent',
  'hlmSidebarFooter',
  'hlmSidebarGroup',
  'hlmSidebarGroupAction',
  'hlmSidebarGroupContent',
  'hlmSidebarGroupLabel',
  'hlmSidebarHeader',
  'hlmSidebarInput',
  'hlmSidebarInset',
  'hlmSidebarMenu',
  'hlmSidebarMenuAction',
  'hlmSidebarMenuBadge',
  'hlmSidebarMenuButton',
  'hlmSidebarMenuItem',
  'hlmSidebarMenuSkeleton',
  'hlmSidebarMenuSub',
  'hlmSidebarMenuSubButton',
  'hlmSidebarMenuSubItem',
  'hlmSidebarRail',
  'hlmSidebarSeparator',
  'hlmSidebarTrigger',
  'hlmSidebarWrapper',
]);
const PRIMITIVE_ELEMENTS = new Set([
  'hlm-card',
  'hlm-card-header',
  'hlm-card-footer',
  'hlm-badge',
  'hlm-separator',
  'hlm-skeleton',
  'hlm-avatar',
  'hlm-avatar-badge',
  'hlm-avatar-group',
  'hlm-avatar-group-count',
  'hlm-field',
  'hlm-field-content',
  'hlm-field-description',
  'hlm-field-error',
  'hlm-field-group',
  'hlm-field-label',
  'hlm-field-separator',
  'hlm-field-title',
  'hlm-select',
  'hlm-select-content',
  'hlm-select-group',
  'hlm-select-item',
  'hlm-select-label',
  'hlm-select-multiple',
  'hlm-select-placeholder',
  'hlm-select-scroll-down',
  'hlm-select-scroll-up',
  'hlm-select-separator',
  'hlm-select-trigger',
  'hlm-select-value',
  'hlm-select-values-content',
  'hlm-dialog',
  'hlm-dialog-content',
  'hlm-dialog-footer',
  'hlm-dialog-header',
  'hlm-dialog-overlay',
  'hlm-sheet',
  'hlm-sheet-content',
  'hlm-sheet-footer',
  'hlm-sheet-header',
  'hlm-sheet-overlay',
  'hlm-tabs',
  'hlm-tabs-list',
  'hlm-paginated-tabs-list',
  'hlm-switch',
  'hlm-sidebar',
  'hlm-sidebar-content',
  'hlm-sidebar-footer',
  'hlm-sidebar-group',
  'hlm-sidebar-header',
  'hlm-sidebar-menu-badge',
  'hlm-sidebar-menu-skeleton',
  'hlm-sidebar-separator',
  'hlm-sidebar-wrapper',
]);

const isPrimitive = (node) =>
  PRIMITIVE_ELEMENTS.has(node.name) || node.attributes.some((a) => PRIMITIVE_ATTRS.has(a.name));

const classTokens = (node) => {
  const attr = node.attributes.find((a) => a.name === 'class');
  return attr && typeof attr.value === 'string' ? attr.value.split(/\s+/).filter(Boolean) : [];
};

const baseUtil = (t) => (t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t);

// Appearance: color, typography, decoration, internal padding. Everything else
// (display, flex/grid arrangement, dimensions, margins, position) is layout.
const APPEARANCE_RE =
  /^(bg-|text-(?!left$|center$|right$|justify$|start$|end$|wrap$|nowrap$|balance$|pretty$|ellipsis$|clip$)|font-|leading-|tracking-|border($|-)|rounded($|-)|shadow($|-)|ring($|-)|p[xytblrse]?-)/;
const isAppearance = (t) => APPEARANCE_RE.test(baseUtil(t));

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow appearance-override classes on a spartan primitive.' },
    schema: [],
    messages: {
      appearanceOnPrimitive:
        'Sealed vocabulary: "{{token}}" overrides the appearance of <{{element}}>. Class on a primitive is for layout only; change its look through a variant input or the Helm file in libs/ui.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (!isPrimitive(node)) return;
        const offender = classTokens(node).find(isAppearance);
        if (!offender) return;
        context.report({
          loc: parserServices.convertElementSourceSpanToLoc(context, node),
          messageId: 'appearanceOnPrimitive',
          data: { element: node.name, token: offender },
        });
      },
    };
  },
};
