import { ProgramNode, ElementNode } from './ast';
import { tokenize, Token } from './tokenizer';

export function parse(source: string): ProgramNode {
  const tokens = tokenize(source);
  let current = 0;

  function peek(offset = 0): Token {
    return tokens[current + offset];
  }

  function consume(): Token {
    return tokens[current++];
  }

  function match(value: string): boolean {
    return peek().value === value;
  }

  function skipNewlines() {
    while (peek().type === 'newline') consume();
  }

  function parseElement(): ElementNode {
    const name = consume().value;

    let label: string | undefined;

    if (peek().type === 'string') {
      label = consume().value;
    }

    const element: ElementNode = {
      type: 'Element',
      name,
      label,
      properties: [],
      events: [],
      children: []
    };

    skipNewlines();

    if (match('{')) {
      consume();

      while (!match('}') && peek().type !== 'eof') {
        skipNewlines();

        if (peek().value === 'click') {
          consume();
          const action = consume().value;

          element.events.push({
            name: 'click',
            action
          });

          skipNewlines();
          continue;
        }

        if (peek().type === 'identifier' && peek(1).type !== 'brace_open') {
          const key = consume().value;
          const value = consume().value;

          element.properties.push({
            key,
            value
          });

          skipNewlines();
          continue;
        }

        if (peek().type === 'identifier') {
          element.children.push(parseElement());
          skipNewlines();
          continue;
        }

        consume();
      }

      consume();
    }

    return element;
  }

  const body: any[] = [];

  while (peek().type !== 'eof') {
    skipNewlines();

    if (match('page')) {
      consume();

      body.push({
        type: 'Page',
        name: consume().value
      });

      continue;
    }

    if (match('theme')) {
      consume();
      consume();

      const tokens = [];

      while (!match('}') && peek().type !== 'eof') {
        skipNewlines();

        if (peek().type === 'identifier') {
          const key = consume().value;
          const value = consume().value;

          tokens.push({ key, value });
          continue;
        }

        consume();
      }

      consume();

      body.push({
        type: 'Theme',
        tokens
      });

      continue;
    }

    if (match('state')) {
      consume();
      const name = consume().value;
      consume();
      const value = consume().value;

      body.push({
        type: 'State',
        name,
        value
      });

      continue;
    }

    if (match('component')) {
      consume();

      const name = consume().value;
      const params: string[] = [];

      if (peek().type === 'paren_open') {
        consume();

        while (peek().type !== 'paren_close') {
          if (peek().type === 'identifier') {
            params.push(consume().value);
            continue;
          }

          consume();
        }

        consume();
      }

      consume();

      const children: ElementNode[] = [];

      while (!match('}') && peek().type !== 'eof') {
        skipNewlines();

        if (peek().type === 'identifier') {
          children.push(parseElement());
          continue;
        }

        consume();
      }

      consume();

      body.push({
        type: 'Component',
        name,
        params,
        body: children
      });

      continue;
    }

    if (match('view')) {
      consume();
      consume();

      const children: ElementNode[] = [];

      while (!match('}') && peek().type !== 'eof') {
        skipNewlines();

        if (peek().type === 'identifier') {
          children.push(parseElement());
          continue;
        }

        consume();
      }

      consume();

      body.push({
        type: 'View',
        body: children
      });

      continue;
    }

    consume();
  }

  return {
    type: 'Program',
    body
  };
}
