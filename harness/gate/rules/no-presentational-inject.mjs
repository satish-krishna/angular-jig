import { inComponentClass } from './component-util.mjs';

// Rule 5 of the component-shape spec: a presentational component (under
// src/app/ui/) must not inject a data service. Keys on the file path plus the
// injected token name (HttpClient, or a *Service not on the UI-helper allowlist).
// messageId `presentationalInject` maps to the counter's `presentational-injects-data`.
const UI_HELPERS = new Set([
  'ElementRef', 'DestroyRef', 'ChangeDetectorRef', 'Renderer2', 'NgZone', 'ViewContainerRef', 'TemplateRef',
]);
const isDataToken = (n) => n === 'HttpClient' || (/Service$/.test(n) && !UI_HELPERS.has(n) && !n.startsWith('Hlm'));
const isUiPath = (f) => /(^|\/)src\/app\/ui\//.test(String(f).replaceAll('\\', '/'));

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow a presentational (src/app/ui/) component injecting a data service.' },
    schema: [],
    messages: {
      presentationalInject:
        'Component shape: a presentational component (src/app/ui/) must not inject {{token}}. Move data access to a container in a feature folder.',
    },
  },
  create(context) {
    const filename = context.filename ?? (context.getFilename && context.getFilename()) ?? '';
    if (!isUiPath(filename)) return {};
    return {
      CallExpression(node) {
        const c = node.callee;
        if (
          c &&
          c.type === 'Identifier' &&
          c.name === 'inject' &&
          node.arguments.length &&
          node.arguments[0].type === 'Identifier'
        ) {
          const token = node.arguments[0].name;
          if (isDataToken(token) && inComponentClass(node)) {
            context.report({ node, messageId: 'presentationalInject', data: { token } });
          }
        }
      },
    };
  },
};
