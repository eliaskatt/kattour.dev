import type { ElementNode, KattourDocument, ScreenNode } from '../types';

function renderElement(node: ElementNode): string {
  switch (node.name) {
    case 'column':
      return `<div data-kattour="column">${node.children.map(renderElement).join('')}</div>`;
    case 'row':
      return `<div data-kattour="row">${node.children.map(renderElement).join('')}</div>`;
    case 'text':
      return `<p data-kattour="text">${node.value ?? ''}</p>`;
    case 'button':
      return `<button data-kattour="button">${node.value ?? 'Button'}</button>`;
    case 'input':
      return `<input data-kattour="input" placeholder="${node.value ?? ''}" />`;
    case 'card':
      return `<section data-kattour="card">${node.children.map(renderElement).join('')}</section>`;
    default:
      return `<div data-kattour="${node.name}">${node.children.map(renderElement).join('')}${node.value ?? ''}</div>`;
  }
}

function renderScreen(node: ScreenNode): string {
  return `<main data-kattour-screen="${node.name}">${node.children.map(renderElement).join('')}</main>`;
}

export function renderHtml(document: KattourDocument): string {
  return document.body.map((node) => {
    if (node.kind === 'Screen') {
      return renderScreen(node);
    }
    return '';
  }).join('');
}
