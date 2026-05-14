export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
}

export type StatementNode =
  | PageNode
  | StateNode
  | ViewNode
  | ElementNode;

export interface PageNode {
  type: 'Page';
  name: string;
}

export interface StateNode {
  type: 'State';
  name: string;
  value: string | number;
}

export interface ViewNode {
  type: 'View';
  body: ElementNode[];
}

export interface ElementNode {
  type: 'Element';
  name: string;
  label?: string;
  properties: PropertyNode[];
  children: ElementNode[];
}

export interface PropertyNode {
  key: string;
  value: string;
}
