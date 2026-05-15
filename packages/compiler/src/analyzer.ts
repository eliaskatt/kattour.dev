import {
  ComponentNode,
  Diagnostic,
  ElementNode,
  ModuleNode,
  ProgramNode,
  RouteNode,
  StatementNode,
  UINode
} from './ast';
import { isBuiltinModule } from './builtins';

export interface AnalysisResult {
  diagnostics: Diagnostic[];
  components: Map<string, ComponentNode>;
  modules: Map<string, ModuleNode>;
  routes: RouteNode[];
  stateNames: Set<string>;
}

const BUILTIN_ELEMENTS = new Set([
  'screen', 'section', 'container', 'column', 'row', 'grid', 'stack', 'card', 'panel',
  'text', 'title', 'subtitle', 'caption', 'button', 'input', 'textarea', 'select', 'option',
  'image', 'avatar', 'badge', 'link', 'list', 'item', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'form', 'label', 'divider', 'spacer', 'nav', 'footer', 'header', 'main', 'aside', 'article'
]);

const UNSAFE_EVENT_WORDS = ['eval', 'Function', 'document.cookie', 'localStorage.clear', 'innerHTML'];

export function analyze(ast: ProgramNode): AnalysisResult {
  const diagnostics: Diagnostic[] = [...ast.diagnostics];
  const components = new Map<string, ComponentNode>();
  const modules = new Map<string, ModuleNode>();
  const routes: RouteNode[] = [];
  const stateNames = new Set<string>();
  const computedNames = new Set<string>();

  function diag(code: string, message: string, node?: { loc?: { line: number; column: number } }, hint?: string, severity: Diagnostic['severity'] = 'error') {
    diagnostics.push({ code, message, location: node?.loc, hint, severity });
  }

  for (const node of ast.body) {
    if (node.type === 'State') {
      if (stateNames.has(node.name)) diag('DUPLICATE_STATE', `Duplicate state '${node.name}'.`, node, 'Use one state declaration per name.');
      stateNames.add(node.name);
    }
    if (node.type === 'Computed') {
      if (computedNames.has(node.name)) diag('DUPLICATE_COMPUTED', `Duplicate computed '${node.name}'.`, node);
      computedNames.add(node.name);
    }
    if (node.type === 'Component') {
      if (components.has(node.name)) diag('DUPLICATE_COMPONENT', `Duplicate component '${node.name}'.`, node);
      if (isBuiltinModule(node.name)) diag('BUILTIN_NAME_SHADOWED', `Component '${node.name}' shadows a built-in module.`, node, 'Use another name or intentionally override it.', 'warning');
      components.set(node.name, node);
    }
    if (node.type === 'Module') {
      if (modules.has(node.name)) diag('DUPLICATE_MODULE', `Duplicate module '${node.name}'.`, node);
      if (isBuiltinModule(node.name)) diag('BUILTIN_NAME_SHADOWED', `Module '${node.name}' shadows a built-in module.`, node, 'Use another name or intentionally override it.', 'warning');
      modules.set(node.name, node);
    }
    if (node.type === 'Route') routes.push(node);
  }

  const routePaths = new Set<string>();
  for (const route of routes) {
    if (routePaths.has(route.path)) diag('DUPLICATE_ROUTE', `Duplicate route '${route.path}'.`, route);
    routePaths.add(route.path);
    if (!route.path.startsWith('/')) diag('INVALID_ROUTE', `Route '${route.path}' must start with '/'.`, route);
  }

  for (const node of ast.body) walkStatement(node);

  function walkStatement(node: StatementNode) {
    if (node.type === 'Route' || node.type === 'View' || node.type === 'Component' || node.type === 'Module') {
      for (const child of node.body) walkUI(child);
    }
    if (node.type === 'Effect') {
      for (const action of node.body) {
        if (!['log', 'warn', 'error', 'go', 'fetch', 'set'].includes(action.name)) {
          diag('UNKNOWN_EFFECT_ACTION', `Unknown effect action '${action.name}'.`, action, 'Allowed actions: log, warn, error, go, fetch, set.', 'warning');
        }
      }
    }
    if (node.type === 'Resource') {
      if (!/^https?:\/\//.test(node.url) && !node.url.startsWith('/')) diag('INVALID_RESOURCE_URL', `Resource '${node.name}' has invalid URL '${node.url}'.`, node);
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(node.method)) diag('INVALID_RESOURCE_METHOD', `Invalid method '${node.method}'.`, node);
    }
  }

  function walkUI(node: UINode) {
    if (node.type === 'If') { node.then.forEach(walkUI); node.else.forEach(walkUI); return; }
    if (node.type === 'For') { node.body.forEach(walkUI); return; }
    if (node.type === 'Slot') { node.fallback.forEach(walkUI); return; }
    if (node.type === 'ComponentCall') { node.children.forEach(walkUI); return; }
    walkElement(node);
  }

  function walkElement(node: ElementNode) {
    if (!BUILTIN_ELEMENTS.has(node.name) && !components.has(node.name) && !modules.has(node.name) && !isBuiltinModule(node.name)) {
      diag('UNKNOWN_ELEMENT', `Unknown element/component/module '${node.name}'.`, node, 'Define it with component/module, use a built-in element, or use a built-in module name.', 'warning');
    }

    for (const event of node.events) {
      if (UNSAFE_EVENT_WORDS.some(word => event.action.includes(word))) {
        diag('UNSAFE_EVENT_ACTION', `Unsafe event action in '${node.name}'.`, event, 'Kattour events are sandboxed; avoid raw browser APIs.');
      }
    }

    for (const prop of node.properties) {
      if ((prop.key === 'href' || prop.key === 'src' || prop.key === 'to') && typeof prop.value === 'string') {
        const value = prop.value.trim().toLowerCase();
        if (value.startsWith('javascript:') || value.startsWith('data:text/html')) {
          diag('UNSAFE_URL', `Unsafe URL '${prop.value}'.`, prop, 'Use http(s), /relative, #anchor, mailto or tel URLs.');
        }
      }
      if (/^on[a-z]/i.test(prop.key)) diag('UNSAFE_INLINE_EVENT', `Inline event property '${prop.key}' is not allowed.`, prop);
    }

    node.children.forEach(walkUI);
  }

  return { diagnostics, components, modules, routes, stateNames };
}
