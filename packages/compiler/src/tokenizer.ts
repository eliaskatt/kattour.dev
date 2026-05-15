import { Diagnostic } from './ast';

export type TokenType =
  | 'identifier'
  | 'string'
  | 'number'
  | 'brace_open'
  | 'brace_close'
  | 'paren_open'
  | 'paren_close'
  | 'bracket_open'
  | 'bracket_close'
  | 'comma'
  | 'colon'
  | 'dot'
  | 'equals'
  | 'question'
  | 'newline'
  | 'operator'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface TokenizeResult {
  tokens: Token[];
  diagnostics: Diagnostic[];
}

export function tokenizeDetailed(source: string): TokenizeResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let current = 0;
  let line = 1;
  let column = 1;

  function push(type: TokenType, value: string, tokenLine = line, tokenColumn = column) {
    tokens.push({ type, value, line: tokenLine, column: tokenColumn });
  }

  function diagnostic(code: string, message: string, tokenLine = line, tokenColumn = column, hint?: string) {
    diagnostics.push({ severity: 'error', code, message, location: { line: tokenLine, column: tokenColumn }, hint });
  }

  function advance(): string {
    const char = source[current++] ?? '';
    if (char === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return char;
  }

  function readWhile(test: (char: string) => boolean): string {
    let value = '';
    while (current < source.length && test(source[current])) value += advance();
    return value;
  }

  while (current < source.length) {
    const char = source[current];

    if (char === ' ' || char === '\t' || char === '\r') {
      advance();
      continue;
    }

    if (char === '/' && source[current + 1] === '/') {
      while (current < source.length && source[current] !== '\n') advance();
      continue;
    }

    if (char === '/' && source[current + 1] === '*') {
      const startLine = line;
      const startColumn = column;
      advance(); advance();
      while (current < source.length && !(source[current] === '*' && source[current + 1] === '/')) advance();
      if (current >= source.length) {
        diagnostic('UNTERMINATED_BLOCK_COMMENT', 'Unterminated block comment.', startLine, startColumn);
        break;
      }
      advance(); advance();
      continue;
    }

    if (char === '\n') { push('newline', '\n'); advance(); continue; }
    if (char === '{') { push('brace_open', char); advance(); continue; }
    if (char === '}') { push('brace_close', char); advance(); continue; }
    if (char === '(') { push('paren_open', char); advance(); continue; }
    if (char === ')') { push('paren_close', char); advance(); continue; }
    if (char === '[') { push('bracket_open', char); advance(); continue; }
    if (char === ']') { push('bracket_close', char); advance(); continue; }
    if (char === ',') { push('comma', char); advance(); continue; }
    if (char === ':') { push('colon', char); advance(); continue; }
    if (char === '.') { push('dot', char); advance(); continue; }
    if (char === '?') { push('question', char); advance(); continue; }
    if (char === '=') { push('equals', char); advance(); continue; }

    if (char === '"' || char === "'") {
      const quote = char;
      const startLine = line;
      const startColumn = column;
      let value = '';
      advance();
      while (current < source.length && source[current] !== quote) {
        const next = advance();
        if (next === '\\') {
          const escaped = advance();
          const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', '"': '"', "'": "'", '\\': '\\' };
          value += map[escaped] ?? escaped;
        } else {
          value += next;
        }
      }
      if (source[current] !== quote) {
        diagnostic('UNTERMINATED_STRING', `Unterminated string starting at ${startLine}:${startColumn}.`, startLine, startColumn);
        break;
      }
      advance();
      push('string', value, startLine, startColumn);
      continue;
    }

    if (/\d/.test(char)) {
      const startLine = line;
      const startColumn = column;
      let value = readWhile(c => /\d/.test(c));
      if (source[current] === '.' && /\d/.test(source[current + 1] ?? '')) {
        value += advance();
        value += readWhile(c => /\d/.test(c));
      }
      push('number', value, startLine, startColumn);
      continue;
    }

    const two = source.slice(current, current + 2);
    if (['==', '!=', '>=', '<=', '&&', '||', '++', '--', '=>'].includes(two)) {
      push('operator', two);
      advance(); advance();
      continue;
    }

    if (/[+\-*/%<>!]/.test(char)) { push('operator', char); advance(); continue; }

    if (/[a-zA-Z_$]/.test(char)) {
      const startLine = line;
      const startColumn = column;
      const value = readWhile(c => /[a-zA-Z0-9_$.-]/.test(c));
      push('identifier', value, startLine, startColumn);
      continue;
    }

    diagnostic('UNEXPECTED_CHARACTER', `Unexpected character '${char}'.`, line, column, 'Remove it or wrap it in a string.');
    advance();
  }

  push('eof', '');
  return { tokens, diagnostics };
}

export function tokenize(source: string): Token[] {
  return tokenizeDetailed(source).tokens;
}
