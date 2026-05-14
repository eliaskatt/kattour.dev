import { parse } from './parser';
import { evaluateExpression, interpolateTemplate, RuntimeScope } from './expression';
import { browserRuntime } from './runtime';
import { ComponentNode, ElementNode, ForNode, IfNode, ProgramNode, PropertyNode, UINode } from './ast';

interface CompileContext {
  ast: ProgramNode;
  components: Map<string, ComponentNode>;
  state: RuntimeScope;
}

const KATTOUR_KEYWORDS = [
  'page', 'theme', 'state', 'computed', 'effect', 'route', 'component', 'view',
  'screen', 'column', 'row', 'card', 'text', 'title', 'button', 'input', 'link',
  'image', 'for', 'if', 'else', 'in', 'bind', 'click', 'go', 'nav', 'hero',
  'section', 'features', 'feature', 'codeblock', 'footer', 'badge', 'eyebrow',
  'subtitle', 'heading', 'split', 'body', 'divider', 'grid', 'actions', 'highlight'
];

const KATTOUR_CSS = `
:root {
  color-scheme: dark;
  --k-primary: #cb0606;
  --k-primary-light: #f43f5e;
  --k-bg: #07090f;
  --k-surface: rgba(13, 18, 30, 0.9);
  --k-surface-raised: rgba(17, 24, 39, 0.95);
  --k-border: rgba(255,255,255,0.07);
  --k-border-bright: rgba(255,255,255,0.13);
  --k-text: #e5e7eb;
  --k-text-muted: #9ca3af;
  --k-text-faint: #6b7280;
  --k-radius: 16px;
  --k-font: Inter, 'Helvetica Neue', system-ui, sans-serif;
  --k-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--k-bg);
  background-image:
    radial-gradient(ellipse 90% 60% at 50% -10%, rgba(203,6,6,0.13), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(79,70,229,0.06), transparent 50%);
  background-attachment: fixed;
  color: var(--k-text);
  font-family: var(--k-font);
  min-height: 100vh;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Screen ─────────────────────────────── */
.k-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Nav ─────────────────────────────────── */
.k-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  width: 100%;
  background: rgba(7,9,15,0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--k-border);
}
.k-nav-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 40px;
  height: 62px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.k-nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.01em;
  margin-right: 16px;
  flex-shrink: 0;
}
.k-nav-mark {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--k-primary), #ef4444);
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 900;
  color: #fff;
  box-shadow: 0 4px 12px rgba(203,6,6,0.4);
}
.k-nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}
.k-nav-links a {
  color: var(--k-text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 9px;
  transition: color .15s, background .15s;
  white-space: nowrap;
}
.k-nav-links a:hover { color: var(--k-text); background: rgba(255,255,255,0.05); }
.k-nav-actions { margin-left: auto; display: flex; align-items: center; }
.k-nav-cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--k-primary), #ef4444);
  color: #fff !important;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(203,6,6,0.35);
  transition: opacity .15s, transform .1s;
  white-space: nowrap;
}
.k-nav-cta:hover { opacity: .85; color: #fff !important; }

/* ── Hero ────────────────────────────────── */
.k-hero {
  width: 100%;
  padding: 88px 40px 72px;
  text-align: center;
}
.k-hero-inner {
  max-width: 860px;
  margin: 0 auto;
}
.k-hero .k-eyebrow { margin-bottom: 22px; justify-content: center; }
.k-hero h1 {
  font-size: clamp(38px, 5.5vw, 76px);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: #fff;
  margin-bottom: 26px;
}
.k-hero h1 em { font-style: normal; color: var(--k-primary-light); }
.k-hero .k-subtitle {
  font-size: clamp(16px, 2vw, 20px);
  color: var(--k-text-muted);
  line-height: 1.7;
  max-width: 620px;
  margin: 0 auto 40px;
}
.k-hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4px;
}

/* ── Section ─────────────────────────────── */
.k-section { width: 100%; padding: 72px 40px; }
.k-section-inner { max-width: 1160px; margin: 0 auto; }
.k-section-header { text-align: center; margin-bottom: 52px; }
.k-section-header .k-eyebrow { justify-content: center; margin-bottom: 14px; }
.k-section-title {
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 16px;
}
.k-section-subtitle {
  font-size: 18px;
  color: var(--k-text-muted);
  max-width: 560px;
  margin: 0 auto;
}

/* ── Features ────────────────────────────── */
.k-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.k-feature {
  background: var(--k-surface);
  border: 1px solid var(--k-border);
  border-radius: var(--k-radius);
  padding: 26px 24px;
  transition: border-color .2s, transform .2s;
}
.k-feature:hover { border-color: var(--k-border-bright); transform: translateY(-2px); }
.k-feature h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  margin-top: 10px;
}
.k-feature .k-body { font-size: 14px; color: var(--k-text-muted); line-height: 1.65; }
.k-feature a[data-k-link] { display: inline-block; margin-top: 14px; font-size: 13px; }

/* ── Grid ────────────────────────────────── */
.k-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* ── Split ───────────────────────────────── */
.k-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
}

/* ── Column / Row ────────────────────────── */
.k-column { display: flex; flex-direction: column; gap: 16px; }
.k-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

/* ── Card ────────────────────────────────── */
.k-card {
  background: var(--k-surface);
  border: 1px solid var(--k-border);
  border-radius: var(--k-radius);
  padding: 24px;
}

/* ── Badge ───────────────────────────────── */
.k-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  background: rgba(203,6,6,0.14);
  color: #fca5a5;
  border: 1px solid rgba(203,6,6,0.28);
  margin-bottom: 2px;
}
.k-badge.done   { background: rgba(34,197,94,0.12); color: #86efac; border-color: rgba(34,197,94,0.25); }
.k-badge.active { background: rgba(251,191,36,0.12); color: #fde68a; border-color: rgba(251,191,36,0.25); }
.k-badge.next   { background: rgba(99,102,241,0.14); color: #c7d2fe; border-color: rgba(99,102,241,0.28); }
.k-badge.planned{ background: rgba(107,114,128,0.14); color: #d1d5db; border-color: rgba(107,114,128,0.25); }
.k-badge.free   { background: rgba(34,197,94,0.12); color: #86efac; border-color: rgba(34,197,94,0.25); }
.k-badge.open.source { background: rgba(203,6,6,0.14); }
.k-badge.community  { background: rgba(99,102,241,0.14); color: #c7d2fe; border-color: rgba(99,102,241,0.28); }
.k-badge.contribute { background: rgba(251,191,36,0.12); color: #fde68a; border-color: rgba(251,191,36,0.25); }

/* ── Eyebrow ─────────────────────────────── */
.k-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--k-primary-light);
}
.k-eyebrow::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 2px;
  background: var(--k-primary-light);
  border-radius: 2px;
}

/* ── Headings ────────────────────────────── */
.k-heading {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  line-height: 1.3;
}
.k-title {
  font-size: clamp(26px, 4vw, 48px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.1;
}
.k-subtitle { font-size: 16px; color: var(--k-text-muted); line-height: 1.7; }

/* ── Text / Body ─────────────────────────── */
.k-text { font-size: 15px; color: var(--k-text-muted); line-height: 1.7; }
.k-body { font-size: 14px; color: var(--k-text-muted); line-height: 1.7; }

/* ── Code Block ──────────────────────────── */
.k-codeblock {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 20px 22px;
  overflow-x: auto;
  font: 13px/1.75 var(--k-mono);
  color: #e6edf3;
  white-space: pre;
  tab-size: 2;
}
.k-codeblock code { display: block; }
.k-codeblock .kw  { color: #ff7b72; }
.k-codeblock .str { color: #a5d6ff; }
.k-codeblock .num { color: #79c0ff; }
.k-codeblock .var { color: #ffa657; }
.k-codeblock .cmt { color: #8b949e; font-style: italic; }
.k-codeblock .punc{ color: rgba(255,123,114,0.65); }

/* ── Buttons ─────────────────────────────── */
button, a.k-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 11px 22px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font: 600 15px var(--k-font);
  transition: opacity .15s, transform .1s, box-shadow .15s;
  text-decoration: none;
  background: linear-gradient(135deg, var(--k-primary), #ef4444);
  color: #fff;
  box-shadow: 0 4px 16px rgba(203,6,6,0.3);
  white-space: nowrap;
}
button:hover, a.k-btn:hover { opacity: .85; }
button:active, a.k-btn:active { transform: scale(0.98); }
button.k-secondary {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--k-border-bright);
  color: var(--k-text);
  box-shadow: none;
}
button.k-secondary:hover { background: rgba(255,255,255,0.08); }

/* ── Links ───────────────────────────────── */
a[data-k-link] {
  color: var(--k-primary-light);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: opacity .15s;
}
a[data-k-link]:hover { opacity: .8; text-decoration: underline; }

/* ── Input ───────────────────────────────── */
input {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--k-border-bright);
  border-radius: 10px;
  padding: 12px 15px;
  color: var(--k-text);
  font: 14px var(--k-font);
  width: 100%;
  transition: border-color .15s;
}
input::placeholder { color: var(--k-text-faint); }
input:focus { outline: none; border-color: rgba(203,6,6,0.55); box-shadow: 0 0 0 3px rgba(203,6,6,0.12); }

/* ── Divider ─────────────────────────────── */
.k-divider { border: none; border-top: 1px solid var(--k-border); margin: 40px 0; }

/* ── Actions ─────────────────────────────── */
.k-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

/* ── Footer ──────────────────────────────── */
.k-footer {
  width: 100%;
  border-top: 1px solid var(--k-border);
  padding: 36px 40px;
  margin-top: auto;
}
.k-footer-inner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.k-footer p, .k-footer .k-text { font-size: 14px; color: var(--k-text-faint); }
.k-footer .k-row a { font-size: 13px; color: var(--k-text-faint); text-decoration: none; }
.k-footer .k-row a:hover { color: var(--k-text-muted); }

/* ── Highlight ───────────────────────────── */
.k-highlight {
  background: linear-gradient(135deg, rgba(203,6,6,0.1), rgba(244,63,94,0.06));
  border: 1px solid rgba(203,6,6,0.2);
  border-radius: var(--k-radius);
  padding: 32px;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 1024px) {
  .k-features { grid-template-columns: repeat(2, 1fr); }
  .k-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .k-nav-inner { padding: 0 20px; }
  .k-nav-links { display: none; }
  .k-hero { padding: 56px 24px 48px; }
  .k-section { padding: 48px 24px; }
  .k-features { grid-template-columns: 1fr; }
  .k-grid { grid-template-columns: 1fr; }
  .k-split { grid-template-columns: 1fr; }
  .k-footer { padding: 28px 24px; }
  .k-footer-inner { flex-direction: column; text-align: center; }
}
@media (max-width: 480px) {
  .k-hero-actions { flex-direction: column; align-items: center; }
  .k-hero-actions button, .k-hero-actions a { width: 100%; max-width: 320px; }
}
`;

export function compile(source: string): string {
  const ast = parse(source);
  const states = ast.body.filter(node => node.type === 'State');
  const computed = ast.body.filter(node => node.type === 'Computed');
  const effects = ast.body.filter(node => node.type === 'Effect');
  const routes = ast.body.filter(node => node.type === 'Route');
  const theme = ast.body.find(node => node.type === 'Theme');
  const view = ast.body.find(node => node.type === 'View');
  const pageNode = ast.body.find(node => node.type === 'Page');
  const components = new Map<string, ComponentNode>();
  const state = Object.fromEntries(states.map(s => [s.name, s.value]));
  const computedMap = Object.fromEntries(computed.map(c => [c.name, c.expression]));
  const effectList = effects.map(effect => ({ dependencies: effect.dependencies, body: effect.body }));

  for (const node of ast.body) {
    if (node.type === 'Component') components.set(node.name, node);
  }

  const previewState = { ...state };
  for (const [name, expression] of Object.entries(computedMap)) {
    previewState[name] = interpolateComputed(String(expression), previewState);
  }

  const ctx: CompileContext = { ast, components, state: previewState };

  const themeOverrides = theme && theme.type === 'Theme'
    ? theme.tokens.map((token: PropertyNode) => `--k-${token.key}: ${token.value};`).join('\n  ')
    : '';

  const pageTitle = pageNode?.type === 'Page' ? pageNode.name.replace(/([A-Z])/g, ' $1').trim() : 'Kattour';

  const html = view ? view.body.map(node => renderNode(node, ctx, {})).join('\n') : '';
  const routeMap = Object.fromEntries(
    routes.map(route => [route.path, route.body.map(node => renderNode(node, ctx, {})).join('\n')])
  );

  const initialHtml = Object.keys(routeMap).length > 0
    ? (routeMap['/'] ?? Object.values(routeMap)[0] ?? '')
    : html;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="Built with Kattour — the clarity-first UI language." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
${KATTOUR_CSS}
${themeOverrides ? `:root {\n  ${themeOverrides}\n}` : ''}
</style>
</head>
<body>
<div id="kattour-root">${initialHtml}</div>
<script>
window.__KATTOUR_STATE__ = ${JSON.stringify(state)};
window.__KATTOUR_COMPUTED__ = ${JSON.stringify(computedMap)};
window.__KATTOUR_EFFECTS__ = ${JSON.stringify(effectList)};
window.__KATTOUR_ROUTES__ = ${JSON.stringify(routeMap)};
${browserRuntime}
</script>
</body>
</html>`;
}

function renderNode(node: UINode, ctx: CompileContext, scope: RuntimeScope): string {
  if (node.type === 'If') return renderIf(node, ctx, scope);
  if (node.type === 'For') return renderFor(node, ctx, scope);
  return renderElement(node, ctx, scope);
}

function renderIf(node: IfNode, ctx: CompileContext, scope: RuntimeScope): string {
  const value = evaluateExpression(node.condition, ctx.state, scope);
  const branch = (Boolean(value) && value !== 'false') ? node.then : node.else;
  return branch.map(child => renderNode(child, ctx, scope)).join('');
}

function renderFor(node: ForNode, ctx: CompileContext, scope: RuntimeScope): string {
  const collection = evaluateExpression(node.collection, ctx.state, scope);
  const items = Array.isArray(collection)
    ? collection
    : String(collection ?? '').split(',').map(item => item.trim()).filter(Boolean);
  return items.map(item =>
    node.body.map(child => renderNode(child, ctx, { ...scope, [node.item]: item })).join('')
  ).join('');
}

function renderElement(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  // Check for user-defined components first
  const component = ctx.components.get(element.name);
  if (component) {
    const nextScope = { ...scope };
    component.params.forEach((param, index) => {
      if (index === 0 && element.label) {
        nextScope[param] = evaluateExpression(element.label, ctx.state, scope);
      }
    });
    return component.body.map(child => renderNode(child, ctx, nextScope)).join('');
  }

  switch (element.name) {
    case 'screen':    return renderScreen(element, ctx, scope);
    case 'nav':       return renderNav(element, ctx, scope);
    case 'hero':      return renderHero(element, ctx, scope);
    case 'section':   return renderSection(element, ctx, scope);
    case 'features':  return renderFeatures(element, ctx, scope);
    case 'feature':   return renderFeature(element, ctx, scope);
    case 'codeblock': return renderCodeblock(element, ctx, scope);
    case 'footer':    return renderFooter(element, ctx, scope);
    case 'badge':     return renderBadge(element, ctx, scope);
    case 'eyebrow':   return `<p class="k-eyebrow">${escapeHtml(element.label ?? '')}</p>`;
    case 'subtitle':  return `<p class="k-subtitle">${escapeHtml(element.label ?? '')}</p>`;
    case 'heading':   return `<h3 class="k-heading">${escapeHtml(element.label ?? '')}${element.children.map(c => renderNode(c, ctx, scope)).join('')}</h3>`;
    case 'body':      return `<p class="k-body">${escapeHtml(element.label ?? '')}${element.children.map(c => renderNode(c, ctx, scope)).join('')}</p>`;
    case 'divider':   return '<hr class="k-divider" />';
    case 'actions':   return `<div class="k-actions">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'highlight': return `<div class="k-highlight">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'split':     return `<div class="k-split">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'grid':      return `<div class="k-grid">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'column':    return `<div class="k-column">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'row':       return `<div class="k-row">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'card':      return `<div class="k-card">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'text':      return renderText(element, ctx, scope);
    case 'title':     return renderTitle(element, ctx, scope);
    case 'button':    return renderButton(element, ctx, scope);
    case 'input':     return renderInput(element, ctx, scope);
    case 'link':      return renderLink(element, ctx, scope);
    case 'image':     return renderImage(element, ctx, scope);
    default:          return renderGeneric(element, ctx, scope);
  }
}

function renderScreen(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  return `<div class="k-screen">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
}

function renderNav(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const titleEl = children.find(c => c.name === 'title');
  const brandName = titleEl?.label ?? 'Kattour';
  const links = children.filter(c => c.name === 'link');
  const mainLinks = links.slice(0, -1);
  const ctaLink = links.at(-1);

  const linksHtml = mainLinks.map(link => {
    const to = link.properties.find(p => p.key === 'to')?.value ?? '#';
    const label = link.label ?? '';
    return `<a href="${escapeHtml(to)}" data-k-link="${escapeHtml(to)}">${escapeHtml(label)}</a>`;
  }).join('');

  const ctaHtml = ctaLink
    ? (() => {
        const to = ctaLink.properties.find(p => p.key === 'to')?.value ?? '#';
        const label = ctaLink.label ?? '';
        const isExternal = to.startsWith('http');
        const extra = isExternal ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${escapeHtml(to)}" data-k-link="${escapeHtml(to)}" class="k-nav-cta"${extra}>${escapeHtml(label)}</a>`;
      })()
    : '';

  return `<nav class="k-nav" role="navigation" aria-label="Main navigation">
  <div class="k-nav-inner">
    <a href="/" data-k-link="/" class="k-nav-brand">
      <span class="k-nav-mark">K</span>
      ${escapeHtml(brandName)}
    </a>
    <div class="k-nav-links">${linksHtml}</div>
    <div class="k-nav-actions">${ctaHtml}</div>
  </div>
</nav>`;
}

function renderHero(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const eyebrowEl  = children.find(c => c.name === 'eyebrow');
  const titleEl    = children.find(c => c.name === 'title');
  const subtitleEl = children.find(c => c.name === 'subtitle');
  const buttons    = children.filter(c => c.name === 'button');
  const codeEl     = children.find(c => c.name === 'codeblock');

  const eyebrowHtml  = eyebrowEl  ? `<p class="k-eyebrow">${escapeHtml(eyebrowEl.label ?? '')}</p>` : '';
  const titleHtml    = titleEl    ? `<h1>${escapeHtml(titleEl.label ?? '')}</h1>` : '';
  const subtitleHtml = subtitleEl ? `<p class="k-subtitle">${escapeHtml(subtitleEl.label ?? '')}</p>` : '';

  const actionsHtml = buttons.length > 0
    ? `<div class="k-hero-actions">${buttons.map((b, i) => {
        const modified = i > 0
          ? { ...b, properties: [...b.properties, { key: 'variant', value: 'secondary' }] }
          : b;
        return renderButton(modified, ctx, scope);
      }).join('')}</div>`
    : '';

  const codeHtml = codeEl ? `<div style="margin-top:40px;text-align:left;">${renderCodeblock(codeEl, ctx, scope)}</div>` : '';

  return `<section class="k-hero">
  <div class="k-hero-inner">
    ${eyebrowHtml}
    ${titleHtml}
    ${subtitleHtml}
    ${actionsHtml}
    ${codeHtml}
  </div>
</section>`;
}

function renderSection(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children   = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const eyebrowEl  = children.find(c => c.name === 'eyebrow');
  const titleEl    = children.find(c => c.name === 'title');
  const subtitleEl = children.find(c => c.name === 'subtitle');
  const rest       = children.filter(c => !['eyebrow', 'title', 'subtitle'].includes(c.name));

  const hasHeader  = eyebrowEl || titleEl || subtitleEl;

  const headerHtml = hasHeader ? `<div class="k-section-header">
    ${eyebrowEl  ? `<p class="k-eyebrow">${escapeHtml(eyebrowEl.label ?? '')}</p>` : ''}
    ${titleEl    ? `<h2 class="k-section-title">${escapeHtml(titleEl.label ?? '')}</h2>` : ''}
    ${subtitleEl ? `<p class="k-section-subtitle">${escapeHtml(subtitleEl.label ?? '')}</p>` : ''}
  </div>` : '';

  const contentHtml = rest.map(c => renderNode(c, ctx, scope)).join('');

  return `<section class="k-section">
  <div class="k-section-inner">
    ${headerHtml}
    ${contentHtml}
  </div>
</section>`;
}

function renderFeatures(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  return `<div class="k-features">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
}

function renderFeature(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const name     = element.label ?? element.name;
  const children = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const badgeEl  = children.find(c => c.name === 'badge');
  const bodyEl   = children.find(c => c.name === 'body');
  const linkEl   = children.find(c => c.name === 'link');
  const rest     = children.filter(c => !['badge', 'body', 'link'].includes(c.name));

  const badgeHtml = badgeEl ? renderBadge(badgeEl, ctx, scope) : '';
  const bodyHtml  = bodyEl  ? `<p class="k-body">${escapeHtml(bodyEl.label ?? '')}</p>` : '';
  const linkHtml  = linkEl  ? renderLink(linkEl, ctx, scope) : '';
  const restHtml  = rest.map(c => renderNode(c, ctx, scope)).join('');

  return `<article class="k-feature">
  ${badgeHtml}
  <h3>${escapeHtml(name)}</h3>
  ${bodyHtml}
  ${restHtml}
  ${linkHtml}
</article>`;
}

function renderCodeblock(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  let code = element.label ?? element.children
    .filter(c => c.type === 'Element' && (c as ElementNode).name === 'text')
    .map(c => (c as ElementNode).label ?? '').join('\n');

  code = code
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');

  return `<pre class="k-codeblock"><code>${highlightKattour(code)}</code></pre>`;
}

function highlightKattour(code: string): string {
  const keywords = new Set(KATTOUR_KEYWORDS);
  let result = '';
  let i = 0;

  while (i < code.length) {
    // Comments
    if (code[i] === '/' && code[i + 1] === '/') {
      let comment = '';
      while (i < code.length && code[i] !== '\n') comment += code[i++];
      result += `<span class="cmt">${escapeHtml(comment)}</span>`;
      continue;
    }

    // Strings
    if (code[i] === '"') {
      let str = '"';
      i++;
      while (i < code.length && !(code[i] === '"' && code[i - 1] !== '\\')) {
        str += code[i++];
      }
      str += '"';
      i++;
      result += `<span class="str">${escapeHtml(str)}</span>`;
      continue;
    }

    // Numbers
    if (/\d/.test(code[i])) {
      let num = '';
      while (i < code.length && /[\d.]/.test(code[i])) num += code[i++];
      result += `<span class="num">${escapeHtml(num)}</span>`;
      continue;
    }

    // Variables ($...)
    if (code[i] === '$') {
      let varName = '$';
      i++;
      while (i < code.length && /[a-zA-Z0-9_.]/.test(code[i])) varName += code[i++];
      result += `<span class="var">${escapeHtml(varName)}</span>`;
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(code[i])) {
      let word = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) word += code[i++];
      result += keywords.has(word)
        ? `<span class="kw">${escapeHtml(word)}</span>`
        : escapeHtml(word);
      continue;
    }

    // Braces
    if (code[i] === '{' || code[i] === '}') {
      result += `<span class="punc">${escapeHtml(code[i])}</span>`;
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

function renderFooter(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const contentHtml = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<footer class="k-footer"><div class="k-footer-inner">${contentHtml}</div></footer>`;
}

function renderBadge(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const label = element.label ?? '';
  const cssClass = label.toLowerCase().replace(/\s+/g, '-');
  return `<span class="k-badge ${cssClass}">${escapeHtml(label)}</span>`;
}

function renderText(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const label = element.label ? interpolateTemplate(element.label, ctx.state, scope) : '';
  const dataAttr = element.label ? ` data-k-text="${escapeHtml(element.label)}"` : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<p class="k-text"${dataAttr}>${escapeHtml(label)}${children}</p>`;
}

function renderTitle(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const label = element.label ? interpolateTemplate(element.label, ctx.state, scope) : '';
  const dataAttr = element.label ? ` data-k-text="${escapeHtml(element.label)}"` : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<h1 class="k-title"${dataAttr}>${escapeHtml(label)}${children}</h1>`;
}

function renderButton(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const attrs: string[] = [];
  for (const event of element.events) {
    if (event.name === 'click') attrs.push(`data-k-click="${escapeHtml(event.action)}"`);
  }
  const isSecondary = element.properties.some(p => p.key === 'variant' && p.value === 'secondary');
  if (isSecondary) attrs.push('class="k-secondary"');

  const label = element.label
    ? `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>`
    : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<button ${attrs.join(' ')}>${label}${children}</button>`;
}

function renderLink(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const to = element.properties.find(p => p.key === 'to')?.value ?? '#';
  const isExternal = to.startsWith('http');
  const attrs = [`href="${escapeHtml(to)}"`, `data-k-link="${escapeHtml(to)}"`];
  if (isExternal) attrs.push('target="_blank" rel="noopener noreferrer"');

  const label = element.label
    ? `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>`
    : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<a ${attrs.join(' ')}>${label}${children}</a>`;
}

function renderInput(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const attrs: string[] = [];
  const placeholder = element.label ?? element.properties.find(p => p.key === 'placeholder')?.value ?? '';
  if (placeholder) attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
  for (const binding of element.bindings) {
    attrs.push(`data-k-bind="${escapeHtml(binding.state)}"`);
    const val = String(evaluateExpression(binding.state, ctx.state, scope) ?? '');
    if (val) attrs.push(`value="${escapeHtml(val)}"`);
  }
  for (const prop of element.properties) {
    if (prop.key !== 'placeholder') attrs.push(`${prop.key}="${escapeHtml(prop.value)}"`);
  }
  return `<input ${attrs.join(' ')} />`;
}

function renderImage(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const src = element.label ?? element.properties.find(p => p.key === 'src')?.value ?? '';
  const alt = element.properties.find(p => p.key === 'alt')?.value ?? '';
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
}

function renderGeneric(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const tag = 'div';
  const attrs: string[] = [`data-kattour="${escapeHtml(element.name)}"`];
  for (const event of element.events) {
    if (event.name === 'click') attrs.push(`data-k-click="${escapeHtml(event.action)}"`);
  }
  for (const binding of element.bindings) {
    attrs.push(`data-k-bind="${escapeHtml(binding.state)}"`);
  }
  const label = element.label ? `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>` : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<${tag} ${attrs.join(' ')}>${label}${children}</${tag}>`;
}

function interpolateComputed(expression: string, state: RuntimeScope): string {
  return expression.split('+').map(part => part.trim()).filter(Boolean).map(part => {
    if (part.startsWith('"') && part.endsWith('"')) return part.slice(1, -1);
    return String(evaluateExpression(part, state, {}) ?? '');
  }).join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
