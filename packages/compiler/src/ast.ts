export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
}

export type KattourPrimitive = string | number | boolean | null;
export type KattourValue = KattourPrimitive | KattourArray | KattourObject;
export interface KattourArray extends Array<KattourValue> {}
export interface KattourObject { [key: string]: KattourValue; }

export type StatementNode =
  | PageNode
  | StateNode
  | ComputedNode
  | ResourceNode
  | EffectNode
  | ThemeNode
  | RouteNode
  | ComponentNode
  | ViewNode
  | UINode;

export type UINode = ElementNode | IfNode | ForNode;

export interface PageNode { type: 'Page'; name: string; }
export interface StateNode { type: 'State'; name: string; value: KattourValue; }
export interface ComputedNode { type: 'Computed'; name: string; expression: string; }

export interface ResourceNode {
  type: 'Resource';
  name: string;
  url: string;
  method: string;
}

export interface EffectNode {
  type: 'Effect';
  dependencies: string[];
  body: EffectActionNode[];
}

export interface EffectActionNode { name: string; value: string; }
export interface ThemeNode { type: 'Theme'; tokens: PropertyNode[]; }

export interface RouteNode {
  type: 'Route';
  path: string;
  body: UINode[];
}

export interface ComponentNode {
  type: 'Component';
  name: string;
  params: string[];
  body: UINode[];
}

export interface ViewNode { type: 'View'; body: UINode[]; }

export interface ElementNode {
  type: 'Element';
  name: string;
  label?: string;
  properties: PropertyNode[];
  events: EventNode[];
  bindings: BindingNode[];
  children: UINode[];
}

export interface IfNode { type: 'If'; condition: string; then: UINode[]; else: UINode[]; }
export interface ForNode { type: 'For'; item: string; collection: string; body: UINode[]; }
export interface PropertyNode { key: string; value: string; }
export interface EventNode { name: string; action: string; }
export interface BindingNode { property: string; state: string; }
