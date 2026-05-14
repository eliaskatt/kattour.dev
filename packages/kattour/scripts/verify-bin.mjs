import fs from 'node:fs';
import path from 'node:path';

const bin = path.resolve('bin/kattour.js');

if (!fs.existsSync(bin)) {
  console.error('Missing kattour executable');
  process.exit(1);
}

console.log('Kattour package ready');
