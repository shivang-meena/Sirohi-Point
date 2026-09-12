import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

export function runNpm(args, options = {}) {
  const executable = process.platform === 'win32' ? process.execPath : 'npm';
  const executableArgs = process.platform === 'win32'
    ? [resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'), ...args]
    : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: options.cwd ?? process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    if (result.error) console.error(result.error);
    process.exit(result.status ?? 1);
  }
}
