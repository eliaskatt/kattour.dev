export const homepageSections = {
  features: [
    {
      title: 'Language-first UI design',
      body: 'Kattour is being built around a readable syntax and a cleaner mental model for interface construction.'
    },
    {
      title: 'Real compiler direction',
      body: 'The project now includes tokenizer, parser, diagnostics, preview rendering, and structured compiler modules.'
    },
    {
      title: 'Honest product architecture',
      body: 'The repository is moving into apps, packages, docs, specs, and examples instead of staying a static showcase.'
    }
  ],
  roadmap: [
    'formalize the language specification',
    'stabilize the compiler entry path',
    'improve the new playground experience',
    'rebuild the website on the new app path',
    'replace the older legacy static flow gradually'
  ]
} as const;
