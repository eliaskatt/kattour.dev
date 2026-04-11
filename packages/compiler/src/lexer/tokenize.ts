import type { Token } from '../types';

const KEYWORDS = new Set(['screen', 'column', 'row', 'text', 'button', 'input', 'card']);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const char = source[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    if (char === '{' || char === '}') {
      tokens.push({ type: 'brace', value: char, position: i });
      i += 1;
      continue;
    }

    if (char === '"') {
      let j = i + 1;
      let value = '';

      while (j < source.length && source[j] !== '"') {
        value += source[j];
        j += 1;
      }

      tokens.push({ type: 'string', value, position: i });
      i = j + 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let j = i;
      let value = '';

      while (j < source.length && /[A-Za-z0-9_]/.test(source[j])) {
        value += source[j];
        j += 1;
      }

      tokens.push({
        type: KEYWORDS.has(value) ? 'keyword' : 'identifier',
        value,
        position: i
      });

      i = j;
      continue;
    }

    tokens.push({ type: 'unknown', value: char, position: i });
    i += 1;
  }

  return tokens;
}
