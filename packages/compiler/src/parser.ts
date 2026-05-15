import {
  Diagnostic,
  EffectActionNode,
  ElementNode,
  KattourValue,
  ParamNode,
  ProgramNode,
  PropertyNode,
  StatementNode,
  UINode
} from './ast';
import { tokenizeDetailed, Token } from './tokenizer';

export interface ParseResult {
  ast: ProgramNode;
  diagnostics: Diagnostic[];
}

export function parseDetailed(source: string): ParseResult {
  const tokenized = tokenizeDetailed(source);
  const tokens = tokenized.tokens;
  const diagnostics: Diagnostic[] = [...tokenized.diagnostics];
  let current = 0;

  function peek(offset = 0): Token { return tokens[Math.min(current + offset, tokens.length - 1)]; }
  function consume(): Token { return tokens[current++] ?? tokens[tokens.length - 1]; }
  function atEnd(): boolean { return peek().type === 'eof'; }
  function match(value: string): boolean { return peek().value === value; }
  function is(type: Token['type']): boolean { return peek().type === type; }
  function loc(token = peek()) { return { line: token.line, column: token.column }; }
  function addDiagnostic(code: string, message: string, token = peek(), hint?: string, severity: Diagnostic['severity'] = 'error') {
    diagnostics.push({ severity, code, message, location: loc(token), hint });
  }
  function skipNewlines() { while (is('newline') || is('comma')) consume(); }
  function expect(value: string): Token {
    if (!match(value)) {
      addDiagnostic('EXPECTED_TOKEN', `Expected '${value}', got '${peek().value || peek().type}'.`, peek(), `Add '${value}' here.`);
      return peek();
    }
    return consume();
  }
  function expectIdentifier(context: string): Token {
    if (!is('identifier')) {
      addDiagnostic('EXPECTED_IDENTIFIER', `Expected identifier for ${context}.`, peek());
      return { ...peek(), type: 'identifier', value: 'Unknown' };
    }
    return consume();
  }

  function parseValue(): KattourValue {
    skipNewlines();
    if (is('bracket_open')) return parseArrayValue();
    if (is('brace_open')) return parseObjectValue();
    const token = consume();
    if (token.type === 'number') return Number(token.value);
    if (token.type === 'string') return token.value;
    if (token.value === 'true') return true;
    if (token.value === 'false') return false;
    if (token.value === 'null') return null;
    return token.value;
  }

  function parseArrayValue(): KattourValue[] {
    expect('[');
    const values: KattourValue[] = [];
    while (!match(']') && !atEnd()) {
      skipNewlines();
      if (match(']')) break;
      values.push(parseValue());
      skipNewlines();
      if (match(',')) consume();
    }
    expect(']');
    return values;
  }

  function parseObjectValue(): Record<string, KattourValue> {
    expect('{');
    const object: Record<string, KattourValue> = {};
    while (!match('}') && !atEnd()) {
      skipNewlines();
      if (match('}')) break;
      const keyToken = expectIdentifier('object key');
      if (match(':')) consume();
      else addDiagnostic('EXPECTED_COLON', `Expected ':' after object key '${keyToken.value}'.`, peek());
      object[keyToken.value] = parseValue();
      skipNewlines();
      if (match(',')) consume();
    }
    expect('}');
    return object;
  }

  function parseExpressionUntilLine(): string {
    const parts: string[] = [];
    let depth = 0;
    while (!atEnd()) {
      const token = peek();
      if (token.type === 'paren_open' || token.type === 'bracket_open') depth++;
      if (token.type === 'paren_close' || token.type === 'bracket_close') depth--;
      if (depth <= 0 && (token.type === 'newline' || token.type === 'brace_close')) break;
      parts.push(consume().type === 'string' ? `"${token.value}"` : token.value);
    }
    return parts.join(' ').replace(/\s+([).,])/g, '$1').replace(/([($])\s+/g, '$1').trim();
  }

  function parseParams(): ParamNode[] {
    const params: ParamNode[] = [];
    if (!is('paren_open')) return params;
    consume();
    while (!is('paren_close') && !atEnd()) {
      skipNewlines();
      if (is('paren_close')) break;
      const name = expectIdentifier('parameter').value;
      let defaultValue: KattourValue | undefined;
      let required = true;
      if (match('?')) { consume(); required = false; }
      if (match(':')) { consume(); if (is('identifier')) consume(); }
      if (match('=')) { consume(); defaultValue = parseValue(); required = false; }
      params.push({ name, defaultValue, required });
      skipNewlines();
      if (match(',')) consume();
    }
    expect(')');
    return params;
  }

  function parseBlock(): UINode[] {
    expect('{');
    const nodes: UINode[] = [];
    while (!match('}') && !atEnd()) {
      skipNewlines();
      if (match('}')) break;
      if (is('identifier')) nodes.push(parseUINode());
      else consume();
    }
    expect('}');
    return nodes;
  }

  function parseUINode(): UINode {
    if (match('if')) return parseIf();
    if (match('for')) return parseFor();
    if (match('slot')) return parseSlot();
    return parseElement();
  }

  function parseIf(): UINode {
    const start = consume();
    const condition = parseExpressionUntilLine();
    const thenBody = parseBlock();
    let elseBody: UINode[] = [];
    skipNewlines();
    if (match('else')) { consume(); elseBody = parseBlock(); }
    return { type: 'If', condition, then: thenBody, else: elseBody, loc: loc(start) };
  }

  function parseFor(): UINode {
    const start = consume();
    const item = expectIdentifier('loop item').value;
    let index: string | undefined;
    if (match(',')) { consume(); index = expectIdentifier('loop index').value; }
    expect('in');
    const collection = parseExpressionUntilLine();
    const body = parseBlock();
    return { type: 'For', item, index, collection, body, loc: loc(start) };
  }

  function parseSlot(): UINode {
    const start = consume();
    const name = is('identifier') || is('string') ? consume().value : 'default';
    const fallback = match('{') ? parseBlock() : [];
    return { type: 'Slot', name, fallback, loc: loc(start) };
  }

  function parseElement(): ElementNode {
    const start = expectIdentifier('element name');
    const name = start.value;
    let label: string | undefined;
    if (is('string')) label = consume().value;
    else if (is('identifier') && (peek(1).type === 'brace_open' || peek(1).type === 'newline' || peek(1).type === 'brace_close')) label = consume().value;

    const element: ElementNode = { type: 'Element', name, label, properties: [], events: [], bindings: [], children: [], loc: loc(start) };
    skipNewlines();
    if (!match('{')) return element;

    consume();
    while (!match('}') && !atEnd()) {
      skipNewlines();
      if (match('}')) break;
      if (!is('identifier')) { consume(); continue; }

      const keyToken = consume();
      const key = keyToken.value;
      if (key === 'click' || key.startsWith('on')) {
        element.events.push({ name: key === 'click' ? 'click' : key.slice(2).toLowerCase(), action: parseExpressionUntilLine(), loc: loc(keyToken) });
        skipNewlines();
        continue;
      }
      if (key === 'bind') {
        const property = is('identifier') && !String(peek().value).startsWith('$') ? consume().value : 'value';
        const state = consume().value.replace(/^\$/, '');
        element.bindings.push({ property, state, loc: loc(keyToken) });
        skipNewlines();
        continue;
      }
      if (match(':')) {
        consume();
        element.properties.push({ key, value: parseValue(), loc: loc(keyToken) });
        skipNewlines();
        continue;
      }
      if (peek().type === 'brace_open') {
        current--;
        element.children.push(parseUINode());
        skipNewlines();
        continue;
      }
      if (peek().type === 'string' || peek().type === 'number' || peek().type === 'identifier' || peek().type === 'bracket_open' || peek().type === 'brace_open') {
        element.properties.push({ key, value: parseValue(), loc: loc(keyToken) });
        skipNewlines();
        continue;
      }
    }
    expect('}');
    return element;
  }

  function parseEffect() {
    const start = consume();
    let trigger: 'onMount' | 'onChange' | 'manual' = 'onChange';
    let name: string | undefined;
    const dependencies: string[] = [];
    if (is('identifier')) {
      const first = consume().value;
      if (first === 'onMount' || first === 'onChange' || first === 'manual') trigger = first;
      else { name = first; dependencies.push(first.replace(/^\$/, '')); }
    }
    while (is('identifier') && peek(1).type !== 'brace_open') dependencies.push(consume().value.replace(/^\$/, ''));
    expect('{');
    const actions: EffectActionNode[] = [];
    while (!match('}') && !atEnd()) {
      skipNewlines();
      if (match('}')) break;
      const action = expectIdentifier('effect action');
      actions.push({ name: action.value, value: parseExpressionUntilLine(), loc: loc(action) });
      skipNewlines();
    }
    expect('}');
    return { type: 'Effect' as const, name, trigger, dependencies, body: actions, loc: loc(start) };
  }

  function parseRoute() {
    const start = consume();
    const path = is('string') || is('identifier') ? consume().value : '/';
    return { type: 'Route' as const, path, body: parseBlock(), loc: loc(start) };
  }

  function parseKeyValueBlock(): PropertyNode[] {
    const props: PropertyNode[] = [];
    expect('{');
    while (!match('}') && !atEnd()) {
      skipNewlines();
      if (match('}')) break;
      const key = expectIdentifier('property').value;
      if (match(':')) consume();
      props.push({ key, value: parseValue() });
      skipNewlines();
    }
    expect('}');
    return props;
  }

  function parseResource() {
    const start = consume();
    const name = expectIdentifier('resource name').value;
    let url = '';
    let method = 'GET';
    const headers: Record<string, string> = {};
    let body: KattourValue | undefined;
    expect('{');
    while (!match('}') && !atEnd()) {
      skipNewlines();
      if (match('}')) break;
      const key = expectIdentifier('resource property').value;
      const value = parseValue();
      if (key === 'url') url = String(value);
      else if (key === 'method') method = String(value).toUpperCase();
      else if (key === 'headers' && value && typeof value === 'object' && !Array.isArray(value)) Object.assign(headers, value as Record<string, string>);
      else if (key === 'body') body = value;
      skipNewlines();
    }
    expect('}');
    return { type: 'Resource' as const, name, url, method, headers, body, loc: loc(start) };
  }

  function parseComponentLike(kind: 'Component' | 'Module') {
    const start = consume();
    const name = expectIdentifier(`${kind.toLowerCase()} name`).value;
    const params = parseParams();
    const body = parseBlock();
    return kind === 'Component'
      ? { type: 'Component' as const, name, params, body, loc: loc(start) }
      : { type: 'Module' as const, name, params, body, loc: loc(start) };
  }

  const body: StatementNode[] = [];
  while (!atEnd()) {
    skipNewlines();
    if (atEnd()) break;
    const token = peek();
    if (match('page')) { consume(); body.push({ type: 'Page', name: expectIdentifier('page name').value, loc: loc(token) }); continue; }
    if (match('import')) { consume(); const source = is('string') ? consume().value : expectIdentifier('import source').value; body.push({ type: 'Import', source, names: [], loc: loc(token) }); continue; }
    if (match('meta')) { consume(); body.push({ type: 'Meta', properties: parseKeyValueBlock(), loc: loc(token) }); continue; }
    if (match('theme')) { consume(); body.push({ type: 'Theme', tokens: parseKeyValueBlock(), loc: loc(token) }); continue; }
    if (match('state')) { consume(); const name = expectIdentifier('state name').value; expect('='); body.push({ type: 'State', name, value: parseValue(), loc: loc(token) }); continue; }
    if (match('computed')) { consume(); const name = expectIdentifier('computed name').value; expect('='); body.push({ type: 'Computed', name, expression: parseExpressionUntilLine(), loc: loc(token) }); continue; }
    if (match('resource')) { body.push(parseResource()); continue; }
    if (match('effect')) { body.push(parseEffect()); continue; }
    if (match('route')) { body.push(parseRoute()); continue; }
    if (match('component')) { body.push(parseComponentLike('Component')); continue; }
    if (match('module')) { body.push(parseComponentLike('Module')); continue; }
    if (match('view')) { consume(); body.push({ type: 'View', body: parseBlock(), loc: loc(token) }); continue; }
    addDiagnostic('UNKNOWN_TOP_LEVEL_STATEMENT', `Unknown top-level statement '${token.value}'.`, token, 'Use page, state, computed, route, component, module, view, theme, meta, resource or effect.', 'warning');
    consume();
  }

  const ast: ProgramNode = { type: 'Program', body, diagnostics };
  return { ast, diagnostics };
}

export function parse(source: string): ProgramNode {
  return parseDetailed(source).ast;
}
