import * as vscode from 'vscode';

const PLAYGROUND_URL = 'https://eliaskatt.github.io/kattour.dev/playground/index.html';
let diagnostics: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  diagnostics = vscode.languages.createDiagnosticCollection('kattour');
  context.subscriptions.push(diagnostics);

  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) refreshDiagnostics(editor.document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      refreshDiagnostics(event.document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnostics.delete(document.uri);
    })
  );

  const formatCommand = vscode.commands.registerCommand('kattour.formatFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'kattour') {
      vscode.window.showWarningMessage('Open a Kattour file first.');
      return;
    }

    const text = editor.document.getText();
    const formatted = formatKattour(text);
    const fullRange = new vscode.Range(
      editor.document.positionAt(0),
      editor.document.positionAt(text.length)
    );

    await editor.edit((editBuilder) => {
      editBuilder.replace(fullRange, formatted);
    });

    refreshDiagnostics(editor.document);
    vscode.window.showInformationMessage('Kattour file formatted.');
  });

  const playgroundCommand = vscode.commands.registerCommand('kattour.openPlayground', async () => {
    await vscode.env.openExternal(vscode.Uri.parse(PLAYGROUND_URL));
  });

  context.subscriptions.push(formatCommand, playgroundCommand);
}

export function deactivate() {
  diagnostics?.dispose();
}

function refreshDiagnostics(document: vscode.TextDocument) {
  if (document.languageId !== 'kattour') return;

  const found: vscode.Diagnostic[] = [];
  const text = document.getText();

  addLegacySyntaxDiagnostics(document, text, found);
  addBraceDiagnostics(document, text, found);
  addPageDiagnostic(document, text, found);

  diagnostics.set(document.uri, found);
}

function addLegacySyntaxDiagnostics(document: vscode.TextDocument, text: string, found: vscode.Diagnostic[]) {
  const legacyPatterns = [/^\s*module\s*:/gm, /^\s*type\s*:/gm, /^\s*features\s*:/gm, /^\s*-\s+[a-zA-Z]+\s*:/gm];

  for (const pattern of legacyPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const start = document.positionAt(match.index);
      const end = document.positionAt(match.index + match[0].length);
      found.push(new vscode.Diagnostic(
        new vscode.Range(start, end),
        'Legacy YAML-like syntax is not supported. Use new Kattour block syntax only.',
        vscode.DiagnosticSeverity.Error
      ));
    }
  }
}

function addBraceDiagnostics(document: vscode.TextDocument, text: string, found: vscode.Diagnostic[]) {
  let balance = 0;
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const char of line) {
      if (char === '{') balance += 1;
      if (char === '}') balance -= 1;
    }

    if (balance < 0) {
      found.push(new vscode.Diagnostic(
        new vscode.Range(index, 0, index, Math.max(1, line.length)),
        'Unexpected closing brace.',
        vscode.DiagnosticSeverity.Error
      ));
      balance = 0;
    }
  });

  if (balance > 0) {
    const lastLine = Math.max(0, document.lineCount - 1);
    found.push(new vscode.Diagnostic(
      new vscode.Range(lastLine, 0, lastLine, Math.max(1, document.lineAt(lastLine).text.length)),
      'Missing closing brace.',
      vscode.DiagnosticSeverity.Warning
    ));
  }
}

function addPageDiagnostic(document: vscode.TextDocument, text: string, found: vscode.Diagnostic[]) {
  if (!text.trim()) return;
  if (!/^\s*page\s+[A-Za-z_][A-Za-z0-9_]*\b/m.test(text)) {
    const firstLine = document.lineAt(0);
    found.push(new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, Math.max(1, firstLine.text.length)),
      'Kattour files should start with a page declaration, for example: page Home',
      vscode.DiagnosticSeverity.Warning
    ));
  }
}

function formatKattour(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let indent = 0;
  const output: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (output[output.length - 1] !== '') output.push('');
      continue;
    }

    if (trimmed.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }

    output.push(`${'  '.repeat(indent)}${trimmed}`);

    if (trimmed.endsWith('{')) {
      indent += 1;
    }
  }

  return output.join('\n').trimEnd() + '\n';
}
