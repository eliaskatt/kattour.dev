import { parse } from './parser';
import { ElementNode } from './ast';

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

export function compile(source: string): string {
  const ast = parse(source);

  const states = ast.body.filter(node => node.type === 'State');
  const view = ast.body.find(node => node.type === 'View');

  const html = view
    ? view.body.map(renderElement).join('\n')
    : '<main></main>';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Kattour</title>
<style>
body {
  margin: 0;
  padding: 0;
  background: #f8fafc;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
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

button {
  border: none;
  background: black;
  color: white;
  padding: 12px 18px;
  border-radius: 14px;
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
  const action = event.target.dataset.kClick;

  if (!action) return;

  if (action.endsWith('++')) {
    const key = action.replace('++', '').trim();
    state[key] = Number(state[key] || 0) + 1;
  }

  updateBindings();
});

updateBindings();
</script>
</body>
</html>`;
}

function renderElement(element: ElementNode): string {
  const tag = HTML_TAGS[element.name] || 'div';

  const attrs: string[] = [];

  if (element.name === 'column') {
    attrs.push('class="k-column"');
  }

  if (element.name === 'row') {
    attrs.push('class="k-row"');
  }

  for (const property of element.properties) {
    if (property.key === 'click') {
      attrs.push(`data-k-click="${property.value}"`);
      continue;
    }

    attrs.push(`${property.key}="${property.value}"`);
  }

  let content = '';

  if (element.label) {
    content += `<span data-k-text="${element.label}">${element.label}</span>`;
  }

  content += element.children.map(renderElement).join('');

  return `<${tag} ${attrs.join(' ')}>${content}</${tag}>`;
}
