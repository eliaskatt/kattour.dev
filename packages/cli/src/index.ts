export function runCli(args: string[]): string {
  if (args.length === 0) {
    return 'kattour: no command provided';
  }

  return `kattour: ${args.join(' ')}`;
}
