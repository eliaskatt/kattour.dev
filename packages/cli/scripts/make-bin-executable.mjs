import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('dist/index.js');

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf-8');

  if (!content.startsWith('#!/usr/bin/env node')) {
    fs.writeFileSync(file, `#!/usr/bin/env node\n${content}`);
  }

  fs.chmodSync(file, 0o755);
}
