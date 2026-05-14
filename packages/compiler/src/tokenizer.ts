export type TokenType =
  | 'identifier'
  | 'string'
  | 'number'
  | 'brace_open'
  | 'brace_close'
  | 'paren_open'
  | 'paren_close'
  | 'newline'
  | 'operator'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  while (current < source.length) {
    const char = source[current];

    if (char === ' ' || char === '\t' || char === '\r') {
      current++;
      continue;
    }

    if (char === '\n') {
      tokens.push({ type: 'newline', value: '\n' });
      current++;
      continue;
    }

    if (char === '{') {
      tokens.push({ type: 'brace_open', value: char });
      current++;
      continue;
    }

    if (char === '}') {
      tokens.push({ type: 'brace_close', value: char });
      current++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'paren_open', value: char });
      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'paren_close', value: char });
      current++;
      continue;
    }

    if (char === '"') {
      let value = '';
      current++;

      while (source[current] !== '"' && current < source.length) {
        value += source[current];
        current++;
      }

      current++;
      tokens.push({ type: 'string', value });
      continue;
    }

    if (/\d/.test(char)) {
      let value = '';

      while (/\d/.test(source[current])) {
        value += source[current];
        current++;
      }

      tokens.push({ type: 'number', value });
      continue;
    }

    if (/[=+\-*/]/.test(char)) {
      tokens.push({ type: 'operator', value: char });
      current++;
      continue;
    }

    if (/[a-zA-Z_$]/.test(char)) {
      let value = '';

      while (/[a-zA-Z0-9_$.]/.test(source[current])) {
        value += source[current];
        current++;
      }

      tokens.push({ type: 'identifier', value });
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  tokens.push({ type: 'eof', value: '' });
  return tokens;
}
