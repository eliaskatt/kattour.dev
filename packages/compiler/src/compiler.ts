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

  const view = ast.body.find(node => node.type === 'View');

  if (!view) {
    return '<main></main>';
  }

  return view.body.map(renderElement).join('\n');
}

function renderElement(element: ElementNode): string {
  const tag = HTML_TAGS[element.name] || 'div';

  const attrs = element.properties
    .map(property => `${property.key}="${property.value}"`)
    .join(' ');

  const content = [
    element.label || '',
    ...element.children.map(renderElement)
  ].join('');

  return `<${tag} ${attrs}>${content}</${tag}>`;
}
