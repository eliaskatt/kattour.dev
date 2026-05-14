import { parse } from './parser';

export function compile(source: string): string {
  const ast = parse(source);

  let html = '';

  for (const node of ast.body) {
    if (node.type === 'PageDeclaration') {
      html += `<main data-page="${node.name}"></main>`;
    }

    if (node.type === 'StateDeclaration') {
      html += `<!-- state:${node.key}=${node.value} -->`;
    }
  }

  return html;
}
