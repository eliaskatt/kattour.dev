import { KattourValue, ProgramNode, UINode, ElementNode } from './ast';
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

  function expect(value: string) {
    if (!match(value)) {
      const token = peek();
      throw new Error(`Expected '${value}' at ${token.line}:${token.column}, got '${token.value}'`);
    }
    consume();
  }

  function skipNewlines() {
    while (peek().type === 'newline' || peek().type === 'comma') consume();
  }

  function parseValue(): KattourValue {
    skipNewlines();
    if (peek().type === 'bracket_open') return parseArrayValue();
    if (peek().type === 'brace_open') return parseObjectValue();
    const token = consume();
    if (token.type === 'number') return Number(token.value);
    if (token.value === 'true') return true;
    if (token.value === 'false') return false;
    return token.value;
  }

  function parseExpressionUntilLine(): string {
    const parts: string[] = [];
    while (peek().type !== 'newline' && peek().type !== 'eof' && peek().type !== 'brace_close') {
      parts.push(consume().value);
    }
    return parts.join(' ').trim();
  }

  function parseArrayValue(): KattourValue[] {
    expect('[');
    const values: KattourValue[] = [];
    while (!match(']') && peek().type !== 'eof') {
      skipNewlines();
      if (match(']')) break;
      values.push(parseValue());
      skipNewlines();
    }
    expect(']');
    return values;
  }

  function parseObjectValue(): Record<string, KattourValue> {
    expect('{');
    const object: Record<string, KattourValue> = {};
    while (!match('}') && peek().type !== 'eof') {
      skipNewlines();
      if (match('}')) break;
      const key = consume().value;
      if (match(':')) consume();
      object[key] = parseValue();
      skipNewlines();
    }
    expect('}');
    return object;
  }

  function parseBlock(): UINode[] {
    expect('{');
    const nodes: UINode[] = [];
    while (!match('}') && peek().type !== 'eof') {
      skipNewlines();
      if (match('}')) break;
      if (peek().type === 'identifier') {
        nodes.push(parseUINode());
        continue;
      }
      consume();
    }
    expect('}');
    return nodes;
  }

  function parseUINode(): UINode {
    if (match('if')) return parseIf();
    if (match('for')) return parseFor();
    return parseElement();
  }

  function parseIf(): UINode {
    consume();
    const condition = consume().value;
    const thenBody = parseBlock();
    let elseBody: UINode[] = [];
    skipNewlines();
    if (match('else')) {
      consume();
      elseBody = parseBlock();
    }
    return { type: 'If', condition, then: thenBody, else: elseBody };
  }

  function parseFor(): UINode {
    consume();
    const item = consume().value;
    expect('in');
    const collection = consume().value;
    const body = parseBlock();
    return { type: 'For', item, collection, body };
  }

  function parseElement(): ElementNode {
    const name = consume().value;
    let label: string | undefined;

    if (peek().type === 'string' || peek().type === 'identifier') {
      if (peek(1).type === 'brace_open' || peek(1).type === 'newline' || peek(1).type === 'brace_close') {
        label = consume().value;
      }
    }

    const element: ElementNode = {
      type: 'Element',
      name,
      label,
      properties: [],
      events: [],
      bindings: [],
      children: []
    };

    skipNewlines();

    if (match('{')) {
      consume();
      while (!match('}') && peek().type !== 'eof') {
        skipNewlines();
        if (match('}')) break;

        if (peek().value === 'click') {
          consume();
          const action = parseExpressionUntilLine();
          element.events.push({ name: 'click', action });
          skipNewlines();
          continue;
        }

        if (peek().value === 'bind') {
          consume();
          const state = consume().value.replace(/^\$/, '');
          element.bindings.push({ property: 'value', state });
          skipNewlines();
          continue;
        }

        if (peek().type === 'identifier' && peek(1).type !== 'brace_open') {
          const key = consume().value;
          const value = consume().value;
          element.properties.push({ key, value });
          skipNewlines();
          continue;
        }

        if (peek().type === 'identifier') {
          element.children.push(parseUINode());
          skipNewlines();
          continue;
        }
        consume();
      }
      expect('}');
    }
    return element;
  }

  const body: any[] = [];

  while (peek().type !== 'eof') {
    skipNewlines();
    if (peek().type === 'eof') break;

    if (match('page')) {
      consume();
      body.push({ type: 'Page', name: consume().value });
      continue;
    }

    if (match('theme')) {
      consume();
      expect('{');
      const themeTokens = [];
      while (!match('}') && peek().type !== 'eof') {
        skipNewlines();
        if (peek().type === 'identifier') {
          const key = consume().value;
          const value = String(parseValue());
          themeTokens.push({ key, value });
          continue;
        }
        consume();
      }
      expect('}');
      body.push({ type: 'Theme', tokens: themeTokens });
      continue;
    }

    if (match('state')) {
      consume();
      const name = consume().value;
      expect('=');
      const value = parseValue();
      body.push({ type: 'State', name, value });
      continue;
    }

    if (match('computed')) {
      consume();
      const name = consume().value;
      expect('=');
      const expression = parseExpressionUntilLine();
      body.push({ type: 'Computed', name, expression });
      continue;
    }

    if (match('component')) {
      consume();
      const name = consume().value;
      const params: string[] = [];
      if (peek().type === 'paren_open') {
        consume();
        while (peek().type !== 'paren_close' && peek().type !== 'eof') {
          if (peek().type === 'identifier') {
            params.push(consume().value);
            continue;
          }
          consume();
        }
        expect(')');
      }
      const children = parseBlock();
      body.push({ type: 'Component', name, params, body: children });
      continue;
    }

    if (match('view')) {
      consume();
      body.push({ type: 'View', body: parseBlock() });
      continue;
    }

    consume();
  }
  return { type: 'Program', body };
}
