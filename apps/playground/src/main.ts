import { compileDocument } from '../../../packages/compiler/src/compile';

const demo = `screen Home {
  column {
    text "Welcome to Kattour"
    button "Start"
  }
}`;

const result = compileDocument(demo);

console.log('Kattour Playground Result');
console.log(result.ast);
console.log(result.html);
