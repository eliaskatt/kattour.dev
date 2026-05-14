# Kattour Language for VSCode

VSCode support for the Kattour UI language.

## Features

- `.kat` file support
- `.kattour` file support
- Syntax highlighting
- Snippets
- Comment support
- Bracket pairing
- Basic formatter command
- Open Playground command

## Commands

Open the Command Palette and run:

```text
Kattour: Format File
Kattour: Open Playground
```

## Supported Syntax

```kattour
page Home

state count = 0

route "/" {
  column {
    title "Hello Kattour"
    text "Readable UI language"
    button "Start"
  }
}
```

## Development

```bash
npm install
npm run build
```

## Package

```bash
npm run package
```

This creates a `.vsix` file that can be installed manually in VSCode.
