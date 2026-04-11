export function renderHomepage(): string {
  return `
    <main class="site-shell">
      <header class="site-header">
        <div class="brand-row">
          <div class="brand-mark">K</div>
          <div>
            <p class="brand-name">Kattour</p>
            <p class="brand-tag">Language Platform</p>
          </div>
        </div>
        <nav class="site-nav">
          <a href="#what">What</a>
          <a href="#syntax">Syntax</a>
          <a href="#examples">Examples</a>
          <a href="#roadmap">Roadmap</a>
          <a href="../playground/index.html">Playground</a>
        </nav>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Declarative UI, cleaner thinking</p>
          <h1>Build interfaces with Kattour, not with a mess of scattered layers.</h1>
          <p class="hero-text">
            Kattour is evolving from a visual demo into a real language platform with a compiler,
            runtime, playground, and a structured product architecture.
          </p>
          <div class="hero-actions">
            <a class="primary-button" href="../playground/index.html">Open Playground</a>
            <a class="secondary-button" href="../../docs/ROADMAP.md">View Roadmap</a>
          </div>
        </div>
        <div class="hero-code">
          <pre><code>screen Landing {
  column {
    text "Build with Kattour"
    text "A language for clear UI construction"
    row {
      button "Get Started"
      button "View Examples"
    }
  }
}</code></pre>
        </div>
      </section>

      <section id="what" class="grid-section">
        <article class="panel">
          <h2>What Kattour is</h2>
          <p>
            A language-first platform for describing UI with a cleaner mental model.
            The long-term goal is a real parser and compiler, not a dressed-up generic format.
          </p>
        </article>
        <article class="panel">
          <h2>What is being fixed</h2>
          <p>
            The project is moving away from static showcase patterns toward a proper monorepo with
            apps, packages, documentation, specs, examples, and compiler modules.
          </p>
        </article>
        <article class="panel">
          <h2>Why it matters</h2>
          <p>
            If Kattour wants to compete seriously, it needs honest architecture, not only attractive pages.
          </p>
        </article>
      </section>

      <section id="syntax" class="split-section">
        <div class="panel">
          <h2>Syntax direction</h2>
          <p>
            The syntax is being shaped around screens, elements, nesting, and readable structure.
            Early built-ins include screen, column, row, text, button, input, and card.
          </p>
        </div>
        <div class="panel">
          <h2>Compiler path</h2>
          <ul>
            <li>tokenize source</li>
            <li>parse tokens into AST</li>
            <li>collect diagnostics</li>
            <li>render HTML preview</li>
          </ul>
        </div>
      </section>

      <section id="examples" class="examples-section">
        <div class="section-heading">
          <p class="eyebrow">Examples</p>
          <h2>Early Kattour screens</h2>
        </div>
        <div class="examples-grid">
          <article class="panel">
            <h3>Hello</h3>
            <pre><code>screen Home {
  column {
    text "Welcome to Kattour"
    button "Start"
  }
}</code></pre>
          </article>
          <article class="panel">
            <h3>Login</h3>
            <pre><code>screen Login {
  column {
    text "Welcome Back"
    input "Email"
    input "Password"
    button "Sign In"
  }
}</code></pre>
          </article>
          <article class="panel">
            <h3>Dashboard</h3>
            <pre><code>screen Dashboard {
  column {
    text "Kattour Dashboard"
    button "Refresh"
  }
}</code></pre>
          </article>
        </div>
      </section>

      <section id="roadmap" class="roadmap-section panel">
        <p class="eyebrow">Roadmap</p>
        <h2>Current momentum</h2>
        <ol>
          <li>Define architecture and language direction</li>
          <li>Build monorepo structure</li>
          <li>Create compiler foundation</li>
          <li>Build a real playground path</li>
          <li>Replace the legacy static demo over time</li>
        </ol>
      </section>
    </main>
  `;
}
