export interface SourceLocation {
  line: number;
  column: number;
}

export interface SourceRange {
  start: SourceLocation;
  end?: SourceLocation;
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location?: SourceLocation;
  hint?: string;
}

export interface ProgramNode {
  type: 'Program';
  body: StatementNode[];
  diagnostics: Diagnostic[];
}

export type KattourPrimitive = string | number | boolean | null;
export type KattourValue = KattourPrimitive | KattourArray | KattourObject;
export interface KattourArray extends Array<KattourValue> {}
export interface KattourObject { [key: string]: KattourValue; }

export type StatementNode =
  | PageNode
  | ImportNode
  | MetaNode
  | StateNode
  | ComputedNode
  | ResourceNode
  | EffectNode
  | ThemeNode
  | RouteNode
  | ComponentNode
  | ModuleNode
  | ViewNode
  | UINode;

export type UINode = ElementNode | IfNode | ForNode | SlotNode | ComponentCallNode;

export interface BaseNode { loc?: SourceLocation; }
export interface PageNode extends BaseNode { type: 'Page'; name: string; }
export interface ImportNode extends BaseNode { type: 'Import'; source: string; names: string[]; }
export interface MetaNode extends BaseNode { type: 'Meta'; properties: PropertyNode[]; }
export interface StateNode extends BaseNode { type: 'State'; name: string; value: KattourValue; }
export interface ComputedNode extends BaseNode { type: 'Computed'; name: string; expression: string; }

export interface ResourceNode extends BaseNode {
  type: 'Resource';
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: KattourValue;
}

export interface EffectNode extends BaseNode {
  type: 'Effect';
  name?: string;
  trigger: 'onMount' | 'onChange' | 'manual';
  dependencies: string[];
  body: EffectActionNode[];
}

export interface EffectActionNode extends BaseNode { name: string; value: string; }
export interface ThemeNode extends BaseNode { type: 'Theme'; tokens: PropertyNode[]; }

export interface RouteNode extends BaseNode {
  type: 'Route';
  path: string;
  body: UINode[];
}

export interface ComponentNode extends BaseNode {
  type: 'Component';
  name: string;
  params: ParamNode[];
  body: UINode[];
}

export interface ModuleNode extends BaseNode {
  type: 'Module';
  name: string;
  params: ParamNode[];
  body: UINode[];
}

export interface ParamNode { name: string; defaultValue?: KattourValue; required: boolean; }
export interface ViewNode extends BaseNode { type: 'View'; body: UINode[]; }

export interface ElementNode extends BaseNode {
  type: 'Element';
  name: string;
  label?: string;
  properties: PropertyNode[];
  events: EventNode[];
  bindings: BindingNode[];
  children: UINode[];
}

export interface ComponentCallNode extends BaseNode {
  type: 'ComponentCall';
  name: string;
  args: KattourValue[];
  properties: PropertyNode[];
  children: UINode[];
}

export interface SlotNode extends BaseNode { type: 'Slot'; name: string; fallback: UINode[]; }
export interface IfNode extends BaseNode { type: 'If'; condition: string; then: UINode[]; else: UINode[]; }
export interface ForNode extends BaseNode { type: 'For'; item: string; index?: string; collection: string; body: UINode[]; }
export interface PropertyNode extends BaseNode { key: string; value: KattourValue | string; dynamic?: boolean; }
export interface EventNode extends BaseNode { name: string; action: string; }
export interface BindingNode extends BaseNode { property: string; state: string; }

export interface CompileResult {
  html: string;
  ast: ProgramNode;
  diagnostics: Diagnostic[];
  ok: boolean;
}
