import { compileDocument, formatDiagnostics } from '../../../packages/compiler/src/public';
import { renderPreview } from '../../../packages/runtime/src/renderPreview';
import { demoSource } from './demo';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function mountPlayground(root: HTMLElement) {
  root.innerHTML = `
    <div class="kattour-shell">
      <section class="kattour-panel">
        <h2>Editor</h2>
        <textarea id="kattour-editor"></textarea>
        <button id="kattour-compile">Compile</button>
      </section>
      <section class="kattour-panel">
        <h2>Diagnostics</h2>
        <pre id="kattour-diagnostics"></pre>
      </section>
      <section class="kattour-panel">
        <h2>Preview</h2>
        <iframe id="kattour-preview"></iframe>
      </section>
      <section class="kattour-panel">
        <h2>AST</h2>
        <pre id="kattour-ast"></pre>
      </section>
    </div>
  `;

  const editor = root.querySelector<HTMLTextAreaElement>('#kattour-editor');
  const button = root.querySelector<HTMLButtonElement>('#kattour-compile');
  const diagnostics = root.querySelector<HTMLElement>('#kattour-diagnostics');
  const preview = root.querySelector<HTMLIFrameElement>('#kattour-preview');
  const ast = root.querySelector<HTMLElement>('#kattour-ast');

  if (!editor || !button || !diagnostics || !preview || !ast) {
    throw new Error('Playground mount failed');
  }

  editor.value = demoSource;

  const run = () => {
    const result = compileDocument(editor.value);
    diagnostics.textContent = formatDiagnostics(result.diagnostics);
    ast.textContent = JSON.stringify(result.ast, null, 2);
    preview.srcdoc = renderPreview(result.html);
  };

  button.addEventListener('click', run);
  editor.addEventListener('input', run);
  run();
}
