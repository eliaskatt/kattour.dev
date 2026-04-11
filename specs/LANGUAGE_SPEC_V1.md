# Kattour Language Specification v1

## Intent
Kattour v1 is focused on declarative UI construction.

## Design principles
- readable syntax
- minimal noise
- structured UI composition
- progressive evolution toward a full language platform

## Initial constructs
- `screen`
- `column`
- `row`
- `text`
- `button`
- `input`
- `card`

## Example

```kattour
screen Home {
  column {
    text "Welcome to Kattour"
    button "Start"
  }
}
```

## Parsing direction
Kattour should have its own tokenizer and parser. It should not depend on raw YAML as its long-term execution model.

## Near-term grammar direction
- named screens
- nested blocks
- string values
- simple properties
- component trees

## Future additions
- props
- conditions
- loops
- state
- imports
- modules
- diagnostics with source positions
