export { tokenize } from './lexer/tokenize';
export { parseTokens } from './parser/parseTokens';
export { renderHtml } from './renderer/renderHtml';
export { formatDiagnostics } from './diagnostics/formatDiagnostics';
export { compileDocument } from './compile';

import { compile } from './compiler';
import { parse } from './parser';
import { tokenize as runtimeTokenize } from './tokenizer';

export interface CompileResult {
  ok: boolean;
  html: string;
  ast: unknown;
  tokens: unknown[];
  diagnostics: string[];
}

export function compileKattour(source: string): CompileResult {
  try {
    const tokens = runtimeTokenize(source);
    const ast = parse(source);
    const html = compile(source);

    return {
      ok: true,
      html,
      ast,
      tokens,
      diagnostics: []
    };
  } catch (error) {
    return {
      ok: false,
      html: '',
      ast: null,
      tokens: [],
      diagnostics: [error instanceof Error ? error.message : String(error)]
    };
  }
}

export function astToJson(source: string): string {
  return JSON.stringify(parse(source), null, 2);
}

export type {
  Token,
  TokenType,
  Diagnostic,
  KattourNode,
  KattourDocument,
  ScreenNode,
  ElementNode
} from './types';
