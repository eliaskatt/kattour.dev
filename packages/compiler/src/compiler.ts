import { parse } from './parser';
import { evaluateExpression, interpolateTemplate, RuntimeScope } from './expression';
import { browserRuntime } from './runtime';
import { ComponentNode, ElementNode, ForNode, IfNode, ProgramNode, PropertyNode, UINode } from './ast';

const HTML_TAGS: Record<string, string> = {
  screen: 'main',
  column: 'div',
  row: 'div',
  text: 'p',
  title: 'h1',
  button: 'button',
  input: 'input',
  image: 'img',
  card: 'section'
};

interface CompileContext {
  ast: ProgramNode;
  components: Map<string, ComponentNode>;
  state: RuntimeScope;
}

export function compile(source: string): string {
  const ast = parse(source);
  const states = ast.body.filter(node => node.type === 'State');
  const theme = ast.body.find(node => node.type === 'Theme');
  const view = ast.body.find(node => node.type === 'View');
  const components = new Map<string, ComponentNode>();
  const state = Object.fromEntries(states.map(s => [s.name, s.value]));

  for (const node of ast.body) {
    if (node.type === 'Component') components.set(node.name, node);
  }

  const ctx: CompileContext = { ast, components, state };
  const cssVars = theme && theme.type === 'Theme'
    ? theme.tokens.map((token: PropertyNode) => `--k-${token.key}: ${token.value};`).join('\n')
    : '--k-primary: #111827;\n--k-radius: 14px;';

  const html = view
    ? view.body.map(node => renderNode(node, ctx, {})).join('\n')
    : '<main></main>';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Kattour</title>
<style>
:root {
${cssVars}
}

body {
  margin: 0;
  padding: 0;
  background: #f8fafc;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}

.k-screen { min-height: 100vh; padding: 32px; }
.k-column { display: flex; flex-direction: column; gap: 16px; }
.k-row { display: flex; align-items: center; gap: 16px; }
.k-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: calc(var(--k-radius) * 1px);
  padding: 24px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

button {
  border: none;
  background: var(--k-primary);
  color: white;
  padding: 12px 18px;
  border-radius: calc(var(--k-radius) * 1px);
  cursor: pointer;
}

input {
  border: 1px solid #d1d5db;
  border-radius: calc(var(--k-radius) * 1px);
  padding: 12px 14px;
  font: inherit;
}
</style>
</head>
<body>
${html}
<script>
window.__KATTOUR_STATE__ = ${JSON.stringify(state)};
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
  const activeBody = Boolean(value) && value !== 'false' ? node.then : node.else;
  return activeBody.map(child => renderNode(child, ctx, scope)).join('');
}

function renderFor(node: ForNode, ctx: CompileContext, scope: RuntimeScope): string {
  const collection = evaluateExpression(node.collection, ctx.state, scope);
  const items = Array.isArray(collection)
    ? collection
    : String(collection ?? '').split(',').map(item => item.trim()).filter(Boolean);

  return items.map(item => {
    const nextScope = { ...scope, [node.item]: item };
    return node.body.map(child => renderNode(child, ctx, nextScope)).join('');
  }).join('');
}

function renderElement(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const component = ctx.components.get(element.name);

  if (component) {
    const nextScope = { ...scope };
    component.params.forEach((param, index) => {
      if (index === 0 && element.label) nextScope[param] = evaluateExpression(element.label, ctx.state, scope);
    });
    return component.body.map(child => renderNode(child, ctx, nextScope)).join('');
  }

  const tag = HTML_TAGS[element.name] || 'div';
  const attrs: string[] = [];

  if (element.name === 'screen') attrs.push('class="k-screen"');
  if (element.name === 'column') attrs.push('class="k-column"');
  if (element.name === 'row') attrs.push('class="k-row"');
  if (element.name === 'card') attrs.push('class="k-card"');

  for (const event of element.events) {
    if (event.name === 'click') attrs.push(`data-k-click="${escapeHtml(event.action)}"`);
  }

  for (const binding of element.bindings) {
    attrs.push(`data-k-bind="${escapeHtml(binding.state)}"`);
    if (binding.property === 'value') attrs.push(`value="${escapeHtml(String(evaluateExpression(binding.state, ctx.state, scope) ?? ''))}"`);
  }

  for (const property of element.properties) {
    attrs.push(`${property.key}="${escapeHtml(property.value)}"`);
  }

  let content = '';

  if (element.label) {
    content += `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>`;
  }

  content += element.children.map(child => renderNode(child, ctx, scope)).join('');

  return `<${tag} ${attrs.join(' ')}>${content}</${tag}>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
