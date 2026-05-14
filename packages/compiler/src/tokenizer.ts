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
  | 'newline'
  | 'operator'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  let line = 1;
  let column = 1;

  function push(type: TokenType, value: string, tokenLine = line, tokenColumn = column) {
    tokens.push({ type, value, line: tokenLine, column: tokenColumn });
  }

  function advance(): string {
    const char = source[current++];

    if (char === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }

    return char;
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

    if (char === '\n') {
      push('newline', '\n');
      advance();
      continue;
    }

    if (char === '{') {
      push('brace_open', char);
      advance();
      continue;
    }

    if (char === '}') {
      push('brace_close', char);
      advance();
      continue;
    }

    if (char === '(') {
      push('paren_open', char);
      advance();
      continue;
    }

    if (char === ')') {
      push('paren_close', char);
      advance();
      continue;
    }

    if (char === '[') {
      push('bracket_open', char);
      advance();
      continue;
    }

    if (char === ']') {
      push('bracket_close', char);
      advance();
      continue;
    }

    if (char === ',') {
      push('comma', char);
      advance();
      continue;
    }

    if (char === ':') {
      push('colon', char);
      advance();
      continue;
    }

    if (char === '"') {
      const startLine = line;
      const startColumn = column;
      let value = '';
      advance();

      while (source[current] !== '"' && current < source.length) {
        value += advance();
      }

      if (source[current] !== '"') {
        throw new Error(`Unterminated string at ${startLine}:${startColumn}`);
      }

      advance();
      push('string', value, startLine, startColumn);
      continue;
    }

    if (/\d/.test(char)) {
      const startLine = line;
      const startColumn = column;
      let value = '';

      while (/\d/.test(source[current]) || source[current] === '.') {
        value += advance();
      }

      push('number', value, startLine, startColumn);
      continue;
    }

    if (/[=+\-*/]/.test(char)) {
      push('operator', char);
      advance();
      continue;
    }

    if (/[a-zA-Z_$]/.test(char)) {
      const startLine = line;
      const startColumn = column;
      let value = '';

      while (/[a-zA-Z0-9_$.]/.test(source[current])) {
        value += advance();
      }

      push('identifier', value, startLine, startColumn);
      continue;
    }

    throw new Error(`Unexpected character '${char}' at ${line}:${column}`);
  }

  push('eof', '');
  return tokens;
}
