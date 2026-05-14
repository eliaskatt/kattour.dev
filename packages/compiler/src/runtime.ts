export const browserRuntime = `
function getPath(path, source) {
  return path.split('.').reduce((value, part) => value && value[part], source);
}

function interpolate(template, state) {
  return template.replace(/\\$([a-zA-Z0-9_.]+)/g, (_, key) => {
    const value = getPath(key, state);
    return value === undefined || value === null ? '' : String(value);
  });
}

function updateBindings() {
  document.querySelectorAll('[data-k-text]').forEach((node) => {
    const template = node.dataset.kText;
    node.textContent = interpolate(template, window.__KATTOUR_STATE__);
  });

  document.querySelectorAll('[data-k-bind]').forEach((node) => {
    const key = node.dataset.kBind;
    const value = getPath(key, window.__KATTOUR_STATE__);

    if ('value' in node && node.value !== String(value ?? '')) {
      node.value = value ?? '';
    }
  });
}

function setState(path, value) {
  window.__KATTOUR_STATE__[path] = value;
  updateBindings();
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
    setState(key, Number(window.__KATTOUR_STATE__[key] || 0) + 1);
  }

  if (action.endsWith('--')) {
    const key = action.replace('--', '').trim();
    setState(key, Number(window.__KATTOUR_STATE__[key] || 0) - 1);
  }
});

updateBindings();
`;
