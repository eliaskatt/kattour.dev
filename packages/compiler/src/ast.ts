export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
}

export type KattourValue = string | number | boolean | KattourValue[] | Record<string, KattourValue>;

export type StatementNode =
  | PageNode
  | StateNode
  | ComputedNode
  | ThemeNode
  | ComponentNode
  | ViewNode
  | UINode;

export type UINode = ElementNode | IfNode | ForNode;

export interface PageNode {
  type: 'Page';
  name: string;
}

export interface StateNode {
  type: 'State';
  name: string;
  value: KattourValue;
}

export interface ComputedNode {
  type: 'Computed';
  name: string;
  expression: string;
}

export interface ThemeNode {
  type: 'Theme';
  tokens: PropertyNode[];
}

export interface ComponentNode {
  type: 'Component';
  name: string;
  params: string[];
  body: UINode[];
}

export interface ViewNode {
  type: 'View';
  body: UINode[];
}

export interface ElementNode {
  type: 'Element';
  name: string;
  label?: string;
  properties: PropertyNode[];
  events: EventNode[];
  bindings: BindingNode[];
  children: UINode[];
}

export interface IfNode {
  type: 'If';
  condition: string;
  then: UINode[];
  else: UINode[];
}

export interface ForNode {
  type: 'For';
  item: string;
  collection: string;
  body: UINode[];
}

export interface PropertyNode {
  key: string;
  value: string;
}

export interface EventNode {
  name: string;
  action: string;
}

export interface BindingNode {
  property: string;
  state: string;
}
