import { tokenize, Token } from './tokenizer';

export interface ProgramNode {
  type: 'Program';
  body: any[];
}

export function parse(source: string): ProgramNode {
  const tokens = tokenize(source);
  let current = 0;

  function peek(): Token {
    return tokens[current];
  }

  function consume(): Token {
    return tokens[current++];
  }

  const body: any[] = [];

  while (peek().type !== 'eof') {
    const token = peek();

    if (token.type === 'newline') {
      consume();
      continue;
    }

    if (token.value === 'page') {
      consume();
      const name = consume();
      body.push({
        type: 'PageDeclaration',
        name: name.value
      });
      continue;
    }

    if (token.value === 'state') {
      consume();
      const key = consume();
      consume();
      const value = consume();

      body.push({
        type: 'StateDeclaration',
        key: key.value,
        value: value.value
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
