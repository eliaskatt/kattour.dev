import { compile } from '../../../packages/compiler/src/compiler';
import { parse } from '../../../packages/compiler/src/parser';

const EXAMPLES: { category: string; items: { name: string; code: string }[] }[] = [
  {
    category: 'Basics',
    items: [
      {
        name: 'Hello World',
        code: `page "Hello World"

view {
  screen {
    column {
      title "Hello, World!"
      text "Welcome to Kattour."
    }
  }
}
`
      },
      {
        name: 'Counter',
        code: `page "Counter"

state count = 0

view {
  screen {
    column {
      title "Counter"
      text count
      row {
        button "+" { click count++ }
        button "-" { click count-- }
      }
    }
  }
}
`
      },
      {
        name: 'Input & State',
        code: `page "Input"

state name = ""

computed greeting = "Hello, " + name

view {
  screen {
    column {
      title "Greeting"
      input {
        placeholder "Your name"
        bind name
      }
      text greeting
    }
  }
}
`
      }
    ]
  },
  {
    category: 'Layout',
    items: [
      {
        name: 'Cards Grid',
        code: `page "Cards"

view {
  screen {
    column {
      title "Features"
      row {
        card {
          title "Fast"
          text "Compiles instantly to HTML."
        }
        card {
          title "Simple"
          text "Minimal syntax, maximum clarity."
        }
        card {
          title "Powerful"
          text "Full routing, state, and effects."
        }
      }
    }
  }
}
`
      },
      {
        name: 'Navigation',
        code: `page "Nav Demo"

component NavBar {
  nav {
    link "Home" { to "/" }
    link "Docs" { to "/docs" }
    button "Get Started" { variant primary }
  }
}

route "/" {
  screen {
    NavBar
    hero {
      title "Build UIs with Kattour"
      subtitle "A clarity-first language for building interfaces."
      button "Get Started" { click go "/install" }
    }
  }
}
`
      }
    ]
  },
  {
    category: 'Routing',
    items: [
      {
        name: 'Multi-page App',
        code: `page "My App"

route "/" {
  screen {
    column {
      title "Home"
      text "Welcome to my app!"
      button "Go to About" { click go "/about" }
    }
  }
}

route "/about" {
  screen {
    column {
      title "About"
      text "This is built with Kattour."
      button "Back Home" { click go "/" }
    }
  }
}
`
      }
    ]
  },
  {
    category: 'Data',
    items: [
      {
        name: 'Todo List',
        code: `page "Todo"

state todos = ["Buy groceries", "Walk the dog", "Read a book"]
state newTodo = ""

view {
  screen {
    column {
      title "My Todos"
      for todo in todos {
        row {
          text todo
        }
      }
      row {
        input {
          placeholder "New task..."
          bind newTodo
        }
        button "Add" { click todos.push(newTodo) }
      }
    }
  }
}
`
      },
      {
        name: 'Conditional',
        code: `page "Conditional"

state loggedIn = false

view {
  screen {
    column {
      title "Auth Demo"
      if loggedIn {
        text "Welcome back!"
        button "Log Out" { click loggedIn = false }
      } else {
        text "Please log in."
        button "Log In" { click loggedIn = true }
      }
    }
  }
}
`
      }
    ]
  },
  {
    category: 'Advanced',
    items: [
      {
        name: 'Theme',
        code: `page "Themed App"

theme {
  primary #7c6af7
  background #0a0a0b
  text #e8e8f0
  radius 12px
}

view {
  screen {
    hero {
      eyebrow "Kattour Theme"
      title "Custom Themes"
      subtitle "Design tokens via the theme block."
      button "Learn More" { variant primary }
    }
    section {
      title "Features"
      row {
        card {
          title "Design Tokens"
          text "Colors, radii, fonts — all in one place."
        }
        card {
          title "Dark Mode"
          text "Dark-first by default."
        }
      }
    }
  }
}
`
      },
      {
        name: 'Full Landing',
        code: `page "Landing"

component NavBar {
  nav {
    link "Home" { to "/" }
    link "Docs" { to "/docs" }
    link "Examples" { to "/examples" }
    button "Get Started" { variant primary }
  }
}

component Footer {
  footer {
    text "© 2025 Kattour"
  }
}

route "/" {
  screen {
    NavBar
    hero {
      eyebrow "Build faster"
      title "The clarity-first UI language"
      subtitle "Kattour lets you express interfaces as data, not markup."
      actions {
        button "Get Started" { variant primary  click go "/install" }
        button "View Docs"   { click go "/docs" }
      }
    }
    section "Features" {
      row {
        feature {
          title "Zero boilerplate"
          body "No JSX, no templates, no config. Just structure."
        }
        feature {
          title "Built-in routing"
          body "Define routes directly in your .kat file."
        }
        feature {
          title "Reactive state"
          body "Declare state and it just works."
        }
      }
    }
    Footer
  }
}
`
      }
    ]
  }
];

const editor = document.getElementById('editor') as HTMLTextAreaElement;
const previewFrame = document.getElementById('preview-frame') as HTMLIFrameElement;
const outputPanel = document.getElementById('output-panel') as HTMLDivElement;
const astPanel = document.getElementById('ast-panel') as HTMLDivElement;
const outputCode = document.getElementById('output-code') as HTMLPreElement;
const astCode = document.getElementById('ast-code') as HTMLPreElement;
const statusMsg = document.getElementById('status-msg') as HTMLSpanElement;
const statusInfo = document.getElementById('status-info') as HTMLSpanElement;
const exampleList = document.getElementById('example-list') as HTMLDivElement;

let activeExampleBtn: HTMLButtonElement | null = null;

// Build sidebar
for (const group of EXAMPLES) {
  const cat = document.createElement('div');
  cat.className = 'example-category';
  cat.textContent = group.category;
  exampleList.appendChild(cat);

  for (const ex of group.items) {
    const btn = document.createElement('button');
    btn.className = 'example-item';
    btn.textContent = ex.name;
    btn.addEventListener('click', () => {
      editor.value = ex.code;
      activeExampleBtn?.classList.remove('active');
      btn.classList.add('active');
      activeExampleBtn = btn;
      runCompile();
    });
    exampleList.appendChild(btn);
  }
}

// Tab switching
document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab!;
    previewFrame.style.display = tab === 'preview' ? 'block' : 'none';
    outputPanel.style.display = tab === 'html' ? 'flex' : 'none';
    astPanel.style.display = tab === 'ast' ? 'flex' : 'none';
  });
});

let compileTimer: ReturnType<typeof setTimeout> | null = null;

function runCompile() {
  const src = editor.value;
  const t0 = performance.now();

  try {
    const html = compile(src);
    const elapsed = (performance.now() - t0).toFixed(1);

    previewFrame.srcdoc = html;
    outputCode.textContent = html;

    try {
      const ast = parse(src);
      astCode.textContent = JSON.stringify(ast, null, 2);
    } catch {
      astCode.textContent = '(parse error)';
    }

    statusMsg.className = 'status-ok';
    statusMsg.textContent = `Compiled in ${elapsed}ms`;
    statusInfo.textContent = `${src.split('\n').length} lines`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    previewFrame.srcdoc = errorPage(msg);
    statusMsg.className = 'status-err';
    statusMsg.textContent = `Error: ${msg}`;
  }
}

function errorPage(msg: string): string {
  return `<!DOCTYPE html><html><head><style>
body{margin:0;background:#0a0a0b;color:#ff4455;font-family:monospace;padding:24px}
h2{color:#e8e8f0;margin-bottom:12px}pre{white-space:pre-wrap;font-size:13px}
</style></head><body><h2>Compiler Error</h2><pre>${msg.replace(/</g, '&lt;')}</pre></body></html>`;
}

editor.addEventListener('input', () => {
  if (compileTimer) clearTimeout(compileTimer);
  compileTimer = setTimeout(runCompile, 300);
});

// Load first example
const firstBtn = exampleList.querySelector<HTMLButtonElement>('.example-item');
if (firstBtn) firstBtn.click();
