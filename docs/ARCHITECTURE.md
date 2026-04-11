# Kattour Architecture

## Purpose

Kattour should evolve from a static showcase into a structured language platform.

## Architectural layers

### 1. Language specification
Defines syntax, semantics, keywords, grammar rules, and supported constructs.

### 2. Compiler
Responsible for:
- tokenization
- parsing
- AST generation
- diagnostics
- semantic analysis
- code generation

### 3. Runtime
Provides the execution model for rendering UI from compiled Kattour output.

### 4. CLI
Handles project creation, development commands, build workflows, formatting, and diagnostics.

### 5. Website and Playground
Public-facing interfaces for documentation, examples, and live experimentation.

## Target repository shape

```text
apps/
  website/
  playground/
packages/
  compiler/
  runtime/
  stdlib/
  ui/
  cli/
docs/
examples/
specs/
```

## Immediate priorities

1. Formalize syntax and grammar
2. Create compiler package boundaries
3. Replace generic YAML parsing in the playground with Kattour parsing
4. Rebuild the website on a maintainable app architecture
5. Preserve current visual identity while improving internal quality
