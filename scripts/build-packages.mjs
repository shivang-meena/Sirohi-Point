import { runNpm } from './run-workspace-command.mjs';

for (const workspace of ['@sirohi/contracts', '@sirohi/domain', '@sirohi/design-tokens']) {
  runNpm(['run', 'build', `--workspace=${workspace}`]);
}
