import { runNpm } from './run-workspace-command.mjs';

runNpm(['run', 'build:packages']);
runNpm(['run', 'test', '--workspace=@sirohi/domain']);
runNpm(['run', 'test', '--workspace=@sirohi/api', '--', '--runInBand']);
runNpm(['run', 'test:e2e', '--workspace=@sirohi/api', '--', '--runInBand']);
runNpm(['run', 'typecheck']);
runNpm(['run', 'build']);
runNpm(['run', 'test:artifact']);
