import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { runNpm } from './run-workspace-command.mjs';

const root = process.cwd();
const rootDist = resolve(root, 'dist');
const clientDist = resolve(root, 'apps', 'client', 'dist');

runNpm(['run', 'build:packages']);
runNpm(['run', 'prisma:generate', '--workspace=@sirohi/api']);
runNpm(['run', 'build', '--workspace=@sirohi/api']);
runNpm(['run', 'export:web', '--workspace=@sirohi/client']);

await rm(rootDist, { recursive: true, force: true });
await mkdir(resolve(rootDist, 'client'), { recursive: true });
await mkdir(resolve(rootDist, 'server'), { recursive: true });
await mkdir(resolve(rootDist, '.openai'), { recursive: true });
await cp(clientDist, resolve(rootDist, 'client'), { recursive: true });
await cp(resolve(root, '.openai', 'hosting.json'), resolve(rootDist, '.openai', 'hosting.json'));

const worker = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;
    const accept = request.headers.get('accept') || '';
    if (!accept.includes('text/html')) return response;
    const fallback = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallback, request));
  },
};
export default worker;
`;

await writeFile(resolve(rootDist, 'server', 'index.js'), worker, 'utf8');

const hosting = JSON.parse(await readFile(resolve(root, '.openai', 'hosting.json'), 'utf8'));
const manifest = {
  name: 'Sirohi Point',
  project_id: hosting.project_id,
  client: 'Expo SDK 57 / React Native Web',
};
await writeFile(resolve(rootDist, 'server', 'build-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
