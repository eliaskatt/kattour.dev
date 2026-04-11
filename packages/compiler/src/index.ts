export type KattourCompileResult = {
  ast: unknown;
  diagnostics: string[];
};

export function compile(source: string): KattourCompileResult {
  return {
    ast: {
      kind: 'Document',
      source
    },
    diagnostics: []
  };
}
