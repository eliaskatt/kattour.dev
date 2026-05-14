export type RuntimeScope = Record<string, unknown>;

export function evaluateExpression(expression: string, state: RuntimeScope, scope: RuntimeScope = {}): unknown {
  const clean = expression.trim();

  if (clean === 'true') return true;
  if (clean === 'false') return false;

  if (/^-?\d+(\.\d+)?$/.test(clean)) {
    return Number(clean);
  }

  if (clean.startsWith('"') && clean.endsWith('"')) {
    return clean.slice(1, -1);
  }

  if (clean.includes('+')) {
    return clean
      .split('+')
      .map(part => evaluateExpression(part, state, scope))
      .reduce((total, value) => Number(total) + Number(value), 0);
  }

  if (clean.includes('-')) {
    const parts = clean.split('-').map(part => evaluateExpression(part, state, scope));
    return Number(parts[0]) - Number(parts[1]);
  }

  return getPath(clean, scope) ?? getPath(clean, state) ?? clean;
}

export function interpolateTemplate(template: string, state: RuntimeScope, scope: RuntimeScope = {}): string {
  return template.replace(/\$([a-zA-Z0-9_.]+)/g, (match, key) => {
    const value = getPath(key, scope) ?? getPath(key, state);
    return value === undefined || value === null ? match : String(value);
  });
}

export function getPath(path: string, source: RuntimeScope): unknown {
  const clean = path.replace(/^\$/, '');
  const parts = clean.split('.');
  let value: unknown = source;

  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[part];
  }

  return value;
}
