import { compileDocument } from '../../../packages/compiler/src/compile';

export const demoSource = `screen Home {
  column {
    text "Welcome to Kattour"
    button "Start"
  }
}`;

export function runDemo() {
  return compileDocument(demoSource);
}
