# Kattour Development Plan

Kattour is being developed as a full UI language ecosystem, not only a website.

## Vision

Kattour should become a readable, product-first UI language with a compiler, runtime, templates, components, playground, documentation, and editor tooling.

The goal is simple:

```text
Kattour code -> AST -> Renderer -> Web UI -> future native targets
```

## Core Principles

- New Kattour block syntax only.
- No YAML-like syntax.
- No mixed legacy parser.
- Every example must run in the playground.
- Every template must include preview, Kattour source, generated HTML, and docs.
- The website must feel like a real framework platform.

## Phase 1: Website Platform

### Pages

- Home
- Docs
- Playground
- Examples
- Templates
- Components
- Showcase
- Themes
- Benchmarks
- Install
- Roadmap
- Integrations
- Community

### Improvements

- Shared design system CSS
- Shared navigation
- Shared footer
- SVG preview images
- Template detail pages
- Component detail pages
- Mobile polishing
- SEO metadata
- Sitemap
- 404 page

## Phase 2: Template Marketplace

### Template Categories

- AI SaaS
- Food Delivery
- Analytics Dashboard
- CRM
- POS
- E-commerce
- Agency
- Portfolio
- Fintech Wallet
- LMS
- Booking Platform
- Internal Tool
- Restaurant Website
- Real Estate Portal
- Healthcare Dashboard
- Fitness App
- Travel Booking
- Logistics Dashboard
- Chat App
- Kanban App
- Invoice System
- Job Board
- Marketplace
- Event Platform
- News Portal
- Admin Panel
- Landing Page Kit
- SaaS Billing Portal
- Support Desk
- Inventory System
- Delivery Driver App

### Template Requirements

Each template must include:

- preview page
- Kattour source
- generated HTML preview
- open in playground button
- responsive screenshot or SVG
- component list
- routes list
- state model

## Phase 3: Components System

### Component Categories

- Buttons
- Inputs
- Forms
- Cards
- Navbars
- Sidebars
- Tabs
- Tables
- Badges
- Alerts
- Toasts
- Modals
- Drawers
- Dropdowns
- Command Menu
- Pricing Cards
- Stats Cards
- Charts
- Timelines
- Avatars
- Breadcrumbs
- Pagination
- Empty States
- Uploaders
- Date Pickers
- Calendar
- Chat Bubbles
- Product Cards
- Order Cards
- Invoice Blocks
- Activity Feeds

## Phase 4: Compiler

### Compiler Pipeline

```text
source -> tokenizer -> parser -> AST -> diagnostics -> renderer
```

### Compiler Features

- tokenizer
- parser
- AST schema
- diagnostics
- source positions
- formatter
- code generation
- runtime renderer
- hydration plan
- SSR output

## Phase 5: Playground

### Features

- Monaco editor
- syntax highlighting
- autocomplete
- snippets
- diagnostics
- AST viewer
- generated HTML viewer
- live preview
- shareable links
- template launcher
- component launcher
- export HTML

## Phase 6: VSCode Extension

### Extension Features

- .kat file support
- syntax highlighting
- snippets
- formatter command
- diagnostics
- hover documentation
- autocomplete
- file icon
- run playground command
- compile current file command

### Extension Structure

```text
tools/vscode-extension/
  package.json
  README.md
  syntaxes/kattour.tmLanguage.json
  snippets/kattour.json
  language-configuration.json
  src/extension.ts
```

## Phase 7: CLI

### CLI Commands

```text
kattour create my-app
kattour dev app.kat
kattour build app.kat
kattour format app.kat
kattour check app.kat
kattour playground app.kat
```

## Phase 8: Release

- npm package
- GitHub release
- VSCode Marketplace package
- documentation versioning
- changelog
- template downloads

## Success Standard

Kattour is not ready when the website looks nice.

Kattour is ready when:

- users can install it
- write .kat files
- get syntax highlighting
- run examples
- use templates
- edit in playground
- compile to HTML
- deploy output

