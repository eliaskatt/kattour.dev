# Playground Implementation Notes

## Next UI improvements
- add an example selector
- add copy source button
- add output tabs for HTML and AST
- add clearer error messaging

## Compiler integration
The playground should import the public compiler module and avoid legacy paths over time.

## Honesty rule
The new playground should only expose features that the compiler actually supports.
