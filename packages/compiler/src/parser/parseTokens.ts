import type { Diagnostic, ElementNode, KattourDocument, ScreenNode, Token } from '../types';

export function parseTokens(tokens: Token[]): { ast: KattourDocument; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  let index = 0;

  function current(): Token | undefined {
    return tokens[index];
  }

  function consume(): Token | undefined {
    const token = tokens[index];
    index += 1;
    return token;
  }

  function expectValue(value: string): boolean {
    const token = current();
    if (!token || token.value !== value) {
      diagnostics.push({ message: `Expected ${value}`, position: token?.position });
      return false;
    }
    consume();
    return true;
  }

  function parseElement(): ElementNode | null {
    const name = consume();
    if (!name) {
      diagnostics.push({ message: 'Unexpected end of input while parsing element' });
      return null;
    }

    const node: ElementNode = {
      kind: 'Element',
      name: name.value,
      children: []
    };

    const next = current();
    if (next?.type === 'string') {
      node.value = next.value;
      consume();
      return node;
    }

    if (next?.value === '{') {
      consume();
      while (current() && current()?.value !== '}') {
        const child = parseElement();
        if (child) {
          node.children.push(child);
        } else {
          break;
        }
      }
      expectValue('}');
    }

    return node;
  }

  function parseScreen(): ScreenNode | null {
    expectValue('screen');
    const name = consume();

    if (!name) {
      diagnostics.push({ message: 'Screen name is missing' });
      return null;
    }

    const screen: ScreenNode = {
      kind: 'Screen',
      name: name.value,
      children: []
    };

    if (!expectValue('{')) {
      return screen;
    }

    while (current() && current()?.value !== '}') {
      const child = parseElement();
      if (child) {
        screen.children.push(child);
      } else {
        break;
      }
    }

    expectValue('}');
    return screen;
  }

  const body: ScreenNode[] = [];

  while (current()) {
    if (current()?.value === 'screen') {
      const screen = parseScreen();
      if (screen) {
        body.push(screen);
      }
      continue;
    }

    diagnostics.push({
      message: `Unexpected token ${current()?.value}`,
      position: current()?.position
    });
    consume();
  }

  return {
    ast: {
      kind: 'Document',
      body
    },
    diagnostics
  };
}
