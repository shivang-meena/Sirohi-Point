import { runNpm } from './run-workspace-command.mjs';

runNpm(['run', 'build:packages']);
for (const workspace of ['@sirohi/client', '@sirohi/api']) {
  runNpm(['run', 'typecheck', `--workspace=${workspace}`]);
}
