export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
}

export type StatementNode =
  | PageNode
  | StateNode
  | ThemeNode
  | ComponentNode
  | ViewNode
  | ElementNode;

export interface PageNode {
  type: 'Page';
  name: string;
}

export interface StateNode {
  type: 'State';
  name: string;
  value: string | number | boolean;
}

export interface ThemeNode {
  type: 'Theme';
  tokens: PropertyNode[];
}

export interface ComponentNode {
  type: 'Component';
  name: string;
  params: string[];
  body: ElementNode[];
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
  events: EventNode[];
  children: ElementNode[];
}

export interface PropertyNode {
  key: string;
  value: string;
}

export interface EventNode {
  name: string;
  action: string;
}
