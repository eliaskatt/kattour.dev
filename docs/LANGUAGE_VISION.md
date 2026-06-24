# Kattour Language Vision

Kattour must become a language that designers, programmers, AI tools, and product builders enjoy using.

The website design can stay stable. The focus now is the language itself: clarity, safety, expressiveness, tooling, and production output.

## Target Users

- Designers who want to describe interfaces without writing HTML/CSS noise.
- Frontend developers who want clean UI structure and predictable output.
- Backend/full-stack developers who want dashboards and admin panels fast.
- AI agents that need a strict, readable, easy-to-generate UI language.
- Founders and product builders who want websites, apps, and dashboards quickly.

## Core Direction

Kattour should be:

- Human-readable.
- AI-friendly.
- Strict enough to avoid broken output.
- Simple for designers.
- Powerful enough for real apps.
- Safe by default.
- Compiler-first, not template-hack-first.

## Syntax Principles

Use modern block syntax only:

```kattour
page Home

state user = "Elias"

route "/" {
  section {
    title "Welcome, $user"
    text "Build interfaces with clarity."
  }
}
```

Avoid legacy YAML-like syntax for new language development:

```yaml
module: Hero
content:
  title: Example
```

Legacy examples may remain visually on the old website, but the compiler, docs, playground, and VSCode extension should prefer the block syntax.

## Language Layers

### 1. Pages

```kattour
page Dashboard
```

### 2. State

```kattour
state count = 0
state user = { name: "Elias", role: "admin" }
```

### 3. Computed Values

```kattour
computed greeting = "Hello, " + $user.name
```

### 4. Routes

```kattour
route "/orders/:id" {
  section {
    title "Order $route.params.id"
  }
}
```

### 5. Components

```kattour
component StatCard(label, value) {
  card {
    text "$label"
    title "$value"
  }
}
```

### 6. Modules

```kattour
module PricingSection {
  plan "Starter" price "€19"
  plan "Pro" price "€49" featured true
}
```

### 7. Events

```kattour
button "Add" {
  click count++
}
```

### 8. Effects

```kattour
effect onMount {
  fetch "/api/orders" into orders
}
```

## Safety Rules

Kattour must be safe by design:

- Escape user text by default.
- No arbitrary JavaScript execution inside templates.
- Strict parser errors instead of silent failures.
- No unsafe HTML unless explicitly marked and sanitized.
- URL validation for href/src values.
- Component props must be typed.
- Events must be restricted to known actions.
- Runtime must not eval user content.

## AI-Friendly Rules

Kattour should be easy for AI tools to generate correctly:

- Small grammar.
- Predictable blocks.
- Few special cases.
- Clear diagnostics.
- Stable examples.
- Strong formatter.
- Canonical patterns for common UIs.

Example prompt target:

```kattour
module AdminDashboard {
  stats {
    stat "Revenue" "€48.2K"
    stat "Orders" "1.2K"
    stat "Users" "8.4K"
  }

  table "Recent orders" {
    column "Customer"
    column "Status"
    column "Total"
  }
}
```

## What Kattour Must Build Well

- Landing pages.
- Portfolio sites.
- SaaS dashboards.
- Admin panels.
- Food delivery interfaces.
- Booking systems.
- CRM screens.
- Checkout flows.
- AI chat apps.
- Mobile-first app screens.
- Documentation portals.
- Internal tools.

## Compiler Roadmap

### Phase 1: Strict parser

- Tokenizer.
- Parser.
- AST.
- Source locations.
- Diagnostics.
- Syntax errors with line and column.

### Phase 2: Renderer

- HTML renderer.
- Component renderer.
- Module renderer.
- Safe escaping.
- Responsive output.
- Theme tokens.

### Phase 3: Tooling

- Formatter.
- Linter.
- VSCode diagnostics.
- Autocomplete.
- Hover docs.
- Snippets.
- Playground AST viewer.

### Phase 4: Production

- Build command.
- Static export.
- Asset pipeline.
- Route generation.
- SEO metadata.
- Accessibility checks.
- Performance checks.

## CLI Roadmap

```bash
kattour create my-app
kattour dev app.kat
kattour build app.kat
kattour check app.kat
kattour format app.kat
kattour preview dist
```

## VSCode Extension Roadmap

- Syntax highlighting.
- Snippets.
- Formatter.
- Diagnostics.
- Autocomplete.
- Hover documentation.
- Quick fixes.
- Open in Playground.
- Compile current file.

## Product Rule

From now on, design changes should be conservative.

Language development should be aggressive.

The old website design can stay, while the language becomes stronger underneath.
