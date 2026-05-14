import * as vscode from 'vscode';

const PLAYGROUND_URL = 'https://eliaskatt.github.io/kattour.dev/playground/index.html';

export function activate(context: vscode.ExtensionContext) {
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

    vscode.window.showInformationMessage('Kattour file formatted.');
  });

  const playgroundCommand = vscode.commands.registerCommand('kattour.openPlayground', async () => {
    await vscode.env.openExternal(vscode.Uri.parse(PLAYGROUND_URL));
  });

  context.subscriptions.push(formatCommand, playgroundCommand);
}

export function deactivate() {}

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
