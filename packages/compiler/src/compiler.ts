import { analyze } from './analyzer';
import { isBuiltinModule, renderBuiltinModule } from './builtins';
import { parseDetailed } from './parser';
import { evaluateExpression, interpolateTemplate, RuntimeScope } from './expression';
import { browserRuntime } from './runtime';
import {
  CompileResult,
  ComponentNode,
  ElementNode,
  ForNode,
  IfNode,
  ModuleNode,
  ProgramNode,
  PropertyNode,
  SlotNode,
  UINode
} from './ast';
import { escapeAttribute, escapeHtml, safeUrl, tag } from './html';

const HTML_TAGS: Record<string, string> = {
  screen: 'main', main: 'main', section: 'section', container: 'div', column: 'div', row: 'div', grid: 'div', stack: 'div',
  card: 'section', panel: 'section', text: 'p', title: 'h1', subtitle: 'h2', caption: 'small', button: 'button', input: 'input',
  textarea: 'textarea', select: 'select', option: 'option', image: 'img', avatar: 'img', badge: 'span', link: 'a', list: 'ul',
  item: 'li', table: 'table', thead: 'thead', tbody: 'tbody', tr: 'tr', th: 'th', td: 'td', form: 'form', label: 'label',
  divider: 'hr', spacer: 'div', nav: 'nav', footer: 'footer', header: 'header', aside: 'aside', article: 'article'
};

const SELF_CLOSING = new Set(['input', 'image', 'avatar', 'divider']);
const CLASS_MAP: Record<string, string> = {
  screen: 'k-screen', section: 'k-section', container: 'k-container', column: 'k-column', row: 'k-row', grid: 'k-grid', stack: 'k-stack',
  card: 'k-card', panel: 'k-panel', button: 'k-button', input: 'k-input', textarea: 'k-textarea', select: 'k-select', badge: 'k-badge',
  image: 'k-image', avatar: 'k-avatar', table: 'k-table'
};

interface CompileContext {
  ast: ProgramNode;
  components: Map<string, ComponentNode>;
  modules: Map<string, ModuleNode>;
  state: RuntimeScope;
  slots: Record<string, UINode[]>;
}

export interface CompileOptions {
  mode?: 'document' | 'fragment';
  strict?: boolean;
}

export function compileDetailed(source: string, options: CompileOptions = {}): CompileResult {
  const parsed = parseDetailed(source);
  const ast = parsed.ast;
  const analysis = analyze(ast);
  const diagnostics = analysis.diagnostics;
  const state = buildInitialState(ast);
  const computedMap = Object.fromEntries(ast.body.filter(node => node.type === 'Computed').map(node => [node.name, node.expression]));
  const effects = ast.body.filter(node => node.type === 'Effect').map(effect => ({ trigger: effect.trigger, dependencies: effect.dependencies, body: effect.body }));
  const theme = ast.body.find(node => node.type === 'Theme');
  const meta = ast.body.find(node => node.type === 'Meta');
  const page = ast.body.find(node => node.type === 'Page');
  const view = ast.body.find(node => node.type === 'View');

  for (const [name, expression] of Object.entries(computedMap)) state[name] = interpolateComputed(String(expression), state);

  const ctx: CompileContext = { ast, components: analysis.components, modules: analysis.modules, state, slots: {} };
  const fragment = view
    ? view.body.map(node => renderNode(node, ctx, {})).join('\n')
    : analysis.routes[0]
      ? analysis.routes[0].body.map(node => renderNode(node, ctx, {})).join('\n')
      : '<main class="k-screen"></main>';

  const routeMap = Object.fromEntries(analysis.routes.map(route => [route.path, route.body.map(node => renderNode(node, ctx, {})).join('\n')]));
  const html = options.mode === 'fragment'
    ? fragment
    : renderDocument({ title: page?.name ?? 'Kattour', fragment, state, computedMap, effects, routeMap, themeTokens: theme?.tokens ?? [], metaTokens: meta?.properties ?? [] });

  return { html, ast, diagnostics, ok: !diagnostics.some(d => d.severity === 'error') };
}

export function compile(source: string): string {
  return compileDetailed(source).html;
}

function buildInitialState(ast: ProgramNode): RuntimeScope {
  const state: RuntimeScope = {};
  for (const node of ast.body) if (node.type === 'State') state[node.name] = node.value;
  return state;
}

function renderDocument(input: {
  title: string; fragment: string; state: RuntimeScope; computedMap: Record<string, string>; effects: unknown[]; routeMap: Record<string, string>; themeTokens: PropertyNode[]; metaTokens: PropertyNode[];
}): string {
  const cssVars = input.themeTokens.length
    ? input.themeTokens.map(token => `--k-${token.key}: ${escapeCssValue(String(token.value))};`).join('\n')
    : '--k-primary: #111827;\n--k-radius: 14;\n--k-bg: #f8fafc;\n--k-text: #0f172a;';
  const description = String(input.metaTokens.find(t => t.key === 'description')?.value ?? 'Built with Kattour');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(input.title)}</title>
<meta name="description" content="${escapeAttribute(description)}" />
<style>${baseCss(cssVars)}</style>
</head>
<body>
<div id="kattour-root">${input.fragment}</div>
<script>
window.__KATTOUR_STATE__ = ${safeJson(input.state)};
window.__KATTOUR_COMPUTED__ = ${safeJson(input.computedMap)};
window.__KATTOUR_EFFECTS__ = ${safeJson(input.effects)};
window.__KATTOUR_ROUTES__ = ${safeJson(input.routeMap)};
${browserRuntime}
</script>
</body>
</html>`;
}

function renderNode(node: UINode, ctx: CompileContext, scope: RuntimeScope): string {
  if (node.type === 'If') return renderIf(node, ctx, scope);
  if (node.type === 'For') return renderFor(node, ctx, scope);
  if (node.type === 'Slot') return renderSlot(node, ctx, scope);
  if (node.type === 'ComponentCall') return '';
  return renderElement(node, ctx, scope);
}

function renderIf(node: IfNode, ctx: CompileContext, scope: RuntimeScope): string {
  const value = evaluateExpression(node.condition, ctx.state, scope);
  return (Boolean(value) && value !== 'false' ? node.then : node.else).map(child => renderNode(child, ctx, scope)).join('');
}

function renderFor(node: ForNode, ctx: CompileContext, scope: RuntimeScope): string {
  const collection = evaluateExpression(node.collection, ctx.state, scope);
  const items = Array.isArray(collection) ? collection : String(collection ?? '').split(',').map(item => item.trim()).filter(Boolean);
  return items.map((item, index) => node.body.map(child => renderNode(child, ctx, { ...scope, [node.item]: item, ...(node.index ? { [node.index]: index } : {}) })).join('')).join('');
}

function renderSlot(node: SlotNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children = ctx.slots[node.name] ?? ctx.slots.default ?? node.fallback;
  return children.map(child => renderNode(child, ctx, scope)).join('');
}

function renderElement(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  if (isBuiltinModule(element.name)) {
    return renderBuiltinModule(element.name, element, {
      state: ctx.state,
      scope,
      renderChildren: children => children.map(child => renderNode(child, ctx, scope)).join('')
    });
  }

  const reusable = ctx.components.get(element.name) ?? ctx.modules.get(element.name);
  if (reusable) return renderReusable(reusable, element, ctx, scope);

  const htmlTag = HTML_TAGS[element.name] || 'div';
  const attrs: Record<string, unknown> = {};
  const classes = [CLASS_MAP[element.name]].filter(Boolean);

  for (const property of element.properties) {
    const value = resolvePropertyValue(property, ctx, scope);
    if (property.key === 'class') classes.push(String(value));
    else if (property.key === 'to' || property.key === 'href') { attrs.href = safeUrl(String(value)); if (property.key === 'to') attrs['data-k-link'] = safeUrl(String(value)); }
    else if (property.key === 'src') attrs.src = safeUrl(String(value));
    else if (property.key === 'alt') attrs.alt = value;
    else if (property.key === 'variant') classes.push(`k-${element.name}--${String(value)}`);
    else attrs[property.key] = value;
  }

  if (classes.length) attrs.class = classes.join(' ');
  for (const event of element.events) attrs[`data-k-${event.name}`] = event.action;
  for (const binding of element.bindings) {
    attrs[`data-k-bind-${binding.property}`] = binding.state;
    if (binding.property === 'value') attrs.value = evaluateExpression(binding.state, ctx.state, scope) ?? '';
  }

  let content = '';
  if (element.label) {
    const renderedLabel = interpolateTemplate(element.label, ctx.state, scope);
    if (htmlTag === 'input' || htmlTag === 'img' || htmlTag === 'hr') attrs['aria-label'] = renderedLabel;
    else content += `<span data-k-text="${escapeAttribute(element.label)}">${escapeHtml(renderedLabel)}</span>`;
  }
  content += element.children.map(child => renderNode(child, ctx, scope)).join('');
  return tag(htmlTag, attrs, content, SELF_CLOSING.has(element.name));
}

function renderReusable(reusable: ComponentNode | ModuleNode, element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const nextScope: RuntimeScope = { ...scope };
  reusable.params.forEach((param, index) => {
    if (index === 0 && element.label) nextScope[param.name] = interpolateTemplate(element.label, ctx.state, scope);
    else if (param.defaultValue !== undefined) nextScope[param.name] = param.defaultValue;
  });
  for (const property of element.properties) nextScope[property.key] = resolvePropertyValue(property, ctx, scope);
  const nextCtx: CompileContext = { ...ctx, slots: { default: element.children } };
  return reusable.body.map(child => renderNode(child, nextCtx, nextScope)).join('');
}

function resolvePropertyValue(property: PropertyNode, ctx: CompileContext, scope: RuntimeScope): unknown {
  if (property.dynamic && typeof property.value === 'string') return evaluateExpression(property.value, ctx.state, scope);
  if (typeof property.value === 'string') return interpolateTemplate(property.value, ctx.state, scope);
  return property.value;
}

function interpolateComputed(expression: string, state: RuntimeScope): string {
  return expression.split('+').map(part => part.trim()).filter(Boolean).map(part => {
    if (part.startsWith('"') && part.endsWith('"')) return part.slice(1, -1);
    return String(evaluateExpression(part, state, {}) ?? '');
  }).join('');
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
}

function escapeCssValue(value: string): string {
  return value.replace(/[;{}]/g, '');
}

function baseCss(cssVars: string): string {
  return `:root { ${cssVars} }
* { box-sizing: border-box; }
body { margin: 0; padding: 0; background: var(--k-bg); color: var(--k-text); font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.k-screen { min-height: 100vh; padding: 32px; }
.k-section { padding: 56px 24px; }
.k-container { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.k-column, .k-stack { display: flex; flex-direction: column; gap: 16px; }
.k-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.k-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.k-card, .k-panel { background: white; border: 1px solid #e5e7eb; border-radius: calc(var(--k-radius) * 1px); padding: 24px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08); }
.k-button { border: none; background: var(--k-primary); color: white; padding: 12px 18px; border-radius: calc(var(--k-radius) * 1px); cursor: pointer; font-weight: 700; }
.k-button--secondary { background: #e5e7eb; color: #111827; }
.k-button--danger { background: #dc2626; }
.k-input, .k-textarea, .k-select { border: 1px solid #d1d5db; border-radius: calc(var(--k-radius) * 1px); padding: 12px 14px; font: inherit; width: 100%; }
.k-badge, .k-eyebrow { display: inline-flex; width: fit-content; padding: 6px 10px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-weight: 800; }
.k-image { max-width: 100%; display: block; border-radius: calc(var(--k-radius) * 1px); }
.k-avatar { width: 48px; height: 48px; border-radius: 999px; object-fit: cover; }
.k-table { width: 100%; border-collapse: collapse; }
.k-table th, .k-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
.k-module { width: min(1120px, calc(100% - 32px)); margin: 40px auto; padding: 32px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; box-shadow: 0 24px 70px rgba(15,23,42,.08); }
.k-module-head { margin-bottom: 24px; max-width: 720px; } .k-module-head h2, .k-hero h1 { margin: 10px 0; font-size: clamp(32px, 5vw, 56px); line-height: 1; letter-spacing: -.05em; }
.k-products, .k-pricing, .k-feature-grid, .k-reviews, .k-stats, .k-board { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.k-product-card, .k-pricing article, .k-feature-grid article, .k-reviews article, .k-stats article, .k-board article, .k-list-module article { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 18px; padding: 18px; display: grid; gap: 10px; }
.k-product-art, .k-hero-preview div { height: 120px; border-radius: 16px; background: linear-gradient(135deg, var(--k-primary), #8b5cf6); }
.k-admin-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; } .k-admin-shell aside, .k-admin-sidebar { background: #111827; color: white; padding: 24px; display: grid; align-content: start; gap: 12px; } .k-admin-shell main { padding: 32px; }
.k-newsletter, .k-hero, .k-mobile-showcase { width: min(1120px, calc(100% - 32px)); margin: 40px auto; display: grid; grid-template-columns: 1.2fr .8fr; gap: 24px; align-items: center; padding: 36px; border-radius: 28px; background: white; border: 1px solid #e5e7eb; }
.k-newsletter form, .k-auth, .k-checkout { display: grid; gap: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 22px; padding: 24px; width: min(460px, 100%); margin: 32px auto; }
.k-checkout div, .k-list-module article { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.k-table-wrap { overflow-x: auto; } .k-status { padding: 4px 8px; border-radius: 999px; font-weight: 800; } .k-ok { background: #dcfce7; color: #166534; } .k-warn { background: #fef3c7; color: #92400e; }
.k-timeline { display: grid; gap: 12px; list-style: none; padding: 0; } .k-timeline li { padding: 12px 14px; border-radius: 14px; background: #f1f5f9; } .k-timeline .done, .k-timeline .active { background: #eef2ff; color: #3730a3; font-weight: 800; }
.k-menu article { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #e5e7eb; }
.k-calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; } .k-calendar span { padding: 12px; text-align: center; border-radius: 12px; background: #f1f5f9; } .k-calendar .active { background: var(--k-primary); color: white; }
.k-role-matrix { display: grid; grid-template-columns: 1.5fr repeat(3, 1fr); gap: 8px; } .k-role-matrix > * { background: #f8fafc; border-radius: 12px; padding: 10px; text-align: center; }
.k-ai-chat { width: min(520px, 100%); margin: 32px auto; display: grid; gap: 12px; } .k-ai-chat span { padding: 12px 14px; border-radius: 16px; background: #eef2ff; }
.k-phone { width: 220px; height: 320px; border-radius: 32px; background: #111827; padding: 18px; display: grid; gap: 12px; } .k-phone span { background: #374151; border-radius: 14px; }
.k-search { display: grid; gap: 12px; width: min(760px, 100%); margin: 32px auto; }
a { color: var(--k-primary); cursor: pointer; text-decoration: none; font-weight: 700; }
@media (max-width: 720px) { .k-screen { padding: 18px; } .k-section { padding: 36px 16px; } .k-admin-shell, .k-newsletter, .k-hero, .k-mobile-showcase { grid-template-columns: 1fr; } }`;
}
