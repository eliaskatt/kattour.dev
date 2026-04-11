export type TokenType = 'keyword' | 'identifier' | 'string' | 'brace' | 'unknown';

export type Token = {
  type: TokenType;
  value: string;
  position: number;
};

export type Diagnostic = {
  message: string;
  position?: number;
};

export type KattourNode = ScreenNode | ElementNode;

export type ScreenNode = {
  kind: 'Screen';
  name: string;
  children: ElementNode[];
};

export type ElementNode = {
  kind: 'Element';
  name: string;
  value?: string;
  children: ElementNode[];
};

export type KattourDocument = {
  kind: 'Document';
  body: KattourNode[];
};
