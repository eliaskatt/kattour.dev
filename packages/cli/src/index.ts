#!/usr/bin/env node

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

type KattourCompiler = {
  compile: (source: string) => string;
};

const args = process.argv.slice(2);
const command = args[0];

void main();

async function main() {
  if (!command) {
    printHelp();
    process.exit(0);
  }

  if (command === 'build') {
    await build(args[1] || 'app.kat');
  } else if (command === 'dev') {
    await dev(args[1] || 'app.kat');
  } else if (command === 'create') {
    create(args[1] || 'my-kattour-app');
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

async function loadCompiler(): Promise<KattourCompiler> {
  const compiler = await import('@kattour/compiler');
  const api = compiler as unknown as Partial<KattourCompiler>;

  if (typeof api.compile !== 'function') {
    fail('Installed @kattour/compiler does not export compile().');
  }

  return api as KattourCompiler;
}

async function build(entry: string) {
  const input = path.resolve(process.cwd(), entry);

  if (!fs.existsSync(input)) {
    fail(`File not found: ${input}`);
  }

  const { compile } = await loadCompiler();
  const source = fs.readFileSync(input, 'utf-8');
  const html = compile(source);
  const outDir = path.resolve(process.cwd(), 'dist');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  console.log(`Kattour built: ${path.join(outDir, 'index.html')}`);
}

async function dev(entry: string) {
  const input = path.resolve(process.cwd(), entry);
  const port = Number(process.env.PORT || 5179);

  if (!fs.existsSync(input)) {
    fail(`File not found: ${input}`);
  }

  const { compile } = await loadCompiler();
  const clients = new Set<http.ServerResponse>();

  const server = http.createServer((req, res) => {
    if (req.url === '/__kattour/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });

      res.write('\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    try {
      const source = fs.readFileSync(input, 'utf-8');
      const html = injectReloadClient(compile(source));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error instanceof Error ? error.message : String(error));
    }
  });

  fs.watch(input, { persistent: true }, () => {
    for (const client of clients) {
      client.write('event: reload\n');
      client.write('data: reload\n\n');
    }
  });

  server.listen(port, () => {
    console.log(`Kattour dev: http://localhost:${port}`);
    console.log(`Watching: ${input}`);
  });
}

function create(name: string) {
  const root = path.resolve(process.cwd(), name);
  const src = `page Home

theme {
  primary "#cb0606"
  radius 18
}

state count = 0
state user = {
  name: "Elias"
}

view {
  screen {
    column {
      title "Hello $user.name"

      button "Count: $count" {
        click count++
      }
    }
  }
}
`;

  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, 'app.kat'), src);
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name,
    private: true,
    scripts: {
      dev: 'kattour dev app.kat',
      build: 'kattour build app.kat'
    }
  }, null, 2));

  console.log(`Created ${name}`);
}

function injectReloadClient(html: string): string {
  const script = `<script>
const source = new EventSource('/__kattour/events');
source.addEventListener('reload', () => location.reload());
</script>`;

  return html.replace('</body>', `${script}</body>`);
}

function printHelp() {
  console.log(`Kattour CLI

Commands:
  kattour create <name>
  kattour dev <file>
  kattour build <file>`);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
  throw new Error(message);
}
