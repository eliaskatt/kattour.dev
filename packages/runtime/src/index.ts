export function renderDocument(ast: unknown): string {
  return JSON.stringify(ast, null, 2);
}
