# Playground Integration Plan

## Goal
Move from a generic YAML-based browser demo to a real Kattour compile and preview flow.

## Steps
1. read source from the editor
2. tokenize the source
3. parse tokens into AST
4. collect diagnostics
5. render preview HTML from AST
6. show diagnostics beside the preview

## First deliverable
A minimal playground app that compiles simple Kattour examples such as:
- hello screen
- login screen
- dashboard screen

## Constraints
- keep iteration fast
- avoid overengineering the first preview path
- prefer a small but honest implementation over a flashy fake one
