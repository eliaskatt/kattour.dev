export const heroContent = {
  eyebrow: 'Declarative UI, cleaner thinking',
  title: 'Build interfaces with Kattour, not with a mess of scattered layers.',
  body: 'Kattour is evolving from a visual demo into a real language platform with a compiler, runtime, playground, and a structured product architecture.'
} as const;

export const exampleCards = [
  {
    title: 'Hello',
    code: `screen Home {\n  column {\n    text \"Welcome to Kattour\"\n    button \"Start\"\n  }\n}`
  },
  {
    title: 'Login',
    code: `screen Login {\n  column {\n    text \"Welcome Back\"\n    input \"Email\"\n    input \"Password\"\n    button \"Sign In\"\n  }\n}`
  },
  {
    title: 'Dashboard',
    code: `screen Dashboard {\n  column {\n    text \"Kattour Dashboard\"\n    button \"Refresh\"\n  }\n}`
  }
] as const;
