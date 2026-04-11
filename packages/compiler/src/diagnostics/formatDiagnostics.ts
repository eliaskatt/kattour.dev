import type { Diagnostic } from '../types';

export function formatDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'No diagnostics';
  }

  return diagnostics
    .map((diagnostic, index) => {
      const location = diagnostic.position !== undefined ? ` at ${diagnostic.position}` : '';
      return `${index + 1}. ${diagnostic.message}${location}`;
    })
    .join('\n');
}
