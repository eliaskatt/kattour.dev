export const browserRuntime = `
const KattourRuntime = (() => {
  const state = window.__KATTOUR_STATE__ || {};
  const computed = window.__KATTOUR_COMPUTED__ || {};
  const dependencies = new Map();

  function getPath(path, source = state) {
    return path.split('.').reduce((value, part) => value && value[part], source);
  }

  function setPath(path, value, source = state) {
    const parts = path.split('.');
    const last = parts.pop();
    let target = source;

    for (const part of parts) {
      target[part] = target[part] || {};
      target = target[part];
    }

    target[last] = value;
  }

  function interpolate(template) {
    return template.replace(/\\$([a-zA-Z0-9_.]+)/g, (_, key) => {
      const value = getPath(key);
      return value === undefined || value === null ? '' : String(value);
    });
  }

  function keysFromTemplate(template) {
    const keys = new Set();
    template.replace(/\\$([a-zA-Z0-9_.]+)/g, (_, key) => {
      keys.add(key);
      return '';
    });
    return [...keys];
  }

  function evaluateComputed(expression) {
    return expression
      .split('+')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        if (part.startsWith('"') && part.endsWith('"')) return part.slice(1, -1);
        if (part.startsWith('$')) return getPath(part.slice(1)) ?? '';
        return part;
      })
      .join('');
  }

  function recompute() {
    for (const [key, expression] of Object.entries(computed)) {
      setPath(key, evaluateComputed(expression));
    }
  }

  function registerDependency(key, updater) {
    if (!dependencies.has(key)) dependencies.set(key, new Set());
    dependencies.get(key).add(updater);
  }

  function hydrateTextNode(node) {
    const template = node.dataset.kText;
    const update = () => {
      node.textContent = interpolate(template);
    };

    for (const key of keysFromTemplate(template)) {
      registerDependency(key, update);
    }

    update();
  }

  function hydrateBoundInput(node) {
    const key = node.dataset.kBind;
    const update = () => {
      const value = getPath(key);
      if ('value' in node && node.value !== String(value ?? '')) node.value = value ?? '';
    };

    registerDependency(key, update);
    update();
  }

  function notify(key) {
    recompute();

    const affected = new Set();

    for (const [dependency, updaters] of dependencies.entries()) {
      if (dependency === key || dependency.startsWith(key + '.') || key.startsWith(dependency + '.')) {
        for (const updater of updaters) affected.add(updater);
      }
    }

    for (const computedKey of Object.keys(computed)) {
      const updaters = dependencies.get(computedKey);
      if (!updaters) continue;
      for (const updater of updaters) affected.add(updater);
    }

    for (const updater of affected) updater();
  }

  function setState(path, value) {
    setPath(path, value);
    notify(path);
  }

  function hydrate() {
    recompute();
    document.querySelectorAll('[data-k-text]').forEach(hydrateTextNode);
    document.querySelectorAll('[data-k-bind]').forEach(hydrateBoundInput);
  }

  document.addEventListener('input', (event) => {
    const target = event.target.closest('[data-k-bind]');
    if (!target) return;
    setState(target.dataset.kBind, target.value);
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-k-click]');
    const action = target && target.dataset.kClick;
    if (!action) return;

    if (action.endsWith('++')) {
      const key = action.replace('++', '').trim();
      setState(key, Number(getPath(key) || 0) + 1);
    }

    if (action.endsWith('--')) {
      const key = action.replace('--', '').trim();
      setState(key, Number(getPath(key) || 0) - 1);
    }
  });

  return {
    hydrate,
    getState: () => state,
    setState
  };
})();

KattourRuntime.hydrate();
window.KattourRuntime = KattourRuntime;
`;
