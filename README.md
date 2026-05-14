# Kattour

Kattour is an experimental programming language and platform focused on building modern user interfaces with clarity, speed, and a clean developer experience.

This repository is being upgraded into a real language platform with a compiler pipeline, runtime, CLI, playground, official website, and structured documentation.

## Official preview

GitHub Pages preview:

```text
https://eliaskatt.github.io/kattour.dev/
```

Deployment source:

```text
gh-pages branch
```

If the page does not show yet, enable GitHub Pages in repository settings:

```text
Settings → Pages → Build and deployment → Deploy from a branch → gh-pages / root
```

## Current workflow policy

To avoid email spam while the compiler is still under heavy development:

- `deploy-pages.yml` runs on push and deploys only the static official website.
- `check-compiler.yml` is manual only.
- `release.yml` is manual only.

This keeps the public website stable while the language core evolves.

## Direction

Kattour is evolving toward:

- a real language specification
- a parser and compiler pipeline
- a runtime for rendering UI
- a modern playground
- versioned documentation
- a package ecosystem over time

## Core goals

- Make UI construction easier to read
- Reduce friction for prototyping and product design
- Provide a cleaner mental model than scattered HTML, CSS, and JavaScript
- Build a serious developer platform instead of a static demo

## Planned architecture

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

## Key documents

- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/WEBSITE_REBUILD_PLAN.md`
- `specs/LANGUAGE_SPEC_V1.md`

## Current phase

The current phase focuses on making Kattour publicly visible first, then stabilizing the compiler and playground without breaking deployment.

## Author

Led by Elias Kattour.
