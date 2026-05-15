export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeAttribute(value: unknown): string {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

export function isSafeUrl(value: string): boolean {
  const url = value.trim().toLowerCase();
  if (!url) return true;
  if (url.startsWith('/') || url.startsWith('#')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return true;
  return false;
}

export function safeUrl(value: unknown): string {
  const raw = String(value ?? '');
  return isSafeUrl(raw) ? raw : '#unsafe-url-blocked';
}

export function attrsToString(attrs: Record<string, unknown>): string {
  return Object.entries(attrs)
    .filter(([, value]) => value !== false && value !== null && value !== undefined)
    .map(([key, value]) => value === true ? escapeAttribute(key) : `${escapeAttribute(key)}="${escapeAttribute(value)}"`)
    .join(' ');
}

export function tag(name: string, attrs: Record<string, unknown>, content = '', selfClosing = false): string {
  const renderedAttrs = attrsToString(attrs);
  const open = renderedAttrs ? `<${name} ${renderedAttrs}` : `<${name}`;
  if (selfClosing) return `${open} />`;
  return `${open}>${content}</${name}>`;
}
