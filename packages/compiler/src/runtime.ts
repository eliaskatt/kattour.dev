export const browserRuntime = `
const KattourRuntime = (() => {
  const state = window.__KATTOUR_STATE__ || {};
  const computed = window.__KATTOUR_COMPUTED__ || {};
  const effects = window.__KATTOUR_EFFECTS__ || [];
  const routes = window.__KATTOUR_ROUTES__ || {};
  const dependencies = new Map();
  const effectRuns = new Map();

  // Detect base path so routing works on GitHub Pages sub-paths like /kattour.dev/
  const BASE = (() => {
    const path = window.location.pathname;
    const keys = Object.keys(routes).filter(k => k !== '/').sort((a, b) => b.length - a.length);
    for (const route of keys) {
      if (path === route) return '';
      if (path.endsWith(route)) return path.slice(0, -route.length);
    }
    if ('/' in routes) return path === '/' ? '' : path.replace(/\\/$/, '');
    return '';
  })();

  function stripBase(pathname) {
    if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/';
    return pathname;
  }

  function withBase(path) {
    if (!path || !path.startsWith('/')) return path;
    return BASE + path;
  }

  function getPath(path, source = state) {
    return String(path).split('.').reduce((value, part) => value && value[part], source);
  }

  function setPath(path, value, source = state) {
    const parts = String(path).split('.');
    const last = parts.pop();
    let target = source;
    for (const part of parts) {
      target[part] = target[part] || {};
      target = target[part];
    }
    target[last] = value;
  }

  function interpolate(template) {
    return String(template).replace(/\\$([a-zA-Z0-9_.]+)/g, (_, key) => {
      const value = getPath(key);
      return value === undefined || value === null ? '' : String(value);
    });
  }

  function keysFromTemplate(template) {
    const keys = new Set();
    String(template).replace(/\\$([a-zA-Z0-9_.]+)/g, (_, key) => {
      keys.add(key);
      return '';
    });
    return [...keys];
  }

  function evaluateComputed(expression) {
    return String(expression)
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
    for (const [key, expression] of Object.entries(computed)) setPath(key, evaluateComputed(expression));
  }

  function registerDependency(key, updater) {
    if (!dependencies.has(key)) dependencies.set(key, new Set());
    dependencies.get(key).add(updater);
  }

  function resetHydrationDeps() {
    dependencies.clear();
  }

  function hydrateTextNode(node) {
    const template = node.dataset.kText;
    const update = () => { node.textContent = interpolate(template); };
    for (const key of keysFromTemplate(template)) registerDependency(key, update);
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

  function runEffect(effect, changedKey, initial = false) {
    const effectId = JSON.stringify(effect);
    const lastRunKey = effectId + ':' + changedKey + ':' + initial;
    if (effectRuns.get(lastRunKey)) return;
    effectRuns.set(lastRunKey, true);
    queueMicrotask(() => effectRuns.delete(lastRunKey));

    for (const action of effect.body || []) {
      if (action.name === 'log') console.log(interpolate(action.value));
      if (action.name === 'warn') console.warn(interpolate(action.value));
      if (action.name === 'error') console.error(interpolate(action.value));
      if (action.name === 'go') navigate(interpolate(action.value));
    }
  }

  function runEffects(changedKey, initial = false) {
    for (const effect of effects) {
      const deps = effect.dependencies || [];
      if (initial || deps.some(dep => dep === changedKey || dep.startsWith(changedKey + '.') || changedKey.startsWith(dep + '.'))) runEffect(effect, changedKey, initial);
    }
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
    runEffects(key, false);
  }

  function setState(path, value) {
    setPath(path, value);
    notify(path);
  }

  function routePatternToRegex(pattern) {
    const names = [];
    const escaped = pattern
      .replace(/\\//g, '\\\\/')
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        names.push(name);
        return '([^/]+)';
      });
    return { regex: new RegExp('^' + escaped + '$'), names };
  }

  function matchRoute(pathname) {
    if (routes[pathname]) return { html: routes[pathname], params: {}, pattern: pathname };
    for (const [pattern, html] of Object.entries(routes)) {
      const { regex, names } = routePatternToRegex(pattern);
      const match = pathname.match(regex);
      if (!match) continue;
      const params = {};
      names.forEach((name, index) => params[name] = decodeURIComponent(match[index + 1]));
      return { html, params, pattern };
    }
    return null;
  }

  function renderRoute(pathname = window.location.pathname) {
    const root = document.getElementById('kattour-root');
    if (!root || Object.keys(routes).length === 0) return false;
    const stripped = stripBase(pathname);
    const route = matchRoute(stripped) || matchRoute('/') || null;
    if (!route) return false;
    setPath('route.path', stripped);
    setPath('route.pattern', route.pattern);
    setPath('route.params', route.params);
    root.innerHTML = route.html;
    hydrate(false);
    return true;
  }

  function navigate(path, options = {}) {
    const target = withBase(String(path || '/'));
    if (!options.replace) window.history.pushState({}, '', target);
    else window.history.replaceState({}, '', target);
    renderRoute(window.location.pathname);
    runEffects('route.path', false);
  }

  function hydrate(runInitialEffects = true) {
    recompute();
    resetHydrationDeps();
    document.querySelectorAll('[data-k-text]').forEach(hydrateTextNode);
    document.querySelectorAll('[data-k-bind]').forEach(hydrateBoundInput);
    if (runInitialEffects) runEffects('*', true);
  }

  document.addEventListener('input', (event) => {
    const target = event.target.closest('[data-k-bind]');
    if (!target) return;
    setState(target.dataset.kBind, target.value);
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-k-link]');
    if (link) {
      event.preventDefault();
      navigate(link.dataset.kLink);
      return;
    }

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
    if (action.startsWith('go ')) navigate(interpolate(action.slice(3).trim()));
    if (action.startsWith('go(') && action.endsWith(')')) navigate(interpolate(action.slice(3, -1).trim().replace(/^"|"$/g, '')));
  });

  window.addEventListener('popstate', () => {
    renderRoute(window.location.pathname);
    runEffects('route.path', false);
  });

  return {
    hydrate,
    getState: () => state,
    setState,
    runEffects,
    navigate,
    matchRoute,
    renderRoute,
    preloadRoute: (path) => Promise.resolve(routes[path] || null),
    ssrRoute: (path) => (matchRoute(path) || {}).html || ''
  };
})();

if (Object.keys(window.__KATTOUR_ROUTES__ || {}).length > 0) KattourRuntime.renderRoute(window.location.pathname);
else KattourRuntime.hydrate();
window.KattourRuntime = KattourRuntime;
`;
