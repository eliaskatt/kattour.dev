export const builtInComponents = [
  'screen',
  'column',
  'row',
  'text',
  'button',
  'input',
  'card'
] as const;

export type BuiltInComponent = typeof builtInComponents[number];
