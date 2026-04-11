import { tokenize } from './lexer/tokenize';
import { parseTokens } from './parser/parseTokens';
import { renderHtml } from './renderer/renderHtml';
import type { Diagnostic, KattourDocument } from './types';

export type KattourCompilePipelineResult = {
  ast: KattourDocument;
  diagnostics: Diagnostic[];
  html: string;
};

export function compileDocument(source: string): KattourCompilePipelineResult {
  const tokens = tokenize(source);
  const { ast, diagnostics } = parseTokens(tokens);
  const html = diagnostics.length === 0 ? renderHtml(ast) : '';

  return {
    ast,
    diagnostics,
    html
  };
}
