import { parse } from './parser';
import { ComponentNode, ElementNode, ProgramNode, PropertyNode } from './ast';

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
}

export function compile(source: string): string {
  const ast = parse(source);
  const states = ast.body.filter(node => node.type === 'State');
  const theme = ast.body.find(node => node.type === 'Theme');
  const view = ast.body.find(node => node.type === 'View');
  const components = new Map<string, ComponentNode>();

  for (const node of ast.body) {
    if (node.type === 'Component') {
      components.set(node.name, node);
    }
  }

  const ctx: CompileContext = { ast, components };
  const cssVars = theme && theme.type === 'Theme'
    ? theme.tokens.map((token: PropertyNode) => `--k-${token.key}: ${token.value};`).join('\n')
    : '--k-primary: #111827;\n--k-radius: 14px;';

  const html = view
    ? view.body.map(element => renderElement(element, ctx, {})).join('\n')
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

.k-screen {
  min-height: 100vh;
  padding: 32px;
}

.k-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.k-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

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
</style>
</head>
<body>
${html}
<script>
const state = ${JSON.stringify(Object.fromEntries(states.map(s => [s.name, s.value])))};

function updateBindings() {
  document.querySelectorAll('[data-k-text]').forEach((node) => {
    const template = node.dataset.kText;

    node.textContent = template.replace(/\\$([a-zA-Z0-9_]+)/g, (_, key) => {
      return state[key] ?? '';
    });
  });
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-k-click]');
  const action = target && target.dataset.kClick;

  if (!action) return;

  if (action.endsWith('++')) {
    const key = action.replace('++', '').trim();
    state[key] = Number(state[key] || 0) + 1;
  }

  if (action.endsWith('--')) {
    const key = action.replace('--', '').trim();
    state[key] = Number(state[key] || 0) - 1;
  }

  updateBindings();
});

updateBindings();
</script>
</body>
</html>`;
}

function renderElement(element: ElementNode, ctx: CompileContext, scope: Record<string, string>): string {
  const component = ctx.components.get(element.name);

  if (component) {
    const nextScope = { ...scope };

    component.params.forEach((param, index) => {
      if (index === 0 && element.label) {
        nextScope[param] = element.label;
      }
    });

    return component.body.map(child => renderElement(child, ctx, nextScope)).join('');
  }

  const tag = HTML_TAGS[element.name] || 'div';
  const attrs: string[] = [];

  if (element.name === 'screen') attrs.push('class="k-screen"');
  if (element.name === 'column') attrs.push('class="k-column"');
  if (element.name === 'row') attrs.push('class="k-row"');
  if (element.name === 'card') attrs.push('class="k-card"');

  for (const event of element.events) {
    if (event.name === 'click') {
      attrs.push(`data-k-click="${event.action}"`);
    }
  }

  for (const property of element.properties) {
    attrs.push(`${property.key}="${property.value}"`);
  }

  let content = '';

  if (element.label) {
    content += `<span data-k-text="${resolveTemplate(element.label, scope)}">${resolveTemplate(element.label, scope)}</span>`;
  }

  content += element.children.map(child => renderElement(child, ctx, scope)).join('');

  return `<${tag} ${attrs.join(' ')}>${content}</${tag}>`;
}

function resolveTemplate(value: string, scope: Record<string, string>): string {
  return value.replace(/\$([a-zA-Z0-9_]+)/g, (match, key) => {
    return scope[key] ?? match;
  });
}
